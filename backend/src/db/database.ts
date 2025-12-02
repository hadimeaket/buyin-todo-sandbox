import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(__dirname, "../../data/todos.db");

let database: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!database) {
    database = new Database(dbPath);
  }
  return database;
}

export function initializeDatabase(): void {
  const db = getDatabase();
  
  // Create users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT,
      provider TEXT NOT NULL DEFAULT 'local',
      providerId TEXT,
      name TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )
  `);

  // Create categories table
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      userId TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create index on categories userId
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_categories_userId ON categories(userId)
  `);

  // Create todos table with userId and categoryId foreign keys
  db.exec(`
    CREATE TABLE IF NOT EXISTS todos (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      categoryId TEXT,
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
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE SET NULL
    )
  `);

  // Create index on userId for faster queries
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_todos_userId ON todos(userId)
  `);

  console.log("Database initialized successfully");
}

export function closeDatabase(): void {
  if (database) {
    database.close();
    database = null;
  }
}
