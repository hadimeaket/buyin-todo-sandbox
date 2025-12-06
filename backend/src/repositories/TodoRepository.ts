import { Todo, CreateTodoDto, UpdateTodoDto } from "../models/Todo";
import { v4 as uuidv4 } from "uuid";
import { getDatabase } from "../db/database";
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

class SQLiteTodoRepository implements ITodoRepository {
  private getDb(): Database.Database {
    return getDatabase();
  }

  private rowToTodo(row: any): Todo {
    return {
      id: row.id,
      title: row.title,
      description: row.description || undefined,
      completed: Boolean(row.completed),
      priority: row.priority as "low" | "medium" | "high",
      dueDate: row.dueDate ? new Date(row.dueDate) : undefined,
      dueEndDate: row.dueEndDate ? new Date(row.dueEndDate) : undefined,
      isAllDay: row.isAllDay !== null ? Boolean(row.isAllDay) : true,
      startTime: row.startTime || undefined,
      endTime: row.endTime || undefined,
      recurrence: row.recurrence || "none",
      categoryId: row.categoryId || undefined,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }

  async findAll(userId: string): Promise<Todo[]> {
    const stmt = this.getDb().prepare("SELECT * FROM todos WHERE userId = ? ORDER BY createdAt DESC");
    const rows = stmt.all(userId);
    return rows.map((row) => this.rowToTodo(row));
  }

  async findById(id: string, userId: string): Promise<Todo | null> {
    const stmt = this.getDb().prepare("SELECT * FROM todos WHERE id = ? AND userId = ?");
    const row = stmt.get(id, userId);
    return row ? this.rowToTodo(row) : null;
  }

  async findDuplicate(
    title: string,
    userId: string,
    description?: string
  ): Promise<Todo | null> {
    const stmt = this.getDb().prepare(
      "SELECT * FROM todos WHERE userId = ? AND LOWER(TRIM(title)) = LOWER(TRIM(?)) AND (? IS NULL OR LOWER(TRIM(description)) = LOWER(TRIM(?)))"
    );
    const row = stmt.get(userId, title, description || null, description || null);
    return row ? this.rowToTodo(row) : null;
  }

  async create(data: CreateTodoDto, userId: string): Promise<Todo> {
    const now = new Date().toISOString();
    const id = uuidv4();

    const stmt = this.getDb().prepare(`
      INSERT INTO todos (
        id, userId, title, description, completed, priority,
        dueDate, dueEndDate, isAllDay, startTime, endTime,
        recurrence, categoryId, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      data.categoryId || null,
      now,
      now
    );

    const todo = await this.findById(id, userId);
    if (!todo) {
      throw new Error("Failed to create todo");
    }
    return todo;
  }

  async update(id: string, userId: string, data: UpdateTodoDto): Promise<Todo | null> {
    const existing = await this.findById(id, userId);
    if (!existing) return null;

    const now = new Date().toISOString();
    const updates: string[] = [];
    const values: any[] = [];

    if (data.title !== undefined) {
      updates.push("title = ?");
      values.push(data.title);
    }
    if (data.description !== undefined) {
      updates.push("description = ?");
      values.push(data.description || null);
    }
    if (data.completed !== undefined) {
      updates.push("completed = ?");
      values.push(data.completed ? 1 : 0);
    }
    if (data.priority !== undefined) {
      updates.push("priority = ?");
      values.push(data.priority);
    }
    if (data.dueDate !== undefined) {
      updates.push("dueDate = ?");
      values.push(data.dueDate || null);
    }
    if (data.dueEndDate !== undefined) {
      updates.push("dueEndDate = ?");
      values.push(data.dueEndDate || null);
    }
    if (data.isAllDay !== undefined) {
      updates.push("isAllDay = ?");
      values.push(data.isAllDay ? 1 : 0);
    }
    if (data.startTime !== undefined) {
      updates.push("startTime = ?");
      values.push(data.startTime || null);
    }
    if (data.endTime !== undefined) {
      updates.push("endTime = ?");
      values.push(data.endTime || null);
    }
    if (data.recurrence !== undefined) {
      updates.push("recurrence = ?");
      values.push(data.recurrence);
    }
    if (data.categoryId !== undefined) {
      updates.push("categoryId = ?");
      values.push(data.categoryId || null);
    }

    updates.push("updatedAt = ?");
    values.push(now);
    values.push(id);

    const stmt = this.getDb().prepare(
      `UPDATE todos SET ${updates.join(", ")} WHERE id = ? AND userId = ?`
    );
    values.push(userId);
    stmt.run(...values);

    return await this.findById(id, userId);
  }

  async toggle(id: string, userId: string): Promise<Todo | null> {
    const existing = await this.findById(id, userId);
    if (!existing) return null;

    const now = new Date().toISOString();
    const stmt = this.getDb().prepare(
      "UPDATE todos SET completed = ?, updatedAt = ? WHERE id = ? AND userId = ?"
    );
    stmt.run(existing.completed ? 0 : 1, now, id, userId);

    return await this.findById(id, userId);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const stmt = this.getDb().prepare("DELETE FROM todos WHERE id = ? AND userId = ?");
    const result = stmt.run(id, userId);
    return result.changes > 0;
  }
}

// Legacy in-memory implementation kept for testing
class InMemoryTodoRepository implements ITodoRepository {
  private todos: Todo[] = [];

  async findAll(userId: string): Promise<Todo[]> {
    return this.todos.filter((t: any) => t.userId === userId);
  }

  async findById(id: string, userId: string): Promise<Todo | null> {
    const todo = this.todos.find((t: any) => t.id === id && t.userId === userId);
    return todo || null;
  }

  async findDuplicate(
    title: string,
    userId: string,
    description?: string
  ): Promise<Todo | null> {
    const duplicate = this.todos.find((t: any) => {
      const titleMatch =
        t.userId === userId &&
        t.title.toLowerCase().trim() === title.toLowerCase().trim();
      const descMatch =
        !description ||
        t.description?.toLowerCase().trim() ===
          description.toLowerCase().trim();
      return titleMatch && descMatch;
    });
    return duplicate || null;
  }

  async create(data: CreateTodoDto, userId: string): Promise<Todo> {
    const now = new Date();
    const todo: any = {
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
    const index = this.todos.findIndex((t: any) => t.id === id && t.userId === userId);
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
    const index = this.todos.findIndex((t: any) => t.id === id && t.userId === userId);
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
    const index = this.todos.findIndex((t: any) => t.id === id && t.userId === userId);
    if (index === -1) return false;

    this.todos.splice(index, 1);
    return true;
  }
}

// Use SQLite in production, in-memory for tests
export const todoRepository =
  process.env.NODE_ENV === "test"
    ? new InMemoryTodoRepository()
    : new SQLiteTodoRepository();

