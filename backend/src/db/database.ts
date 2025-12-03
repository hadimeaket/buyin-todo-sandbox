import Database from "better-sqlite3";
import * as fs from "fs";
import * as path from "path";

let db: Database.Database | null = null;

/**
 * Initialize SQLite database connection and create schema
 */
export function initDatabase(): Database.Database {
  if (db) {
    return db;
  }

  const dbPath =
    process.env.DATABASE_PATH || path.join(__dirname, "../../data/todos.db");

  // Ensure directory exists
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // Create database connection
  db = new Database(dbPath);

  // Enable foreign keys
  db.pragma("foreign_keys = ON");

  // Create users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      passwordHash TEXT NOT NULL,
      createdAt TEXT NOT NULL
    )
  `);

  // Create categories table
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      userId INTEGER NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(name, userId)
    )
  `);

  // Create todos table
  db.exec(`
    CREATE TABLE IF NOT EXISTS todos (
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
      recurrence TEXT DEFAULT 'none',
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      userId INTEGER,
      categoryId TEXT,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE SET NULL
    )
  `);

  // Add userId column if it doesn't exist (for existing databases)
  try {
    db.exec(`ALTER TABLE todos ADD COLUMN userId INTEGER`);
  } catch (error) {
    // Column already exists, ignore error
  }

  // Add categoryId column if it doesn't exist (for existing databases)
  try {
    db.exec(`ALTER TABLE todos ADD COLUMN categoryId TEXT`);
  } catch (error) {
    // Column already exists, ignore error
  }

  // Create indexes for common queries
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_categories_userId ON categories(userId);
    CREATE INDEX IF NOT EXISTS idx_todos_userId ON todos(userId);
    CREATE INDEX IF NOT EXISTS idx_todos_categoryId ON todos(categoryId);
    CREATE INDEX IF NOT EXISTS idx_todos_completed ON todos(completed);
    CREATE INDEX IF NOT EXISTS idx_todos_dueDate ON todos(dueDate);
    CREATE INDEX IF NOT EXISTS idx_todos_priority ON todos(priority);
  `);

  return db;
}

/**
 * Get database instance (must call initDatabase first)
 */
export function getDatabase(): Database.Database {
  if (!db) {
    return initDatabase();
  }
  return db;
}

/**
 * Close database connection
 */
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}

/**
 * Convert Date object to ISO string for storage
 */
export function dateToString(date: Date | undefined): string | null {
  return date ? date.toISOString() : null;
}

/**
 * Convert ISO string to Date object
 */
export function stringToDate(str: string | null | undefined): Date | undefined {
  return str ? new Date(str) : undefined;
}

/**
 * Convert boolean to SQLite integer (0 or 1)
 */
export function boolToInt(value: boolean): number {
  return value ? 1 : 0;
}

/**
 * Convert SQLite integer to boolean
 */
export function intToBool(value: number): boolean {
  return value === 1;
}
