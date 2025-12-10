import { Todo, CreateTodoDto, UpdateTodoDto } from "../models/Todo";
import { v4 as uuidv4 } from "uuid";
import { getDatabase } from "../db/database";

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
}

class SqliteTodoRepository implements ITodoRepository {
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
      recurrence: row.recurrence,
      categoryId: row.categoryId || undefined,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }

  async findAll(userId: string): Promise<Todo[]> {
    const db = getDatabase();
    const rows = db
      .prepare("SELECT * FROM todos WHERE userId = ? ORDER BY createdAt DESC")
      .all(userId);
    return rows.map((row) => this.rowToTodo(row));
  }

  async findById(id: string, userId: string): Promise<Todo | null> {
    const db = getDatabase();
    const row = db
      .prepare("SELECT * FROM todos WHERE id = ? AND userId = ?")
      .get(id, userId);
    return row ? this.rowToTodo(row) : null;
  }

  async findDuplicate(
    title: string,
    userId: string,
    description?: string
  ): Promise<Todo | null> {
    const db = getDatabase();
    const normalizedTitle = title.toLowerCase().trim();

    let query =
      "SELECT * FROM todos WHERE userId = ? AND LOWER(TRIM(title)) = ?";
    const params: any[] = [userId, normalizedTitle];

    if (description) {
      const normalizedDesc = description.toLowerCase().trim();
      query += " AND LOWER(TRIM(description)) = ?";
      params.push(normalizedDesc);
    }

    const row = db.prepare(query).get(...params);
    return row ? this.rowToTodo(row) : null;
  }

  async create(data: CreateTodoDto, userId: string): Promise<Todo> {
    const db = getDatabase();
    const now = new Date().toISOString();
    const id = uuidv4();

    const stmt = db.prepare(`
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
      data.isAllDay ?? true ? 1 : 0,
      data.startTime || null,
      data.endTime || null,
      data.recurrence || "none",
      data.categoryId || null,
      now,
      now
    );

    return (await this.findById(id, userId))!;
  }

  async update(
    id: string,
    userId: string,
    data: UpdateTodoDto
  ): Promise<Todo | null> {
    const existing = await this.findById(id, userId);
    if (!existing) return null;

    const db = getDatabase();
    const updates: string[] = [];
    const params: any[] = [];

    if (data.title !== undefined) {
      updates.push("title = ?");
      params.push(data.title);
    }
    if (data.description !== undefined) {
      updates.push("description = ?");
      params.push(data.description || null);
    }
    if (data.completed !== undefined) {
      updates.push("completed = ?");
      params.push(data.completed ? 1 : 0);
    }
    if (data.priority !== undefined) {
      updates.push("priority = ?");
      params.push(data.priority);
    }
    if (data.dueDate !== undefined) {
      updates.push("dueDate = ?");
      params.push(data.dueDate || null);
    }
    if (data.dueEndDate !== undefined) {
      updates.push("dueEndDate = ?");
      params.push(data.dueEndDate || null);
    }
    if (data.isAllDay !== undefined) {
      updates.push("isAllDay = ?");
      params.push(data.isAllDay ? 1 : 0);
    }
    if (data.startTime !== undefined) {
      updates.push("startTime = ?");
      params.push(data.startTime || null);
    }
    if (data.endTime !== undefined) {
      updates.push("endTime = ?");
      params.push(data.endTime || null);
    }
    if (data.recurrence !== undefined) {
      updates.push("recurrence = ?");
      params.push(data.recurrence);
    }
    if (data.categoryId !== undefined) {
      updates.push("categoryId = ?");
      params.push(data.categoryId || null);
    }

    updates.push("updatedAt = ?");
    params.push(new Date().toISOString());
    params.push(id);

    const stmt = db.prepare(
      `UPDATE todos SET ${updates.join(", ")} WHERE id = ? AND userId = ?`
    );
    params.push(userId);
    stmt.run(...params);

    return this.findById(id, userId);
  }

  async toggle(id: string, userId: string): Promise<Todo | null> {
    const existing = await this.findById(id, userId);
    if (!existing) return null;

    const db = getDatabase();
    const stmt = db.prepare(`
      UPDATE todos SET completed = ?, updatedAt = ? WHERE id = ? AND userId = ?
    `);
    stmt.run(existing.completed ? 0 : 1, new Date().toISOString(), id, userId);

    return this.findById(id, userId);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const db = getDatabase();
    const stmt = db.prepare("DELETE FROM todos WHERE id = ? AND userId = ?");
    const result = stmt.run(id, userId);
    return result.changes > 0;
  }
}

export const todoRepository = new SqliteTodoRepository();
