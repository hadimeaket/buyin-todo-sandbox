import {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "../models/Category";
import { db } from "../db/database";
import { v4 as uuidv4 } from "uuid";

export interface ICategoryRepository {
  findAll(userId: string): Promise<Category[]>;
  findById(id: string, userId: string): Promise<Category | null>;
  create(data: CreateCategoryDto, userId: string): Promise<Category>;
  update(
    id: string,
    userId: string,
    data: UpdateCategoryDto
  ): Promise<Category | null>;
  delete(id: string, userId: string): Promise<boolean>;
}

class SqliteCategoryRepository implements ICategoryRepository {
  async findAll(userId: string): Promise<Category[]> {
    const categories = db
      .prepare(
        "SELECT * FROM categories WHERE userId = ? ORDER BY createdAt DESC"
      )
      .all(userId);
    return categories.map(this.mapRowToCategory);
  }

  async findById(id: string, userId: string): Promise<Category | null> {
    const category = db
      .prepare("SELECT * FROM categories WHERE id = ? AND userId = ?")
      .get(id, userId);
    return category ? this.mapRowToCategory(category) : null;
  }

  async create(data: CreateCategoryDto, userId: string): Promise<Category> {
    const id = uuidv4();
    const now = new Date().toISOString();

    db.prepare(
      `
      INSERT INTO categories (id, userId, name, color, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `
    ).run(id, userId, data.name, data.color, now, now);

    return {
      id,
      userId,
      name: data.name,
      color: data.color,
      createdAt: new Date(now),
      updatedAt: new Date(now),
    };
  }

  async update(
    id: string,
    userId: string,
    data: UpdateCategoryDto
  ): Promise<Category | null> {
    const existing = await this.findById(id, userId);
    if (!existing) return null;

    const updates: string[] = [];
    const values: unknown[] = [];

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
    values.push(new Date().toISOString());
    values.push(id, userId);

    db.prepare(
      `
      UPDATE categories
      SET ${updates.join(", ")}
      WHERE id = ? AND userId = ?
    `
    ).run(...values);

    return this.findById(id, userId);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = db
      .prepare("DELETE FROM categories WHERE id = ? AND userId = ?")
      .run(id, userId);
    return result.changes > 0;
  }

  private mapRowToCategory(row: unknown): Category {
    const r = row as {
      id: string;
      userId: string;
      name: string;
      color: string;
      createdAt: string;
      updatedAt: string;
    };

    return {
      id: r.id,
      userId: r.userId,
      name: r.name,
      color: r.color,
      createdAt: new Date(r.createdAt),
      updatedAt: new Date(r.updatedAt),
    };
  }
}

export const categoryRepository = new SqliteCategoryRepository();
