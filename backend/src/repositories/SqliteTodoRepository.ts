import { Todo, CreateTodoDto, UpdateTodoDto } from "../models/Todo";
import { ITodoRepository } from "./TodoRepository";
import { v4 as uuidv4 } from "uuid";
import {
  getDatabase,
  dateToString,
  stringToDate,
  boolToInt,
  intToBool,
} from "../db/database";
import type Database from "better-sqlite3";

interface TodoRow {
  id: string;
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
  userId: number | null;
  categoryId: string | null;
}

export class SqliteTodoRepository implements ITodoRepository {
  private db: Database.Database;

  constructor() {
    this.db = getDatabase();
  }

  /**
   * Convert database row to Todo object
   */
  private rowToTodo(row: TodoRow): Todo {
    return {
      id: row.id,
      title: row.title,
      description: row.description ?? undefined,
      completed: intToBool(row.completed),
      priority: row.priority as "low" | "medium" | "high",
      dueDate: stringToDate(row.dueDate),
      dueEndDate: stringToDate(row.dueEndDate),
      isAllDay: row.isAllDay !== null ? intToBool(row.isAllDay) : undefined,
      startTime: row.startTime ?? undefined,
      endTime: row.endTime ?? undefined,
      recurrence: (row.recurrence as Todo["recurrence"]) ?? undefined,
      categoryId: row.categoryId ?? undefined,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }

  async findAll(userId?: number): Promise<Todo[]> {
    let stmt;
    let rows;

    if (userId !== undefined) {
      stmt = this.db.prepare(
        "SELECT * FROM todos WHERE userId = ? ORDER BY createdAt DESC"
      );
      rows = stmt.all(userId) as TodoRow[];
    } else {
      stmt = this.db.prepare("SELECT * FROM todos ORDER BY createdAt DESC");
      rows = stmt.all() as TodoRow[];
    }

    return rows.map((row) => this.rowToTodo(row));
  }

  async findById(id: string, userId?: number): Promise<Todo | null> {
    let stmt;
    let row;

    if (userId !== undefined) {
      stmt = this.db.prepare("SELECT * FROM todos WHERE id = ? AND userId = ?");
      row = stmt.get(id, userId) as TodoRow | undefined;
    } else {
      stmt = this.db.prepare("SELECT * FROM todos WHERE id = ?");
      row = stmt.get(id) as TodoRow | undefined;
    }

    return row ? this.rowToTodo(row) : null;
  }

  async findDuplicate(
    title: string,
    description?: string,
    userId?: number
  ): Promise<Todo | null> {
    let stmt;
    let row;

    if (userId !== undefined) {
      if (description) {
        stmt = this.db.prepare(
          "SELECT * FROM todos WHERE LOWER(TRIM(title)) = LOWER(TRIM(?)) AND LOWER(TRIM(description)) = LOWER(TRIM(?)) AND userId = ? LIMIT 1"
        );
        row = stmt.get(title, description, userId) as TodoRow | undefined;
      } else {
        stmt = this.db.prepare(
          "SELECT * FROM todos WHERE LOWER(TRIM(title)) = LOWER(TRIM(?)) AND userId = ? LIMIT 1"
        );
        row = stmt.get(title, userId) as TodoRow | undefined;
      }
    } else {
      if (description) {
        stmt = this.db.prepare(
          "SELECT * FROM todos WHERE LOWER(TRIM(title)) = LOWER(TRIM(?)) AND LOWER(TRIM(description)) = LOWER(TRIM(?)) LIMIT 1"
        );
        row = stmt.get(title, description) as TodoRow | undefined;
      } else {
        stmt = this.db.prepare(
          "SELECT * FROM todos WHERE LOWER(TRIM(title)) = LOWER(TRIM(?)) LIMIT 1"
        );
        row = stmt.get(title) as TodoRow | undefined;
      }
    }

    return row ? this.rowToTodo(row) : null;
  }

  async create(data: CreateTodoDto, userId?: number): Promise<Todo> {
    const now = new Date();
    const todo: Todo = {
      id: uuidv4(),
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

    const stmt = this.db.prepare(`
      INSERT INTO todos (
        id, title, description, completed, priority, 
        dueDate, dueEndDate, isAllDay, startTime, endTime, 
        recurrence, createdAt, updatedAt, userId, categoryId
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      todo.id,
      todo.title,
      todo.description ?? null,
      boolToInt(todo.completed),
      todo.priority,
      dateToString(todo.dueDate),
      dateToString(todo.dueEndDate),
      todo.isAllDay !== undefined ? boolToInt(todo.isAllDay) : null,
      todo.startTime ?? null,
      todo.endTime ?? null,
      todo.recurrence ?? null,
      dateToString(todo.createdAt),
      dateToString(todo.updatedAt),
      userId ?? null,
      todo.categoryId ?? null
    );

    return todo;
  }

  async update(
    id: string,
    data: UpdateTodoDto,
    userId?: number
  ): Promise<Todo | null> {
    const existing = await this.findById(id, userId);
    if (!existing) return null;

    const updatedTodo: Todo = {
      ...existing,
      title: data.title !== undefined ? data.title : existing.title,
      description:
        data.description !== undefined
          ? data.description
          : existing.description,
      completed:
        data.completed !== undefined ? data.completed : existing.completed,
      priority: data.priority !== undefined ? data.priority : existing.priority,
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

    let stmt;
    if (userId !== undefined) {
      stmt = this.db.prepare(`
        UPDATE todos 
        SET title = ?, description = ?, completed = ?, priority = ?,
            dueDate = ?, dueEndDate = ?, isAllDay = ?, startTime = ?, 
            endTime = ?, recurrence = ?, categoryId = ?, updatedAt = ?
        WHERE id = ? AND userId = ?
      `);

      stmt.run(
        updatedTodo.title,
        updatedTodo.description ?? null,
        boolToInt(updatedTodo.completed),
        updatedTodo.priority,
        dateToString(updatedTodo.dueDate),
        dateToString(updatedTodo.dueEndDate),
        updatedTodo.isAllDay !== undefined
          ? boolToInt(updatedTodo.isAllDay)
          : null,
        updatedTodo.startTime ?? null,
        updatedTodo.endTime ?? null,
        updatedTodo.recurrence ?? null,
        updatedTodo.categoryId ?? null,
        dateToString(updatedTodo.updatedAt),
        id,
        userId
      );
    } else {
      stmt = this.db.prepare(`
        UPDATE todos 
        SET title = ?, description = ?, completed = ?, priority = ?,
            dueDate = ?, dueEndDate = ?, isAllDay = ?, startTime = ?, 
            endTime = ?, recurrence = ?, categoryId = ?, updatedAt = ?
        WHERE id = ?
      `);

      stmt.run(
        updatedTodo.title,
        updatedTodo.description ?? null,
        boolToInt(updatedTodo.completed),
        updatedTodo.priority,
        dateToString(updatedTodo.dueDate),
        dateToString(updatedTodo.dueEndDate),
        updatedTodo.isAllDay !== undefined
          ? boolToInt(updatedTodo.isAllDay)
          : null,
        updatedTodo.startTime ?? null,
        updatedTodo.endTime ?? null,
        updatedTodo.recurrence ?? null,
        updatedTodo.categoryId ?? null,
        dateToString(updatedTodo.updatedAt),
        id
      );
    }

    return updatedTodo;
  }

  async toggle(id: string, userId?: number): Promise<Todo | null> {
    const existing = await this.findById(id, userId);
    if (!existing) return null;

    const updatedTodo: Todo = {
      ...existing,
      completed: !existing.completed,
      updatedAt: new Date(),
    };

    let stmt;
    if (userId !== undefined) {
      stmt = this.db.prepare(
        "UPDATE todos SET completed = ?, updatedAt = ? WHERE id = ? AND userId = ?"
      );
      stmt.run(
        boolToInt(updatedTodo.completed),
        dateToString(updatedTodo.updatedAt),
        id,
        userId
      );
    } else {
      stmt = this.db.prepare(
        "UPDATE todos SET completed = ?, updatedAt = ? WHERE id = ?"
      );
      stmt.run(
        boolToInt(updatedTodo.completed),
        dateToString(updatedTodo.updatedAt),
        id
      );
    }

    return updatedTodo;
  }

  async delete(id: string, userId?: number): Promise<boolean> {
    let stmt;
    if (userId !== undefined) {
      stmt = this.db.prepare("DELETE FROM todos WHERE id = ? AND userId = ?");
      const result = stmt.run(id, userId);
      return result.changes > 0;
    } else {
      stmt = this.db.prepare("DELETE FROM todos WHERE id = ?");
      const result = stmt.run(id);
      return result.changes > 0;
    }
  }
}
