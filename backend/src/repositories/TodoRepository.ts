import { Todo, CreateTodoDto, UpdateTodoDto } from "../models/Todo";
import { v4 as uuidv4 } from "uuid";
import { getDatabase } from "../db";

export interface ITodoRepository {
  findAll(userId: string): Promise<Todo[]>;
  findById(id: string, userId: string): Promise<Todo | null>;
  findDuplicate(
    title: string,
    userId: string,
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
  recurrence: string;
  createdAt: string;
  updatedAt: string;
}

function rowToTodo(row: TodoRow): Todo {
  return {
    id: row.id,
    title: row.title,
    description: row.description || undefined,
    completed: row.completed === 1,
    priority: row.priority as "low" | "medium" | "high",
    categoryId: row.categoryId || undefined,
    dueDate: row.dueDate ? new Date(row.dueDate) : undefined,
    dueEndDate: row.dueEndDate ? new Date(row.dueEndDate) : undefined,
    isAllDay: row.isAllDay === null ? undefined : row.isAllDay === 1,
    startTime: row.startTime || undefined,
    endTime: row.endTime || undefined,
    recurrence: (row.recurrence || "none") as Todo["recurrence"],
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  };
}

class SqliteTodoRepository implements ITodoRepository {
  async findAll(userId: string): Promise<Todo[]> {
    const db = getDatabase();
    const stmt = db.prepare(
      "SELECT * FROM todos WHERE userId = ? ORDER BY createdAt DESC"
    );
    const rows = stmt.all(userId) as TodoRow[];
    return rows.map(rowToTodo);
  }

  async findById(id: string, userId: string): Promise<Todo | null> {
    const db = getDatabase();
    const stmt = db.prepare("SELECT * FROM todos WHERE id = ? AND userId = ?");
    const row = stmt.get(id, userId) as TodoRow | undefined;
    return row ? rowToTodo(row) : null;
  }

  async findDuplicate(
    title: string,
    userId: string,
    description?: string
  ): Promise<Todo | null> {
    const db = getDatabase();
    const normalizedTitle = title.toLowerCase().trim();
    const normalizedDesc = description?.toLowerCase().trim();

    let stmt;
    let row: TodoRow | undefined;

    if (description) {
      stmt = db.prepare(
        "SELECT * FROM todos WHERE userId = ? AND LOWER(TRIM(title)) = ? AND LOWER(TRIM(description)) = ? LIMIT 1"
      );
      row = stmt.get(userId, normalizedTitle, normalizedDesc) as
        | TodoRow
        | undefined;
    } else {
      stmt = db.prepare(
        "SELECT * FROM todos WHERE userId = ? AND LOWER(TRIM(title)) = ? AND description IS NULL LIMIT 1"
      );
      row = stmt.get(userId, normalizedTitle) as TodoRow | undefined;
    }

    return row ? rowToTodo(row) : null;
  }

  async create(data: CreateTodoDto, userId: string): Promise<Todo> {
    const db = getDatabase();
    const now = new Date().toISOString();
    const id = uuidv4();

    const stmt = db.prepare(`
      INSERT INTO todos (
        id, userId, categoryId, title, description, completed, priority,
        dueDate, dueEndDate, isAllDay, startTime, endTime,
        recurrence, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      userId,
      data.categoryId || null,
      data.title,
      data.description || null,
      0,
      data.priority || "medium",
      data.dueDate || null,
      data.dueEndDate || null,
      data.isAllDay === undefined ? 1 : data.isAllDay ? 1 : 0,
      data.startTime || null,
      data.endTime || null,
      data.recurrence || "none",
      now,
      now
    );

    return (await this.findById(id, userId))!;
  }

  async update(
    id: string,
    data: UpdateTodoDto,
    userId: string
  ): Promise<Todo | null> {
    const db = getDatabase();
    const existing = await this.findById(id, userId);
    if (!existing) return null;

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
    if (data.categoryId !== undefined) {
      updates.push("categoryId = ?");
      values.push(data.categoryId || null);
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

    updates.push("updatedAt = ?");
    values.push(new Date().toISOString());
    values.push(id);
    values.push(userId);

    const stmt = db.prepare(
      `UPDATE todos SET ${updates.join(", ")} WHERE id = ? AND userId = ?`
    );
    stmt.run(...values);

    return await this.findById(id, userId);
  }

  async toggle(id: string, userId: string): Promise<Todo | null> {
    const db = getDatabase();
    const existing = await this.findById(id, userId);
    if (!existing) return null;

    const stmt = db.prepare(
      "UPDATE todos SET completed = ?, updatedAt = ? WHERE id = ? AND userId = ?"
    );
    stmt.run(existing.completed ? 0 : 1, new Date().toISOString(), id, userId);

    return await this.findById(id, userId);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const db = getDatabase();
    const stmt = db.prepare("DELETE FROM todos WHERE id = ? AND userId = ?");
    const result = stmt.run(id, userId);
    return result.changes > 0;
  }
}

export const todoRepository = new SqliteTodoRepository();
