import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// Database file path - store in data volume for persistence
const DB_PATH = path.join(__dirname, "../../data/todos.db");

let dbInstance: Database.Database | null = null;

// Get or create database connection
export const getDb = (): Database.Database => {
  if (!dbInstance) {
    // Ensure the data directory exists
    const dataDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      console.log(`📁 Created data directory: ${dataDir}`);
    }

    // Initialize database connection
    dbInstance = new Database(DB_PATH);
    console.log(`📁 Database connected: ${DB_PATH}`);

    // Enable foreign keys and WAL mode for better concurrency
    dbInstance.pragma("foreign_keys = ON");
    dbInstance.pragma("journal_mode = WAL");
  }

  return dbInstance;
};

// Initialize database tables
export const initializeDatabase = (): void => {
  const db = getDb();

  // Create users table
  const createUsersTableSQL = `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      is_verified INTEGER NOT NULL DEFAULT 0,
      verification_token TEXT,
      token_expiry TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `;

  // Create categories table
  const createCategoriesTableSQL = `
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, name)
    )
  `;

  // Create todos table with user_id and category_id foreign keys
  const createTodosTableSQL = `
    CREATE TABLE IF NOT EXISTS todos (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      category_id TEXT,
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
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    )
  `;

  // Create indices for better query performance
  const createUserIdIndexSQL = `
    CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id)
  `;

  const createCategoryUserIdIndexSQL = `
    CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id)
  `;

  const createTodosCategoryIdIndexSQL = `
    CREATE INDEX IF NOT EXISTS idx_todos_category_id ON todos(category_id)
  `;

  // Create attachments table
  const createAttachmentsTableSQL = `
    CREATE TABLE IF NOT EXISTS attachments (
      id TEXT PRIMARY KEY,
      todo_id TEXT NOT NULL,
      filename TEXT NOT NULL,
      original_filename TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      mime_type TEXT NOT NULL,
      uploaded_at TEXT NOT NULL,
      FOREIGN KEY (todo_id) REFERENCES todos(id) ON DELETE CASCADE
    )
  `;

  const createAttachmentsTodoIdIndexSQL = `
    CREATE INDEX IF NOT EXISTS idx_attachments_todo_id ON attachments(todo_id)
  `;

  db.exec(createUsersTableSQL);
  db.exec(createCategoriesTableSQL);
  db.exec(createTodosTableSQL);
  db.exec(createAttachmentsTableSQL);
  db.exec(createUserIdIndexSQL);
  db.exec(createCategoryUserIdIndexSQL);
  db.exec(createTodosCategoryIdIndexSQL);
  db.exec(createAttachmentsTodoIdIndexSQL);
  
  console.log("✅ Database initialized successfully");
};

// Graceful shutdown
export const closeDatabase = (): void => {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
    console.log("✅ Database connection closed");
  }
};
