import {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "../models/Category";
import { v4 as uuidv4 } from "uuid";
import { db } from "../database/db";

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

interface CategoryRow {
  id: string;
  userId: string;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

function rowToCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    color: row.color,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  };
}

class SQLiteCategoryRepository implements ICategoryRepository {
  async findAll(userId: string): Promise<Category[]> {
    const stmt = db.prepare(
      "SELECT * FROM categories WHERE userId = ? ORDER BY createdAt DESC"
    );
    const rows = stmt.all(userId) as CategoryRow[];
    return rows.map(rowToCategory);
  }

  async findById(id: string, userId: string): Promise<Category | null> {
    const stmt = db.prepare(
      "SELECT * FROM categories WHERE id = ? AND userId = ?"
    );
    const row = stmt.get(id, userId) as CategoryRow | undefined;
    return row ? rowToCategory(row) : null;
  }

  async findByName(name: string, userId: string): Promise<Category | null> {
    const stmt = db.prepare(
      "SELECT * FROM categories WHERE LOWER(TRIM(name)) = ? AND userId = ?"
    );
    const normalizedName = name.toLowerCase().trim();
    const row = stmt.get(normalizedName, userId) as CategoryRow | undefined;
    return row ? rowToCategory(row) : null;
  }

  async create(data: CreateCategoryDto, userId: string): Promise<Category> {
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO categories (id, userId, name, color, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, userId, data.name.trim(), data.color, now, now);

    return {
      id,
      userId,
      name: data.name.trim(),
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

    const now = new Date().toISOString();
    const name = data.name ? data.name.trim() : existing.name;
    const color = data.color || existing.color;

    const stmt = db.prepare(`
      UPDATE categories
      SET name = ?, color = ?, updatedAt = ?
      WHERE id = ? AND userId = ?
    `);

    stmt.run(name, color, now, id, userId);

    return {
      ...existing,
      name,
      color,
      updatedAt: new Date(now),
    };
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const stmt = db.prepare(
      "DELETE FROM categories WHERE id = ? AND userId = ?"
    );
    const result = stmt.run(id, userId);
    return result.changes > 0;
  }
}

export const categoryRepository = new SQLiteCategoryRepository();
