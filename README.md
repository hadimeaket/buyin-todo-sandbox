# Todo Application

A full-stack todo application built with React, TypeScript, Node.js, and Express.

## Technology Stack

### Backend

- **Runtime**: Node.js 20 LTS
- **Language**: TypeScript
- **Framework**: Express.js
- **Testing**: Jest
- **Dependencies**: CORS, dotenv, UUID

### Frontend

- **Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **Testing**: Vitest + React Testing Library
- **Deployment**: Nginx (in Docker)

### DevOps

- **Containerization**: Docker
- **Orchestration**: Docker Compose

## Repository Structure

```
.
├── backend/                 # Node.js backend server
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Data models and DTOs
│   │   ├── repositories/    # Data access layer
│   │   ├── routes/          # API routes
│   │   └── server.ts        # Application entry point
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── frontend/                # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── services/        # API service layer
│   │   ├── types/           # TypeScript type definitions
│   │   ├── App.tsx          # Main application component
│   │   └── main.tsx         # Application entry point
│   ├── Dockerfile
│   ├── nginx.conf           # Nginx configuration
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml       # Docker orchestration
├── .gitignore
└── README.md
```

## Running Locally (Without Docker)

### Prerequisites

- Node.js 20 or higher
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file (optional):

```bash
cp .env.example .env
```

4. Run in development mode:

```bash
npm run dev
```

The backend will start on `http://localhost:4000`

5. Run tests:

```bash
npm test
```

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file (optional):

```bash
cp .env.example .env
```

4. Run in development mode (with hot reload):

```bash
npm run dev
```

The frontend will start on `http://localhost:5173` with hot reload enabled.

5. Run tests:

```bash
npm test
```

## Running with Docker Compose

### Prerequisites

- Docker
- Docker Compose

### Development Mode (with Hot Reload)

Build and start all services in development mode:

```bash
docker-compose up -d --build
```

Or just start (if already built):

```bash
docker-compose up -d
```

The frontend runs with Vite dev server and hot reload enabled. Any changes to files in `frontend/src/` will automatically reload in the browser.

### Access the Application

- **Frontend**: http://localhost:5173 (Development with hot reload)
- **Backend API**: http://localhost:4000
- **Health Check**: http://localhost:4000/api/health

### Production Mode

For production deployment without hot reload, update `docker-compose.yml`:

1. Change `dockerfile: Dockerfile.dev` to `dockerfile: Dockerfile`
2. Change port mapping from `5173:5173` to `80:80`
3. Remove the `volumes` section from the frontend service
4. Remove the `CHOKIDAR_USEPOLLING` environment variable

Then rebuild:

```bash
docker-compose up -d --build
```

Access at: http://localhost

### View Logs

View logs from all services:

```bash
docker-compose logs -f
```

View logs from a specific service:

```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Stop Services

Stop services:

```bash
docker-compose stop
```

Stop and remove containers, networks:

```bash
docker-compose down
```

Stop and remove everything including images:

```bash
docker-compose down --rmi all
```

## API Endpoints

### Health Check

- **GET** `/api/health` - Check API health status
  - Response: `{ status: "ok", timestamp: "...", uptime: 123.45 }`

### Todos

- **GET** `/api/todos` - Get all todos

  - Response: Array of todo objects

- **GET** `/api/todos/:id` - Get a specific todo by ID

  - Response: Todo object or 404

- **POST** `/api/todos` - Create a new todo

  - Request Body: `{ "title": "Todo title" }`
  - Response: Created todo object

- **PUT** `/api/todos/:id` - Update a todo

  - Request Body: `{ "title": "New title", "completed": true }`
  - Response: Updated todo object or 404

- **PATCH** `/api/todos/:id/toggle` - Toggle todo completion status

  - Response: Updated todo object or 404

- **DELETE** `/api/todos/:id` - Delete a todo
  - Response: 204 No Content or 404

### Todo Object Structure

```json
{
  "id": "uuid-string",
  "title": "Todo title",
  "completed": false,
  "createdAt": "2025-11-15T10:30:00.000Z",
  "updatedAt": "2025-11-15T10:30:00.000Z"
}
```

## Development

### Backend Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests

### Frontend Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests
- `npm run lint` - Run ESLint

## Testing

### Backend Tests

The backend uses Jest for testing. Tests are located alongside the source files with `.test.ts` extension.

Run tests:

```bash
cd backend
npm test
```

### Frontend Tests

The frontend uses Vitest and React Testing Library. Tests are located alongside components with `.test.tsx` extension.

Run tests:

```bash
cd frontend
npm test
```

Run tests with UI:

```bash
npm run test:ui
```

## Architecture Notes

### Backend Architecture

- **Repository Pattern**: Data access is abstracted through repositories for easy replacement of storage mechanisms
- **Controller Pattern**: Business logic is separated from route handlers
- **Middleware**: Centralized error handling and request logging
- **In-Memory Storage**: Currently uses an in-memory array (easily replaceable with a database)

### Frontend Architecture

- **Component-Based**: Modular React components with single responsibility
- **Service Layer**: API calls are abstracted in a dedicated service layer
- **Type Safety**: Full TypeScript coverage with strict type checking
- **State Management**: React hooks (useState, useEffect) for local state

## Future Enhancements

- [ ] Add database persistence (PostgreSQL, MongoDB)
- [ ] Implement user authentication and authorization
- [ ] Add todo categories/tags
- [ ] Implement due dates and reminders
- [ ] Add todo search and filtering
- [ ] Implement pagination for large todo lists
- [ ] Add unit tests for controllers
- [ ] Add E2E tests with Playwright or Cypress
- [ ] Implement CI/CD pipeline
- [ ] Add monitoring and logging (e.g., Winston, Prometheus)

## License

ISC
