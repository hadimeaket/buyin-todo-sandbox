import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, "../../data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "todos.db");

// Initialize database connection
export const db: Database.Database = new Database(dbPath);

// Enable foreign keys
db.pragma("foreign_keys = ON");

// Create database tables
export function initializeDatabase(): void {
  // Create users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      passwordHash TEXT NOT NULL,
      createdAt TEXT NOT NULL
    )
  `);

  // Create todos table with userId foreign key
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
      isAllDay INTEGER,
      startTime TEXT,
      endTime TEXT,
      recurrence TEXT DEFAULT 'none',
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      CHECK (completed IN (0, 1)),
      CHECK (priority IN ('low', 'medium', 'high')),
      CHECK (recurrence IN ('none', 'daily', 'weekly', 'monthly', 'yearly')),
      CHECK (isAllDay IS NULL OR isAllDay IN (0, 1))
    )
  `);
}

// Close database connection
export function closeDatabase(): void {
  db.close();
}
