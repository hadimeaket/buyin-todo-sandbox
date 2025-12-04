"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
// Ensure data directory exists
const dataDir = path_1.default.join(__dirname, "../../data");
if (!(0, fs_1.existsSync)(dataDir)) {
    (0, fs_1.mkdirSync)(dataDir, { recursive: true });
}
// Initialize database
const dbPath = path_1.default.join(dataDir, "todos.db");
const db = new better_sqlite3_1.default(dbPath);
exports.db = db;
// Enable foreign keys
db.pragma("foreign_keys = ON");
// Create users table
const createUsersTableSQL = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  passwordHash TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
)`;
db.exec(createUsersTableSQL);
db.exec(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
// Create todos table
const createTodosTableSQL = `
CREATE TABLE IF NOT EXISTS todos (
  id TEXT PRIMARY KEY,
  userId TEXT,
  title TEXT NOT NULL,
  description TEXT,
  completed INTEGER DEFAULT 0,
  priority TEXT DEFAULT 'medium',
  dueDate TEXT,
  dueEndDate TEXT,
  isAllDay INTEGER DEFAULT 1,
  startTime TEXT,
  endTime TEXT,
  recurrence TEXT DEFAULT 'none',
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
)`;
db.exec(createTodosTableSQL);
// Add userId column to existing todos table if it doesn't exist
try {
    db.exec(`ALTER TABLE todos ADD COLUMN userId TEXT`);
}
catch (error) {
    // Column already exists, ignore error
}
// Create indexes for better query performance
db.exec(`CREATE INDEX IF NOT EXISTS idx_todos_completed ON todos(completed)`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_todos_dueDate ON todos(dueDate)`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_todos_userId ON todos(userId)`);
// Add categoryId column to existing todos table if it doesn't exist
try {
    db.exec(`ALTER TABLE todos ADD COLUMN categoryId TEXT`);
}
catch (error) {
    // Column already exists, ignore error
}
// Create categories table
const createCategoriesTableSQL = `
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
)`;
db.exec(createCategoriesTableSQL);
// Create indexes for categories
db.exec(`CREATE INDEX IF NOT EXISTS idx_categories_userId ON categories(userId)`);
db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_userId_name ON categories(userId, name)`);
// Create index for todos categoryId
db.exec(`CREATE INDEX IF NOT EXISTS idx_todos_categoryId ON todos(categoryId)`);
exports.default = db;
//# sourceMappingURL=db.js.map