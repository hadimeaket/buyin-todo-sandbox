import { Todo, CreateTodoDto, UpdateTodoDto } from "../models/Todo";
import { v4 as uuidv4 } from "uuid";
import Database from "better-sqlite3";

export interface ITodoRepository {
  findAll(userId?: string): Promise<Todo[]>;
  findById(id: string, userId?: string): Promise<Todo | null>;
  findDuplicate(
    title: string,
    description?: string,
    userId?: string
  ): Promise<Todo | null>;
  create(data: CreateTodoDto, userId?: string): Promise<Todo>;
  update(
    id: string,
    data: UpdateTodoDto,
    userId?: string
  ): Promise<Todo | null>;
  toggle(id: string, userId?: string): Promise<Todo | null>;
  delete(id: string, userId?: string): Promise<boolean>;
}

class SqliteTodoRepository implements ITodoRepository {
  private db: Database.Database;

  constructor(dbPath: string = process.env.DB_PATH || "./todos.db") {
    this.db = new Database(dbPath);
    this.initializeDatabase();
  }

  private initializeDatabase(): void {
    // Create users table
    const createUsersTableSQL = `
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      )
    `;
    this.db.exec(createUsersTableSQL);

    // Check if todos table exists and has userId column
    const tableInfo = this.db
      .prepare("PRAGMA table_info(todos)")
      .all() as any[];
    const hasUserIdColumn = tableInfo.some((col: any) => col.name === "userId");

    if (!hasUserIdColumn && tableInfo.length > 0) {
      // Table exists but doesn't have userId column - add it
      this.db.exec("ALTER TABLE todos ADD COLUMN userId TEXT");
    } else if (tableInfo.length === 0) {
      // Table doesn't exist - create it with userId
      const createTodosTableSQL = `
        CREATE TABLE IF NOT EXISTS todos (
          id TEXT PRIMARY KEY,
          userId TEXT,
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
          FOREIGN KEY (userId) REFERENCES users(id)
        )
      `;
      this.db.exec(createTodosTableSQL);
    }
  }

  getDatabase(): Database.Database {
    return this.db;
  }

