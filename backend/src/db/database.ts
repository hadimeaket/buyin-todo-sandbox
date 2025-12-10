import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

let db: Database.Database;

export function initDatabase(): Database.Database {
  const dbPath = path.join(__dirname, "../../data/todos.db");
  const dbDir = path.dirname(dbPath);

  // Create data directory if it doesn't exist
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  db = new Database(dbPath);

  // Create users table if not exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )
  `);

  // Create categories table if not exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create todos table if not exists
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

  return db;
}

export function getDatabase(): Database.Database {
  if (!db) {
    return initDatabase();
  }
  return db;
}

export function closeDatabase(): void {
  if (db) {
    db.close();
  }
}
