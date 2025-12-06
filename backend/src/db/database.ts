import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

let db: Database.Database | null = null;

export function initDatabase(): Database.Database {
  // Use environment variable for database path, default to data directory
  const dataDir = process.env.DB_PATH || path.join(process.cwd(), "data");
  
  // Ensure data directory exists
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, "todos.db");
  
  console.log(`Initializing SQLite database at: ${dbPath}`);
  
  db = new Database(dbPath);
  
  // Enable WAL mode for better concurrent access
  db.pragma("journal_mode = WAL");
  
  // Create users table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )
  `);
  
  // Create categories table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      userId TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  
  // Create index on userId for categories
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_categories_userId ON categories(userId)
  `);
  
  // Create todos table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS todos (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
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
      categoryId TEXT,
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
  
  // Create index on categoryId for faster queries
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_todos_categoryId ON todos(categoryId)
  `);
  
  // Create attachments table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS attachments (
      id TEXT PRIMARY KEY,
      todoId TEXT NOT NULL,
      userId TEXT NOT NULL,
      filename TEXT NOT NULL,
      originalName TEXT NOT NULL,
      mimeType TEXT NOT NULL,
      size INTEGER NOT NULL,
      path TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (todoId) REFERENCES todos(id) ON DELETE CASCADE,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  
  // Create index on todoId for faster queries
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_attachments_todoId ON attachments(todoId)
  `);
  
  // Create index on userId for faster queries
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_attachments_userId ON attachments(userId)
  `);
  
  console.log("Database initialized successfully");
  
  return db;
}

export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error("Database not initialized. Call initDatabase() first.");
  }
  return db;
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
    console.log("Database connection closed");
  }
}
