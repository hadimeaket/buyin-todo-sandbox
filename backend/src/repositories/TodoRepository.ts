import { Todo, CreateTodoDto, UpdateTodoDto } from "../models/Todo";
import { v4 as uuidv4 } from "uuid";
import DatabaseConnection from "../database/connection";
import type Database from "better-sqlite3";

export interface ITodoRepository {
  findAll(userId: string): Promise<Todo[]>;
  findById(id: string, userId: string): Promise<Todo | null>;
  findDuplicate(title: string, userId: string, description?: string): Promise<Todo | null>;
  create(data: CreateTodoDto, userId: string): Promise<Todo>;
  update(id: string, userId: string, data: UpdateTodoDto): Promise<Todo | null>;
  toggle(id: string, userId: string): Promise<Todo | null>;
  delete(id: string, userId: string): Promise<boolean>;
}

/**
 * SQLiteTodoRepository - Persistente Speicherung mit SQLite
 * 
 * Verwendet Prepared Statements für SQL Injection Prevention
 */
class SQLiteTodoRepository implements ITodoRepository {
  private get db(): Database.Database {
    return DatabaseConnection.getConnection();
  }

  /**
   * Konvertiert DB-Row zu Todo-Objekt mit korrekten Datentypen
   */
  private rowToTodo(row: any): Todo {
    return {
      id: row.id,
      userId: row.userId,
      title: row.title,
      description: row.description || undefined,
      completed: row.completed === 1,
      priority: row.priority as "low" | "medium" | "high",
      dueDate: row.dueDate ? new Date(row.dueDate) : undefined,
      dueEndDate: row.dueEndDate ? new Date(row.dueEndDate) : undefined,
      isAllDay: row.isAllDay === 1,
      startTime: row.startTime || undefined,
      endTime: row.endTime || undefined,
      recurrence: row.recurrence as any,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }

  async findAll(userId: string): Promise<Todo[]> {
    const stmt = this.db.prepare("SELECT * FROM todos WHERE userId = ? ORDER BY createdAt DESC");
    const rows = stmt.all(userId);
    return rows.map((row) => this.rowToTodo(row));
  }

  async findById(id: string, userId: string): Promise<Todo | null> {
    const stmt = this.db.prepare("SELECT * FROM todos WHERE id = ? AND userId = ?");
    const row = stmt.get(id, userId);
    return row ? this.rowToTodo(row) : null;
  }

  async findDuplicate(
    title: string,
    userId: string,
    description?: string
  ): Promise<Todo | null> {
    const stmt = this.db.prepare(`
      SELECT * FROM todos 
      WHERE userId = ?
      AND LOWER(TRIM(title)) = LOWER(TRIM(?))
      AND (? IS NULL OR LOWER(TRIM(description)) = LOWER(TRIM(?)))
      LIMIT 1
    `);
    const row = stmt.get(userId, title, description || null, description || null);
    return row ? this.rowToTodo(row) : null;
  }

  async create(data: CreateTodoDto, userId: string): Promise<Todo> {
    const now = new Date().toISOString();
    const id = uuidv4();

    const stmt = this.db.prepare(`
      INSERT INTO todos (
        id, userId, title, description, completed, priority,
        dueDate, dueEndDate, isAllDay, startTime, endTime,
        recurrence, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      userId,
      data.title,
      data.description || null,
      0,
      data.priority || "medium",
      data.dueDate || null,
      data.dueEndDate || null,
      data.isAllDay !== undefined ? (data.isAllDay ? 1 : 0) : 1,
      data.startTime || null,
      data.endTime || null,
      data.recurrence || "none",
      now,
      now
    );

    const created = await this.findById(id, userId);
    if (!created) {
      throw new Error("Failed to create todo");
    }
    return created;
  }

  async update(id: string, userId: string, data: UpdateTodoDto): Promise<Todo | null> {
    const existing = await this.findById(id, userId);
    if (!existing) return null;

    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      UPDATE todos SET
        title = COALESCE(?, title),
        description = CASE WHEN ? = 1 THEN ? ELSE description END,
        completed = COALESCE(?, completed),
        priority = COALESCE(?, priority),
        dueDate = CASE WHEN ? = 1 THEN ? ELSE dueDate END,
        dueEndDate = CASE WHEN ? = 1 THEN ? ELSE dueEndDate END,
        isAllDay = COALESCE(?, isAllDay),
        startTime = CASE WHEN ? = 1 THEN ? ELSE startTime END,
        endTime = CASE WHEN ? = 1 THEN ? ELSE endTime END,
        recurrence = COALESCE(?, recurrence),
        updatedAt = ?
      WHERE id = ? AND userId = ?
    `);

    stmt.run(
      data.title || null,
      data.description !== undefined ? 1 : 0, data.description || null,
      data.completed !== undefined ? (data.completed ? 1 : 0) : null,
      data.priority || null,
      data.dueDate !== undefined ? 1 : 0, data.dueDate || null,
      data.dueEndDate !== undefined ? 1 : 0, data.dueEndDate || null,
      data.isAllDay !== undefined ? (data.isAllDay ? 1 : 0) : null,
      data.startTime !== undefined ? 1 : 0, data.startTime || null,
      data.endTime !== undefined ? 1 : 0, data.endTime || null,
      data.recurrence || null,
      now,
      id,
      userId
    );

    return await this.findById(id, userId);
  }

  async toggle(id: string, userId: string): Promise<Todo | null> {
    const existing = await this.findById(id, userId);
    if (!existing) return null;

    const now = new Date().toISOString();
    const stmt = this.db.prepare(`
      UPDATE todos SET completed = ?, updatedAt = ? WHERE id = ? AND userId = ?
    `);

    stmt.run(existing.completed ? 0 : 1, now, id, userId);
    return await this.findById(id, userId);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const stmt = this.db.prepare("DELETE FROM todos WHERE id = ? AND userId = ?");
    const result = stmt.run(id, userId);
    return result.changes > 0;
  }
}

// InMemory Repository für Tests falls benötigt
export class InMemoryTodoRepository implements ITodoRepository {
  private todos: Todo[] = [];

