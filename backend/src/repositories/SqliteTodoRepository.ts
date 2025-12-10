import { Todo, CreateTodoDto, UpdateTodoDto } from "../models/Todo";
import { v4 as uuidv4 } from "uuid";
import { db } from "../db/database";
import { ITodoRepository } from "./TodoRepository";

export class SqliteTodoRepository implements ITodoRepository {
  async findAll(userId: string): Promise<Todo[]> {
    const stmt = db.prepare(
      "SELECT * FROM todos WHERE userId = ? ORDER BY createdAt DESC"
    );
    const rows = stmt.all(userId) as any[];
    return rows.map(this.mapRowToTodo);
  }

  async findById(id: string, userId: string): Promise<Todo | null> {
    const stmt = db.prepare("SELECT * FROM todos WHERE id = ? AND userId = ?");
    const row = stmt.get(id, userId) as any;
    return row ? this.mapRowToTodo(row) : null;
  }

  async findDuplicate(
    title: string,
    userId: string,
    description?: string
  ): Promise<Todo | null> {
    let stmt;
    let row;

    if (description) {
      stmt = db.prepare(
        "SELECT * FROM todos WHERE userId = ? AND LOWER(TRIM(title)) = LOWER(TRIM(?)) AND LOWER(TRIM(description)) = LOWER(TRIM(?))"
      );
      row = stmt.get(userId, title, description) as any;
    } else {
      stmt = db.prepare(
        "SELECT * FROM todos WHERE userId = ? AND LOWER(TRIM(title)) = LOWER(TRIM(?))"
      );
      row = stmt.get(userId, title) as any;
    }

    return row ? this.mapRowToTodo(row) : null;
  }

  async create(data: CreateTodoDto, userId: string): Promise<Todo> {
    const now = new Date();
    const todo: Todo = {
      id: uuidv4(),
      userId,
      categoryId: data.categoryId,
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

    const stmt = db.prepare(`
      INSERT INTO todos (
        id, userId, categoryId, title, description, completed, priority,
        dueDate, dueEndDate, isAllDay, startTime, endTime,
        recurrence, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      todo.id,
      todo.userId,
      todo.categoryId || null,
      todo.title,
      todo.description || null,
      todo.completed ? 1 : 0,
      todo.priority,
      todo.dueDate ? todo.dueDate.toISOString() : null,
      todo.dueEndDate ? todo.dueEndDate.toISOString() : null,
      todo.isAllDay !== undefined ? (todo.isAllDay ? 1 : 0) : null,
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
      updatedAt: new Date(),
    };

    const stmt = db.prepare(`
      UPDATE todos SET
        categoryId = ?,
        title = ?,
        description = ?,
        completed = ?,
        priority = ?,
        dueDate = ?,
        dueEndDate = ?,
        isAllDay = ?,
        startTime = ?,
        endTime = ?,
        recurrence = ?,
        updatedAt = ?
      WHERE id = ? AND userId = ?
    `);

    stmt.run(
      updatedTodo.categoryId || null,
      updatedTodo.title,
      updatedTodo.description || null,
      updatedTodo.completed ? 1 : 0,
      updatedTodo.priority,
      updatedTodo.dueDate ? updatedTodo.dueDate.toISOString() : null,
      updatedTodo.dueEndDate ? updatedTodo.dueEndDate.toISOString() : null,
      updatedTodo.isAllDay !== undefined
        ? updatedTodo.isAllDay
          ? 1
          : 0
        : null,
      updatedTodo.startTime || null,
      updatedTodo.endTime || null,
      updatedTodo.recurrence,
      updatedTodo.updatedAt.toISOString(),
      id,
      userId
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
      UPDATE todos SET
        completed = ?,
        updatedAt = ?
      WHERE id = ? AND userId = ?
    `);

    stmt.run(
      updatedTodo.completed ? 1 : 0,
      updatedTodo.updatedAt.toISOString(),
      id,
      userId
    );

    return updatedTodo;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const stmt = db.prepare("DELETE FROM todos WHERE id = ? AND userId = ?");
    const result = stmt.run(id, userId);
    return result.changes > 0;
  }

  private mapRowToTodo(row: any): Todo {
    return {
      id: row.id,
      userId: row.userId,
      categoryId: row.categoryId || undefined,
      title: row.title,
      description: row.description || undefined,
      completed: row.completed === 1,
      priority: row.priority,
      dueDate: row.dueDate ? new Date(row.dueDate) : undefined,
      dueEndDate: row.dueEndDate ? new Date(row.dueEndDate) : undefined,
      isAllDay: row.isAllDay !== null ? row.isAllDay === 1 : undefined,
      startTime: row.startTime || undefined,
      endTime: row.endTime || undefined,
      recurrence: row.recurrence,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }
}
