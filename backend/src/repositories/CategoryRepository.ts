import { Database } from "better-sqlite3";
import { v4 as uuidv4 } from "uuid";
import { getDatabase } from "../db/database";
import {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "../models/Category";

export class CategoryRepository {
  private db: Database;

  constructor() {
    this.db = getDatabase();
  }

  /**
   * Find all categories for a user
   */
  findAll(userId: number): Category[] {
    const stmt = this.db.prepare(`
      SELECT id, name, color, userId, createdAt, updatedAt
      FROM categories
      WHERE userId = ?
      ORDER BY name ASC
    `);

    const rows = stmt.all(userId) as Array<{
      id: string;
      name: string;
      color: string;
      userId: number;
      createdAt: string;
      updatedAt: string;
    }>;

    return rows.map((row) => ({
      ...row,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    }));
  }

  /**
   * Find category by ID and user
   */
  findById(id: string, userId: number): Category | null {
    const stmt = this.db.prepare(`
      SELECT id, name, color, userId, createdAt, updatedAt
      FROM categories
      WHERE id = ? AND userId = ?
    `);

    const row = stmt.get(id, userId) as
      | {
          id: string;
          name: string;
          color: string;
          userId: number;
          createdAt: string;
          updatedAt: string;
        }
      | undefined;

    if (!row) return null;

    return {
      ...row,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }

  /**
   * Find category by name and user
   */
  findByName(name: string, userId: number): Category | null {
    const stmt = this.db.prepare(`
      SELECT id, name, color, userId, createdAt, updatedAt
      FROM categories
      WHERE name = ? AND userId = ?
    `);

    const row = stmt.get(name, userId) as
      | {
          id: string;
          name: string;
          color: string;
          userId: number;
          createdAt: string;
          updatedAt: string;
        }
      | undefined;

    if (!row) return null;

    return {
      ...row,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }

  /**
   * Create a new category
   */
  create(data: CreateCategoryDto, userId: number): Category {
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO categories (id, name, color, userId, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, data.name, data.color, userId, now, now);

    return {
      id,
      name: data.name,
      color: data.color,
      userId,
      createdAt: new Date(now),
      updatedAt: new Date(now),
    };
  }

  /**
   * Update a category
   */
  update(id: string, data: UpdateCategoryDto, userId: number): Category | null {
    const existing = this.findById(id, userId);
    if (!existing) return null;

    const now = new Date().toISOString();
    const updates: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      updates.push("name = ?");
      values.push(data.name);
    }

    if (data.color !== undefined) {
      updates.push("color = ?");
      values.push(data.color);
    }

    if (updates.length === 0) return existing;

    updates.push("updatedAt = ?");
    values.push(now);
    values.push(id, userId);

    const stmt = this.db.prepare(`
      UPDATE categories
      SET ${updates.join(", ")}
      WHERE id = ? AND userId = ?
    `);

    stmt.run(...values);

    return this.findById(id, userId);
  }

  /**
   * Delete a category
   */
  delete(id: string, userId: number): boolean {
    const stmt = this.db.prepare(`
      DELETE FROM categories
      WHERE id = ? AND userId = ?
    `);

    const result = stmt.run(id, userId);
    return result.changes > 0;
  }

  /**
   * Count todos assigned to a category
   */
  countTodos(categoryId: string, userId: number): number {
    const stmt = this.db.prepare(`
      SELECT COUNT(*) as count
      FROM todos
      WHERE categoryId = ? AND userId = ?
    `);

    const result = stmt.get(categoryId, userId) as { count: number };
    return result.count;
  }
}
