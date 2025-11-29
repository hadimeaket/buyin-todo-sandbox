import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "../../data");
const DB_PATH = path.join(DATA_DIR, "todos.db");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize database
const db: Database.Database = new Database(DB_PATH);

// Enable foreign keys and WAL mode for better performance
db.pragma("foreign_keys = ON");
db.pragma("journal_mode = WAL");

// Create users table
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`);

// Drop and recreate todos table with user_id (simplified migration)
db.exec(`
  DROP TABLE IF EXISTS todos
`);

db.exec(`
  CREATE TABLE todos (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    completed INTEGER NOT NULL DEFAULT 0,
    priority TEXT NOT NULL DEFAULT 'medium',
    due_date TEXT,
    due_end_date TEXT,
    is_all_day INTEGER DEFAULT 1,
    start_time TEXT,
    end_time TEXT,
    recurrence TEXT NOT NULL DEFAULT 'none',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`);

// Create index for faster user queries
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id)
`);

// Create attachments table
db.exec(`
  CREATE TABLE IF NOT EXISTS attachments (
    id TEXT PRIMARY KEY,
    todo_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (todo_id) REFERENCES todos(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`);

// Create indexes for attachments
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_attachments_todo_id ON attachments(todo_id)
`);

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_attachments_user_id ON attachments(user_id)
`);

// Insert default demo user if not exists
const DEFAULT_USER_ID = "demo-user";
const now = new Date().toISOString();

const existingUser = db
  .prepare("SELECT id FROM users WHERE id = ?")
  .get(DEFAULT_USER_ID);

if (!existingUser) {
  db.prepare(
    `INSERT INTO users (id, email, password_hash, name, created_at, updated_at) 
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(
    DEFAULT_USER_ID,
    "demo@example.com",
    "dummy-hash-will-be-replaced",
    "Demo User",
    now,
    now
  );
  console.log(`Default demo user created: ${DEFAULT_USER_ID}`);
}

console.log(`SQLite database initialized at ${DB_PATH}`);

export { DEFAULT_USER_ID };
export default db;
