import {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "../models/Category";
import { v4 as uuidv4 } from "uuid";
import { getDatabase } from "../db/database";

export interface ICategoryRepository {
  findAll(userId: string): Promise<Category[]>;
  findById(id: string, userId: string): Promise<Category | null>;
  findByName(name: string, userId: string): Promise<Category | null>;
  create(data: CreateCategoryDto, userId: string): Promise<Category>;
  update(
    id: string,
    userId: string,
    data: UpdateCategoryDto
  ): Promise<Category | null>;
  delete(id: string, userId: string): Promise<boolean>;
}

class SqliteCategoryRepository implements ICategoryRepository {
  private rowToCategory(row: any): Category {
    return {
      id: row.id,
      userId: row.userId,
      name: row.name,
      color: row.color,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }

  async findAll(userId: string): Promise<Category[]> {
    const db = getDatabase();
    const rows = db
      .prepare(
        "SELECT * FROM categories WHERE userId = ? ORDER BY createdAt DESC"
      )
      .all(userId);
    return rows.map((row) => this.rowToCategory(row));
  }

  async findById(id: string, userId: string): Promise<Category | null> {
    const db = getDatabase();
    const row = db
      .prepare("SELECT * FROM categories WHERE id = ? AND userId = ?")
      .get(id, userId);
    return row ? this.rowToCategory(row) : null;
  }

  async findByName(name: string, userId: string): Promise<Category | null> {
    const db = getDatabase();
    const normalizedName = name.toLowerCase().trim();
    const row = db
      .prepare(
        "SELECT * FROM categories WHERE LOWER(TRIM(name)) = ? AND userId = ?"
      )
      .get(normalizedName, userId);
    return row ? this.rowToCategory(row) : null;
  }

  async create(data: CreateCategoryDto, userId: string): Promise<Category> {
    const db = getDatabase();
    const id = uuidv4();
    const now = new Date().toISOString();

    db.prepare(
      `INSERT INTO categories (id, userId, name, color, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(id, userId, data.name.trim(), data.color.toUpperCase(), now, now);

    const category = await this.findById(id, userId);
    if (!category) {
      throw new Error("Failed to create category");
    }
    return category;
  }

  async update(
    id: string,
    userId: string,
    data: UpdateCategoryDto
  ): Promise<Category | null> {
    const existing = await this.findById(id, userId);
    if (!existing) {
      return null;
    }

    const db = getDatabase();
    const updates: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      updates.push("name = ?");
      values.push(data.name.trim());
    }
    if (data.color !== undefined) {
      updates.push("color = ?");
      values.push(data.color.toUpperCase());
    }

    if (updates.length === 0) {
      return existing;
    }

    updates.push("updatedAt = ?");
    values.push(new Date().toISOString());
    values.push(id, userId);

    db.prepare(
      `UPDATE categories SET ${updates.join(", ")} WHERE id = ? AND userId = ?`
    ).run(...values);

    return this.findById(id, userId);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const db = getDatabase();
    const result = db
      .prepare("DELETE FROM categories WHERE id = ? AND userId = ?")
      .run(id, userId);
    return result.changes > 0;
  }
}

export const categoryRepository: ICategoryRepository =
  new SqliteCategoryRepository();