  async findAll(userId: string): Promise<Todo[]> {
    return this.todos.filter(t => t.userId === userId);
  }

  async findById(id: string, userId: string): Promise<Todo | null> {
    const todo = this.todos.find((t) => t.id === id && t.userId === userId);
    return todo || null;
  }

  async findDuplicate(
    title: string,
    userId: string,
    description?: string
  ): Promise<Todo | null> {
    const duplicate = this.todos.find((t) => {
      const userMatch = t.userId === userId;
      const titleMatch =
        t.title.toLowerCase().trim() === title.toLowerCase().trim();
      const descMatch =
        !description ||
        t.description?.toLowerCase().trim() ===
          description.toLowerCase().trim();
      return userMatch && titleMatch && descMatch;
    });
    return duplicate || null;
  }

  async create(data: CreateTodoDto, userId: string): Promise<Todo> {
    const now = new Date();
    const todo: Todo = {
      id: uuidv4(),
      userId,
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
    this.todos.push(todo);
    return todo;
  }

  async update(id: string, userId: string, data: UpdateTodoDto): Promise<Todo | null> {
    const index = this.todos.findIndex((t) => t.id === id && t.userId === userId);
    if (index === -1) return null;

    const updatedTodo: Todo = {
      ...this.todos[index],
      ...data,
      dueDate:
        data.dueDate !== undefined
          ? data.dueDate
            ? new Date(data.dueDate)
            : undefined
          : this.todos[index].dueDate,
      dueEndDate:
        data.dueEndDate !== undefined
          ? data.dueEndDate
            ? new Date(data.dueEndDate)
            : undefined
          : this.todos[index].dueEndDate,
      isAllDay:
        data.isAllDay !== undefined
          ? data.isAllDay
          : this.todos[index].isAllDay,
      startTime:
        data.startTime !== undefined
          ? data.startTime
          : this.todos[index].startTime,
      endTime:
        data.endTime !== undefined ? data.endTime : this.todos[index].endTime,
      recurrence:
        data.recurrence !== undefined
          ? data.recurrence
          : this.todos[index].recurrence,
      updatedAt: new Date(),
    };
    this.todos[index] = updatedTodo;
    return updatedTodo;
  }

  async toggle(id: string, userId: string): Promise<Todo | null> {
    const index = this.todos.findIndex((t) => t.id === id && t.userId === userId);
    if (index === -1) return null;

    const updatedTodo: Todo = {
      ...this.todos[index],
      completed: !this.todos[index].completed,
      updatedAt: new Date(),
    };
    this.todos[index] = updatedTodo;
    return updatedTodo;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const index = this.todos.findIndex((t) => t.id === id && t.userId === userId);
    if (index === -1) return false;

    this.todos.splice(index, 1);
    return true;
  }
}

// Verwende SQLite-Repository für persistente Speicherung
export const todoRepository = new SQLiteTodoRepository();
