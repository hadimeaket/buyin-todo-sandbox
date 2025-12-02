import { getDatabase } from "../db/database";
import { Category, CreateCategoryDto, UpdateCategoryDto } from "../models/Category";
import { v4 as uuidv4 } from "uuid";

export interface CategoryRepository {
  findAll(userId: string): Category[];
  findById(id: string, userId: string): Category | null;
  create(data: CreateCategoryDto, userId: string): Category;
  update(id: string, userId: string, data: UpdateCategoryDto): Category | null;
  delete(id: string, userId: string): boolean;
}

export class SqliteCategoryRepository implements CategoryRepository {
  findAll(userId: string): Category[] {
    const db = getDatabase();
    const stmt = db.prepare(
      "SELECT * FROM categories WHERE userId = ? ORDER BY createdAt DESC"
    );
    return stmt.all(userId) as Category[];
  }

  findById(id: string, userId: string): Category | null {
    const db = getDatabase();
    const stmt = db.prepare(
      "SELECT * FROM categories WHERE id = ? AND userId = ?"
    );
    return (stmt.get(id, userId) as Category) || null;
  }

  create(data: CreateCategoryDto, userId: string): Category {
    const db = getDatabase();
    const category: Category = {
      id: uuidv4(),
      name: data.name,
      color: data.color,
      userId,
      createdAt: new Date().toISOString(),
    };

    const stmt = db.prepare(`
      INSERT INTO categories (id, name, color, userId, createdAt)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(
      category.id,
      category.name,
      category.color,
      category.userId,
      category.createdAt
    );

    return category;
  }

  update(id: string, userId: string, data: UpdateCategoryDto): Category | null {
    const existing = this.findById(id, userId);
    if (!existing) {
      return null;
    }

    const db = getDatabase();
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

    if (updates.length === 0) {
      return existing;
    }

    values.push(id, userId);
    const stmt = db.prepare(`
      UPDATE categories
      SET ${updates.join(", ")}
      WHERE id = ? AND userId = ?
    `);

    stmt.run(...values);
    return this.findById(id, userId);
  }

  delete(id: string, userId: string): boolean {
    const db = getDatabase();
    const stmt = db.prepare(
      "DELETE FROM categories WHERE id = ? AND userId = ?"
    );
    const result = stmt.run(id, userId);
    return result.changes > 0;
  }
}

export const categoryRepository = new SqliteCategoryRepository();
