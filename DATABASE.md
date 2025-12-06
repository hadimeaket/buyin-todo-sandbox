# Database Setup - SQLite with Docker Volumes

## Overview

The application uses **SQLite** as the database with **Docker volumes** for persistent storage. This ensures your todos are saved even when containers are stopped, restarted, or recreated.

## How It Works

### SQLite Database
- **Location in container**: `/app/data/todos.db`
- **Database library**: `better-sqlite3` (native Node.js SQLite binding)
- **Features**: 
  - WAL mode enabled for better concurrent access
  - Automatic schema creation on first run
  - Full CRUD operations for todos

### Docker Volume Persistence
- **Volume name**: `buyin-todo-sandbox_todo-data`
- **Mount point**: `/app/data` in the backend container
- **Storage**: Managed by Docker on your host machine

The volume persists independently of container lifecycle:
- ✅ Survives `docker-compose restart`
- ✅ Survives `docker-compose down` and `docker-compose up`
- ✅ Survives container rebuilds with `docker-compose up --build`

## Database Schema

```sql
CREATE TABLE todos (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  completed INTEGER NOT NULL DEFAULT 0,
  priority TEXT NOT NULL DEFAULT 'medium',
  dueDate TEXT,
  dueEndDate TEXT,
  isAllDay INTEGER DEFAULT 1,
  startTime TEXT,
  endTime TEXT,
  recurrence TEXT NOT NULL DEFAULT 'none',
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
)
```

## Commands

### View todos in database
```bash
# Access the database directly
docker exec -it todo-backend sh
cd /app/data
sqlite3 todos.db "SELECT * FROM todos;"
```

### Backup database
```bash
# Copy database file from container to host
docker cp todo-backend:/app/data/todos.db ./backup-todos.db
```

### Restore database
```bash
# Copy backup into container
docker cp ./backup-todos.db todo-backend:/app/data/todos.db
docker-compose restart backend
```

### Reset database (delete all data)
```bash
# WARNING: This will delete all todos permanently
docker volume rm buyin-todo-sandbox_todo-data
docker-compose up -d
```

## Testing Persistence

1. Create some todos:
```bash
curl -X POST http://localhost:4000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Todo", "description": "Testing persistence"}'
```

2. Verify todos exist:
```bash
curl http://localhost:4000/api/todos
```

3. Restart containers:
```bash
docker-compose down
docker-compose up -d
```

4. Verify todos still exist:
```bash
curl http://localhost:4000/api/todos
```

## Development vs Production

- **Production**: Uses SQLite with persistent volume
- **Tests**: Uses in-memory repository (no persistence needed)
  - Set `NODE_ENV=test` to use in-memory storage

## Troubleshooting

### Database file not found
If you see "database not initialized" errors:
1. Check volume is mounted: `docker inspect todo-backend | grep Mounts -A 10`
2. Check permissions: `docker exec todo-backend ls -la /app/data`
3. Restart backend: `docker-compose restart backend`

### Data not persisting
1. Verify volume exists: `docker volume ls | grep todo`
2. Check volume mount in docker-compose.yml
3. Ensure `/app/data` directory is writable by `nodejs` user

### Performance issues
SQLite with WAL mode should handle typical todo app loads easily. If you experience issues:
1. Check disk space: `docker system df`
2. Consider vacuuming database: `docker exec todo-backend sqlite3 /app/data/todos.db "VACUUM;"`
