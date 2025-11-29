import { Todo, CreateTodoDto, UpdateTodoDto } from "../models/Todo";
import { ITodoRepository } from "./TodoRepository";
import { v4 as uuidv4 } from "uuid";
import db from "../db/sqlite";

export class SqliteTodoRepository implements ITodoRepository {
  async findAll(userId: string): Promise<Todo[]> {
    const rows = db
      .prepare("SELECT * FROM todos WHERE user_id = ? ORDER BY created_at DESC")
      .all(userId);
    return rows.map(this.rowToTodo);
  }

  async findById(id: string, userId: string): Promise<Todo | null> {
    const row = db
      .prepare("SELECT * FROM todos WHERE id = ? AND user_id = ?")
      .get(id, userId);
    return row ? this.rowToTodo(row) : null;
  }

  async findDuplicate(
    userId: string,
    title: string,
    description?: string
  ): Promise<Todo | null> {
    const normalizedTitle = title.toLowerCase().trim();
    const normalizedDesc = description?.toLowerCase().trim();

    let query =
      "SELECT * FROM todos WHERE user_id = ? AND LOWER(TRIM(title)) = ?";
    const params: any[] = [userId, normalizedTitle];

    if (normalizedDesc) {
      query += " AND LOWER(TRIM(COALESCE(description, ''))) = ?";
      params.push(normalizedDesc);
    } else {
      query += " AND (description IS NULL OR description = '')";
    }

    const row = db.prepare(query).get(...params);
    return row ? this.rowToTodo(row) : null;
  }

  async create(userId: string, data: CreateTodoDto): Promise<Todo> {
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO todos (
        id, user_id, title, description, completed, priority,
        due_date, due_end_date, is_all_day, start_time, end_time,
        recurrence, created_at, updated_at
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
    if (!created) throw new Error("Failed to create todo");
    return created;
  }

  async update(
    id: string,
    userId: string,
    data: UpdateTodoDto
  ): Promise<Todo | null> {
    const existing = await this.findById(id, userId);
    if (!existing) return null;

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
      updates.push("due_date = ?");
      params.push(data.dueDate || null);
    }
    if (data.dueEndDate !== undefined) {
      updates.push("due_end_date = ?");
      params.push(data.dueEndDate || null);
    }
    if (data.isAllDay !== undefined) {
      updates.push("is_all_day = ?");
      params.push(data.isAllDay ? 1 : 0);
    }
    if (data.startTime !== undefined) {
      updates.push("start_time = ?");
      params.push(data.startTime || null);
    }
    if (data.endTime !== undefined) {
      updates.push("end_time = ?");
      params.push(data.endTime || null);
    }
    if (data.recurrence !== undefined) {
      updates.push("recurrence = ?");
      params.push(data.recurrence);
    }

    updates.push("updated_at = ?");
    params.push(new Date().toISOString());
    params.push(id);
    params.push(userId);

    const stmt = db.prepare(
      `UPDATE todos SET ${updates.join(", ")} WHERE id = ? AND user_id = ?`
    );
    stmt.run(...params);

    return await this.findById(id, userId);
  }

  async toggle(id: string, userId: string): Promise<Todo | null> {
    const existing = await this.findById(id, userId);
    if (!existing) return null;

    const stmt = db.prepare(
      "UPDATE todos SET completed = ?, updated_at = ? WHERE id = ? AND user_id = ?"
    );
    stmt.run(existing.completed ? 0 : 1, new Date().toISOString(), id, userId);

    return await this.findById(id, userId);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const stmt = db.prepare("DELETE FROM todos WHERE id = ? AND user_id = ?");
    const result = stmt.run(id, userId);
    return result.changes > 0;
  }

  private rowToTodo(row: any): Todo {
    return {
      id: row.id,
      title: row.title,
      description: row.description || undefined,
      completed: Boolean(row.completed),
      priority: row.priority,
      dueDate: row.due_date ? new Date(row.due_date) : undefined,
      dueEndDate: row.due_end_date ? new Date(row.due_end_date) : undefined,
      isAllDay: row.is_all_day !== null ? Boolean(row.is_all_day) : undefined,
      startTime: row.start_time || undefined,
      endTime: row.end_time || undefined,
      recurrence: row.recurrence,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