  private rowToTodo(row: any): Todo {
    return {
      id: row.id,
      title: row.title,
      description: row.description || undefined,
      completed: Boolean(row.completed),
      priority: row.priority,
      dueDate: row.dueDate ? new Date(row.dueDate) : undefined,
      dueEndDate: row.dueEndDate ? new Date(row.dueEndDate) : undefined,
      isAllDay: row.isAllDay !== null ? Boolean(row.isAllDay) : true,
      startTime: row.startTime || undefined,
      endTime: row.endTime || undefined,
      recurrence: row.recurrence || "none",
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }

  async findAll(userId?: string): Promise<Todo[]> {
    let query = "SELECT * FROM todos";
    const params: any[] = [];

    if (userId) {
      query += " WHERE userId = ?";
      params.push(userId);
    }

    const rows = this.db.prepare(query).all(...params);
    return rows.map((row) => this.rowToTodo(row));
  }

  async findById(id: string, userId?: string): Promise<Todo | null> {
    let query = "SELECT * FROM todos WHERE id = ?";
    const params: any[] = [id];

    if (userId) {
      query += " AND userId = ?";
      params.push(userId);
    }

    const row = this.db.prepare(query).get(...params);
    return row ? this.rowToTodo(row) : null;
  }

  async findDuplicate(
    title: string,
    description?: string,
    userId?: string
  ): Promise<Todo | null> {
    const normalizedTitle = title.toLowerCase().trim();
    const normalizedDesc = description?.toLowerCase().trim();

    let query = "SELECT * FROM todos WHERE LOWER(TRIM(title)) = ?";
    const params: any[] = [normalizedTitle];

    if (description) {
      query += " AND LOWER(TRIM(description)) = ?";
      params.push(normalizedDesc);
    }

    if (userId) {
      query += " AND userId = ?";
      params.push(userId);
    }

    const row = this.db.prepare(query).get(...params);
    return row ? this.rowToTodo(row) : null;
  }

  async create(data: CreateTodoDto, userId?: string): Promise<Todo> {
    const now = new Date();
    const todo: Todo = {
      id: uuidv4(),
      title: data.title,
      description: data.description,
      completed: false,
      priority: data.priority || "medium",
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      dueEndDate: data.dueEndDate ? new Date(data.dueEndDate) : undefined,
      isAllDay: data.isAllDay ?? true,
      startTime: data.startTime,
      endTime: data.endTime,
      recurrence: data.recurrence || "none",
      createdAt: now,
      updatedAt: now,
    };

    const stmt = this.db.prepare(`
      INSERT INTO todos (
        id, userId, title, description, completed, priority,
        dueDate, dueEndDate, isAllDay, startTime, endTime,
        recurrence, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      todo.id,
      userId || null,
      todo.title,
      todo.description || null,
      todo.completed ? 1 : 0,
      todo.priority,
      todo.dueDate ? todo.dueDate.toISOString() : null,
      todo.dueEndDate ? todo.dueEndDate.toISOString() : null,
      todo.isAllDay ? 1 : 0,
      todo.startTime || null,
      todo.endTime || null,
      todo.recurrence,
      todo.createdAt.toISOString(),
      todo.updatedAt.toISOString()
    );

    return todo;
  }

  async update(
    id: string,
    data: UpdateTodoDto,
    userId?: string
  ): Promise<Todo | null> {
    const existing = await this.findById(id, userId);
    if (!existing) return null;

    const updatedTodo: Todo = {
      ...existing,
      ...data,
      dueDate:
        data.dueDate !== undefined
          ? data.dueDate
            ? new Date(data.dueDate)
            : undefined
          : existing.dueDate,
      dueEndDate:
        data.dueEndDate !== undefined
          ? data.dueEndDate
            ? new Date(data.dueEndDate)
            : undefined
          : existing.dueEndDate,
      isAllDay: data.isAllDay !== undefined ? data.isAllDay : existing.isAllDay,
      startTime:
        data.startTime !== undefined ? data.startTime : existing.startTime,
      endTime: data.endTime !== undefined ? data.endTime : existing.endTime,
      recurrence:
        data.recurrence !== undefined ? data.recurrence : existing.recurrence,
      updatedAt: new Date(),
    };

    const stmt = this.db.prepare(`
      UPDATE todos SET
        title = ?, description = ?, completed = ?, priority = ?,
        dueDate = ?, dueEndDate = ?, isAllDay = ?, startTime = ?,
        endTime = ?, recurrence = ?, updatedAt = ?
      WHERE id = ?
    `);

    stmt.run(
      updatedTodo.title,
      updatedTodo.description || null,
      updatedTodo.completed ? 1 : 0,
      updatedTodo.priority,
      updatedTodo.dueDate ? updatedTodo.dueDate.toISOString() : null,
      updatedTodo.dueEndDate ? updatedTodo.dueEndDate.toISOString() : null,
      updatedTodo.isAllDay ? 1 : 0,
      updatedTodo.startTime || null,
      updatedTodo.endTime || null,
      updatedTodo.recurrence,
      updatedTodo.updatedAt.toISOString(),
      id
    );

    return updatedTodo;
  }

  async toggle(id: string, userId?: string): Promise<Todo | null> {
    const existing = await this.findById(id, userId);
    if (!existing) return null;

    const updatedTodo: Todo = {
      ...existing,
      completed: !existing.completed,
      updatedAt: new Date(),
    };

    const stmt = this.db.prepare(`
      UPDATE todos SET completed = ?, updatedAt = ? WHERE id = ?
    `);

    stmt.run(
      updatedTodo.completed ? 1 : 0,
      updatedTodo.updatedAt.toISOString(),
      id
    );

    return updatedTodo;
  }

  async delete(id: string, userId?: string): Promise<boolean> {
    let query = "DELETE FROM todos WHERE id = ?";
    const params: any[] = [id];

    if (userId) {
      query += " AND userId = ?";
      params.push(userId);
    }

    const stmt = this.db.prepare(query);
    const result = stmt.run(...params);
    return result.changes > 0;
  }

  close(): void {
    this.db.close();
  }
}

export const todoRepository = new SqliteTodoRepository();
