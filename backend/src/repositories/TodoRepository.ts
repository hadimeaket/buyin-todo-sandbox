import { Todo, CreateTodoDto, UpdateTodoDto } from "../models/Todo";
import { v4 as uuidv4 } from "uuid";
import { db } from "../database/db";
import { attachmentRepository } from "./AttachmentRepository";

export interface ITodoRepository {
  findAll(userId: string): Promise<Todo[]>;
  findById(id: string, userId: string): Promise<Todo | null>;
  findDuplicate(
    title: string,
    userId: string,
    description?: string
  ): Promise<Todo | null>;
  create(data: CreateTodoDto, userId: string): Promise<Todo>;
  update(id: string, userId: string, data: UpdateTodoDto): Promise<Todo | null>;
  toggle(id: string, userId: string): Promise<Todo | null>;
  delete(id: string, userId: string): Promise<boolean>;
  clear?(): Promise<void>; // Optional method for testing
}

// Helper functions to convert between DB rows and Todo objects
interface TodoRow {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  completed: number;
  priority: string;
  dueDate: string | null;
  dueEndDate: string | null;
  isAllDay: number;
  startTime: string | null;
  endTime: string | null;
  recurrence: string;
  categoryId: string | null;
  createdAt: string;
  updatedAt: string;
}

async function rowToTodo(row: TodoRow): Promise<Todo> {
  const attachments = await attachmentRepository.findByTodoId(row.id);
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
    recurrence: row.recurrence as Todo["recurrence"],
    categoryId: row.categoryId || undefined,
    attachments: attachments.length > 0 ? attachments : undefined,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  };
}

class SQLiteTodoRepository implements ITodoRepository {
  async findAll(userId: string): Promise<Todo[]> {
    const stmt = db.prepare("SELECT * FROM todos WHERE userId = ?");
    const rows = stmt.all(userId) as TodoRow[];
    return Promise.all(rows.map(rowToTodo));
  }

  async findById(id: string, userId: string): Promise<Todo | null> {
    const stmt = db.prepare("SELECT * FROM todos WHERE id = ? AND userId = ?");
    const row = stmt.get(id, userId) as TodoRow | undefined;
    return row ? await rowToTodo(row) : null;
  }

  async findDuplicate(
    title: string,
    userId: string,
    description?: string
  ): Promise<Todo | null> {
    const normalizedTitle = title.toLowerCase().trim();
    const normalizedDesc = description?.toLowerCase().trim() || null;

    let stmt;
    let row;

    if (normalizedDesc) {
      stmt = db.prepare(`
        SELECT * FROM todos 
        WHERE userId = ?
        AND LOWER(TRIM(title)) = ? 
        AND LOWER(TRIM(COALESCE(description, ''))) = ?
        LIMIT 1
      `);
      row = stmt.get(userId, normalizedTitle, normalizedDesc) as
        | TodoRow
        | undefined;
    } else {
      stmt = db.prepare(`
        SELECT * FROM todos 
        WHERE userId = ?
        AND LOWER(TRIM(title)) = ? 
        AND (description IS NULL OR description = '')
        LIMIT 1
      `);
      row = stmt.get(userId, normalizedTitle) as TodoRow | undefined;
    }

    return row ? await rowToTodo(row) : null;
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
      categoryId: data.categoryId,
      createdAt: now,
      updatedAt: now,
    };

    const stmt = db.prepare(`
      INSERT INTO todos (
        id, userId, title, description, completed, priority,
        dueDate, dueEndDate, isAllDay, startTime, endTime,
        recurrence, categoryId, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      todo.id,
      todo.userId,
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
      todo.categoryId || null,
      todo.createdAt.toISOString(),
      todo.updatedAt.toISOString()
    );

    return todo;
  }

  async update(
    id: string,
    userId: string,
    data: UpdateTodoDto
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
      categoryId:
        data.categoryId !== undefined ? data.categoryId : existing.categoryId,
      updatedAt: new Date(),
    };

    const stmt = db.prepare(`
      UPDATE todos SET
        title = ?, description = ?, completed = ?, priority = ?,
        dueDate = ?, dueEndDate = ?, isAllDay = ?, startTime = ?,
        endTime = ?, recurrence = ?, categoryId = ?, updatedAt = ?
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
      updatedTodo.categoryId || null,
      updatedTodo.updatedAt.toISOString(),
      id
    );

    return updatedTodo;
  }

  async toggle(id: string, userId: string): Promise<Todo | null> {
    const existing = await this.findById(id, userId);
    if (!existing) return null;

    const updatedTodo: Todo = {
      ...existing,
      completed: !existing.completed,
      updatedAt: new Date(),
    };

    const stmt = db.prepare(`
      UPDATE todos SET completed = ?, updatedAt = ? WHERE id = ?
    `);

    stmt.run(
      updatedTodo.completed ? 1 : 0,
      updatedTodo.updatedAt.toISOString(),
      id
    );

    return updatedTodo;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const stmt = db.prepare("DELETE FROM todos WHERE id = ? AND userId = ?");
    const result = stmt.run(id, userId);
    return result.changes > 0;
  }

  async removeCategoryFromTodos(
    categoryId: string,
    userId: string
  ): Promise<void> {
    const stmt = db.prepare(`
      UPDATE todos 
      SET categoryId = NULL, updatedAt = ?
      WHERE categoryId = ? AND userId = ?
    `);
    stmt.run(new Date().toISOString(), categoryId, userId);
  }

  async clear(): Promise<void> {
    const stmt = db.prepare("DELETE FROM todos");
    stmt.run();
  }
}

export const todoRepository = new SQLiteTodoRepository();
