"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabase = getDatabase;
exports.initDatabase = initDatabase;
exports.closeDatabase = closeDatabase;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
let db = null;
function getDatabase() {
    if (!db) {
        throw new Error("Database not initialized. Call initDatabase() first.");
    }
    return db;
}
function initDatabase(dbPath) {
    const finalPath = dbPath || process.env.DB_PATH || path_1.default.join(__dirname, "../data/todos.db");
    console.log(`Initializing database at: ${finalPath}`);
    // Ensure the directory exists
    const dir = path_1.default.dirname(finalPath);
    if (!fs_1.default.existsSync(dir)) {
        console.log(`Creating directory: ${dir}`);
        fs_1.default.mkdirSync(dir, { recursive: true });
    }
    db = new better_sqlite3_1.default(finalPath);
    db.pragma("journal_mode = WAL"); // Write-Ahead Logging for better performance
    console.log(`Database initialized successfully`);
    // Create the users table if it doesn't exist
    db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      createdAt TEXT NOT NULL
    )
  `);
    // Create the categories table if it doesn't exist
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
    // Create the todos table if it doesn't exist
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
      recurrence TEXT DEFAULT 'none',
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE SET NULL
    )
  `);
    // Create indexes for better query performance
    db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_categories_userId ON categories(userId);
    CREATE INDEX IF NOT EXISTS idx_todos_userId ON todos(userId);
    CREATE INDEX IF NOT EXISTS idx_todos_categoryId ON todos(categoryId);
    CREATE INDEX IF NOT EXISTS idx_todos_completed ON todos(completed);
    CREATE INDEX IF NOT EXISTS idx_todos_dueDate ON todos(dueDate);
    CREATE INDEX IF NOT EXISTS idx_todos_priority ON todos(priority);
  `);
    // Log table count
    const result = db.prepare("SELECT COUNT(*) as count FROM todos").get();
    console.log(`Database contains ${result.count} todos`);
    return db;
}
function closeDatabase() {
    if (db) {
        db.close();
        db = null;
    }
}
//# sourceMappingURL=db.js.map