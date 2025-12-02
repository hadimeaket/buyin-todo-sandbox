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

interface TodoRow {
  id: string;
  userId: string;
  categoryId: string | null;
  title: string;
  description: string | null;
  completed: number;
  priority: "low" | "medium" | "high";
  dueDate: string | null;
  dueEndDate: string | null;
  isAllDay: number | null;
  startTime: string | null;
  endTime: string | null;
  recurrence: "none" | "daily" | "weekly" | "monthly" | "yearly";
  createdAt: string;
  updatedAt: string;
}

function rowToTodo(row: TodoRow): Todo {
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
    const stmt = db.prepare(
      "SELECT * FROM todos WHERE userId = ? AND LOWER(TRIM(title)) = LOWER(TRIM(?))"
    );
    const rows = stmt.all(userId, title) as TodoRow[];

    const duplicate = rows.find((row) => {
      const descMatch =
        !description ||
        (row.description &&
          row.description.toLowerCase().trim() ===
            description.toLowerCase().trim());
      return descMatch;
    });

    return duplicate ? rowToTodo(duplicate) : null;
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

  async update(
    id: string,
    userId: string,
    data: UpdateTodoDto
  ): Promise<Todo | null> {
    const existing = await this.findById(id, userId);
    if (!existing) return null;

    const db = getDatabase();
    const updates: string[] = [];
    const values: any[] = [];

    if (data.title !== undefined) {
      updates.push("title = ?");
      values.push(data.title);
    }
    if (data.categoryId !== undefined) {
      updates.push("categoryId = ?");
      values.push(data.categoryId || null);
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

    updates.push("updatedAt = ?");
    values.push(new Date().toISOString());

    values.push(id);

    const stmt = db.prepare(
      `UPDATE todos SET ${updates.join(", ")} WHERE id = ? AND userId = ?`
    );
    values.push(userId);
    stmt.run(...values);

    return this.findById(id, userId);
  }

  async toggle(id: string, userId: string): Promise<Todo | null> {
    const existing = await this.findById(id, userId);
    if (!existing) return null;

    const db = getDatabase();
    const stmt = db.prepare(
      "UPDATE todos SET completed = ?, updatedAt = ? WHERE id = ? AND userId = ?"
    );
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
