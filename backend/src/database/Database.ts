import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dbDir = path.join(__dirname, "../../data");
const dbPath = path.join(dbDir, "todos.db");

// Ensure data directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

class DatabaseConnection {
  private database: Database.Database;

  constructor() {
    this.database = new Database(dbPath);

    // Enable foreign keys
    this.database.pragma("foreign_keys = ON");

    // Create users table
    this.database.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        isVerified INTEGER NOT NULL DEFAULT 0,
        verificationToken TEXT,
        verificationTokenExpiry TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      )
    `);

    // Create categories table
    this.database.exec(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        name TEXT NOT NULL,
        color TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(userId, name)
      )
    `);

    // Create todos table with userId and categoryId foreign keys
    this.database.exec(`
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
        recurrence TEXT DEFAULT 'none',
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE SET NULL
      )
    `);

    // Create attachments table
    this.database.exec(`
      CREATE TABLE IF NOT EXISTS attachments (
        id TEXT PRIMARY KEY,
        todoId TEXT NOT NULL,
        filename TEXT NOT NULL,
        originalFilename TEXT NOT NULL,
        mimeType TEXT NOT NULL,
        fileSize INTEGER NOT NULL,
        filePath TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (todoId) REFERENCES todos(id) ON DELETE CASCADE
      )
    `);
  }

  prepare(sql: string): any {
    return this.database.prepare(sql);
  }

  exec(sql: string): any {
    return this.database.exec(sql);
  }

  pragma(pragma: string, options?: any): any {
    return this.database.pragma(pragma, options);
  }
}

export default new DatabaseConnection();
