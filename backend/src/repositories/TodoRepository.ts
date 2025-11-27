import { Todo, CreateTodoDto, UpdateTodoDto } from "../models/Todo";
import { v4 as uuidv4 } from "uuid";
import db from "../database/Database";

export interface ITodoRepository {
  findAllByUser(userId: string): Promise<Todo[]>;
  findByIdAndUser(id: string, userId: string): Promise<Todo | null>;
  findDuplicateForUser(
    userId: string,
    title: string,
    description?: string
  ): Promise<Todo | null>;
  create(data: CreateTodoDto, userId: string): Promise<Todo>;
  update(id: string, data: UpdateTodoDto, userId: string): Promise<Todo | null>;
  toggle(id: string, userId: string): Promise<Todo | null>;
  delete(id: string, userId: string): Promise<boolean>;
}

interface TodoRow {
  id: string;
  userId: string;
  categoryId: string | null;
  title: string;
  description: string | null;
  completed: number;
  priority: string;
  dueDate: string | null;
  dueEndDate: string | null;
  isAllDay: number | null;
  startTime: string | null;
  endTime: string | null;
  recurrence: string | null;
  createdAt: string;
  updatedAt: string;
}

class SQLiteTodoRepository implements ITodoRepository {
  private rowToTodo(row: TodoRow): Todo {
    return {
      id: row.id,
      title: row.title,
      description: row.description || undefined,
      completed: row.completed === 1,
      priority: row.priority as "low" | "medium" | "high",
      categoryId: row.categoryId || undefined,
      dueDate: row.dueDate ? new Date(row.dueDate) : undefined,
      dueEndDate: row.dueEndDate ? new Date(row.dueEndDate) : undefined,
      isAllDay: row.isAllDay !== null ? row.isAllDay === 1 : true,
      startTime: row.startTime || undefined,
      endTime: row.endTime || undefined,
      recurrence: (row.recurrence as any) || "none",
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }

  async findAllByUser(userId: string): Promise<Todo[]> {
    const rows = db
      .prepare("SELECT * FROM todos WHERE userId = ? ORDER BY createdAt DESC")
      .all(userId) as TodoRow[];
    return rows.map((row) => this.rowToTodo(row));
  }

  async findByIdAndUser(id: string, userId: string): Promise<Todo | null> {
    const row = db
      .prepare("SELECT * FROM todos WHERE id = ? AND userId = ?")
      .get(id, userId) as TodoRow | undefined;
    return row ? this.rowToTodo(row) : null;
  }

  async findDuplicateForUser(
    userId: string,
    title: string,
    description?: string
  ): Promise<Todo | null> {
    const normalizedTitle = title.toLowerCase().trim();
    const normalizedDesc = description?.toLowerCase().trim();

    let query =
      "SELECT * FROM todos WHERE userId = ? AND LOWER(TRIM(title)) = ?";
    const params: any[] = [userId, normalizedTitle];

    if (description) {
      query += " AND LOWER(TRIM(description)) = ?";
      params.push(normalizedDesc);
    }

    const row = db.prepare(query).get(...params) as TodoRow | undefined;
    return row ? this.rowToTodo(row) : null;
  }

  async create(data: CreateTodoDto, userId: string): Promise<Todo> {
    const now = new Date();
    const todo: Todo = {
      id: uuidv4(),
      title: data.title,
      description: data.description,
      completed: false,
      priority: data.priority || "medium",
      categoryId: data.categoryId,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      dueEndDate: data.dueEndDate ? new Date(data.dueEndDate) : undefined,
      isAllDay: data.isAllDay ?? true,
      startTime: data.startTime,
      endTime: data.endTime,
      recurrence: data.recurrence || "none",
      createdAt: now,
      updatedAt: now,
    };

    db.prepare(
      `INSERT INTO todos (id, userId, categoryId, title, description, completed, priority, dueDate, dueEndDate, isAllDay, startTime, endTime, recurrence, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      todo.id,
      userId,
      todo.categoryId || null,
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
    userId: string
  ): Promise<Todo | null> {
    const existing = await this.findByIdAndUser(id, userId);
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
      categoryId:
        data.categoryId !== undefined ? data.categoryId : existing.categoryId,
      isAllDay: data.isAllDay !== undefined ? data.isAllDay : existing.isAllDay,
      startTime:
        data.startTime !== undefined ? data.startTime : existing.startTime,
      endTime: data.endTime !== undefined ? data.endTime : existing.endTime,
      recurrence:
        data.recurrence !== undefined ? data.recurrence : existing.recurrence,
      updatedAt: new Date(),
    };

    db.prepare(
      `UPDATE todos SET title = ?, description = ?, completed = ?, priority = ?, categoryId = ?,
       dueDate = ?, dueEndDate = ?, isAllDay = ?, startTime = ?, endTime = ?, 
       recurrence = ?, updatedAt = ? WHERE id = ? AND userId = ?`
    ).run(
      updatedTodo.title,
      updatedTodo.description || null,
      updatedTodo.completed ? 1 : 0,
      updatedTodo.priority,
      updatedTodo.categoryId || null,
      updatedTodo.dueDate ? updatedTodo.dueDate.toISOString() : null,
      updatedTodo.dueEndDate ? updatedTodo.dueEndDate.toISOString() : null,
      updatedTodo.isAllDay ? 1 : 0,
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
    const existing = await this.findByIdAndUser(id, userId);
    if (!existing) return null;

    const updatedTodo: Todo = {
      ...existing,
      completed: !existing.completed,
      updatedAt: new Date(),
    };

    db.prepare(
      "UPDATE todos SET completed = ?, updatedAt = ? WHERE id = ? AND userId = ?"
    ).run(
      updatedTodo.completed ? 1 : 0,
      updatedTodo.updatedAt.toISOString(),
      id,
      userId
    );

    return updatedTodo;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = db
      .prepare("DELETE FROM todos WHERE id = ? AND userId = ?")
      .run(id, userId);
    return result.changes > 0;
  }
}

export const todoRepository = new SQLiteTodoRepository();
