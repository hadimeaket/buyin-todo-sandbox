import { Todo, CreateTodoDto, UpdateTodoDto } from "../models/Todo";
import { v4 as uuidv4 } from "uuid";
import { getDb } from "../database/init";

export interface ITodoRepository {
  findAll(userId: string): Promise<Todo[]>;
  findById(id: string, userId: string): Promise<Todo | null>;
  findDuplicate(title: string, userId: string, description?: string): Promise<Todo | null>;
  create(data: CreateTodoDto, userId: string): Promise<Todo>;
  update(id: string, userId: string, data: UpdateTodoDto): Promise<Todo | null>;
  toggle(id: string, userId: string): Promise<Todo | null>;
  delete(id: string, userId: string): Promise<boolean>;
}

// SQLite row type (what comes from database)
interface TodoRow {
  id: string;
  user_id: string | null;
  category_id: string | null;
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

// Helper: Convert SQLite row to Todo object
const rowToTodo = (row: TodoRow): Todo => ({
  id: row.id,
  title: row.title,
  description: row.description || undefined,
  completed: row.completed === 1,
  priority: row.priority as "low" | "medium" | "high",
  dueDate: row.dueDate ? new Date(row.dueDate) : undefined,
  dueEndDate: row.dueEndDate ? new Date(row.dueEndDate) : undefined,
  isAllDay: row.isAllDay !== null ? row.isAllDay === 1 : undefined,
  startTime: row.startTime || undefined,
  endTime: row.endTime || undefined,
  recurrence: row.recurrence as Todo["recurrence"],
  category_id: row.category_id || undefined,
  createdAt: new Date(row.createdAt),
  updatedAt: new Date(row.updatedAt),
});

class SqliteTodoRepository implements ITodoRepository {
  async findAll(userId: string): Promise<Todo[]> {
    const db = getDb();
    const rows = db.prepare("SELECT * FROM todos WHERE user_id = ?").all(userId) as TodoRow[];
    return rows.map(rowToTodo);
  }

  async findById(id: string, userId: string): Promise<Todo | null> {
    const db = getDb();
    const row = db
      .prepare("SELECT * FROM todos WHERE id = ? AND user_id = ?")
      .get(id, userId) as TodoRow | undefined;
    return row ? rowToTodo(row) : null;
  }

  async findDuplicate(
    title: string,
    userId: string,
    description?: string
  ): Promise<Todo | null> {
    const db = getDb();
    const normalizedTitle = title.toLowerCase().trim();
    const normalizedDesc = description?.toLowerCase().trim();

    const rows = db.prepare("SELECT * FROM todos WHERE user_id = ?").all(userId) as TodoRow[];
    const duplicate = rows.find((row) => {
      const titleMatch =
        row.title.toLowerCase().trim() === normalizedTitle;
      const descMatch =
        !normalizedDesc ||
        (row.description?.toLowerCase().trim() === normalizedDesc);
      return titleMatch && descMatch;
    });

    return duplicate ? rowToTodo(duplicate) : null;
  }

  async create(data: CreateTodoDto, userId: string): Promise<Todo> {
    const db = getDb();
    const now = new Date().toISOString();
    const id = uuidv4();

    const stmt = db.prepare(`
      INSERT INTO todos (
        id, user_id, category_id, title, description, completed, priority,
        dueDate, dueEndDate, isAllDay, startTime, endTime,
        recurrence, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      userId,
      data.category_id || null,
      data.title,
      data.description || null,
      0, // completed = false
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

  async update(id: string, userId: string, data: UpdateTodoDto): Promise<Todo | null> {
    const db = getDb();
    const existing = await this.findById(id, userId);
    if (!existing) return null;

    const now = new Date().toISOString();

    const stmt = db.prepare(`
      UPDATE todos SET
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
        category_id = ?,
        updatedAt = ?
      WHERE id = ? AND user_id = ?
    `);

    stmt.run(
      data.title !== undefined ? data.title : existing.title,
      data.description !== undefined ? data.description || null : existing.description || null,
      data.completed !== undefined ? (data.completed ? 1 : 0) : (existing.completed ? 1 : 0),
      data.priority !== undefined ? data.priority : existing.priority,
      data.dueDate !== undefined ? data.dueDate || null : existing.dueDate?.toISOString() || null,
      data.dueEndDate !== undefined ? data.dueEndDate || null : existing.dueEndDate?.toISOString() || null,
      data.isAllDay !== undefined ? (data.isAllDay ? 1 : 0) : existing.isAllDay !== undefined ? (existing.isAllDay ? 1 : 0) : null,
      data.startTime !== undefined ? data.startTime || null : existing.startTime || null,
      data.endTime !== undefined ? data.endTime || null : existing.endTime || null,
      data.recurrence !== undefined ? data.recurrence : existing.recurrence,
      data.category_id !== undefined ? data.category_id || null : existing.category_id || null,
      now,
      id,
      userId
    );

    return await this.findById(id, userId);
  }

  async toggle(id: string, userId: string): Promise<Todo | null> {
    const db = getDb();
    const existing = await this.findById(id, userId);
    if (!existing) return null;

    const stmt = db.prepare(`
      UPDATE todos SET
        completed = ?,
        updatedAt = ?
      WHERE id = ? AND user_id = ?
    `);

    stmt.run(existing.completed ? 0 : 1, new Date().toISOString(), id, userId);
    return await this.findById(id, userId);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const db = getDb();
    const result = db.prepare("DELETE FROM todos WHERE id = ? AND user_id = ?").run(id, userId);
    return result.changes > 0;
  }
}

// LEGACY: Keep for reference (commented out)
/*
class InMemoryTodoRepository implements ITodoRepository {
  private todos: Todo[] = [];
  // ... (original implementation)
}
*/

// Export SQLite repository instance
export const todoRepository = new SqliteTodoRepository();
