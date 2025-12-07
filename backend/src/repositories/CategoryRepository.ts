import { Category, CreateCategoryDto, UpdateCategoryDto } from "../models/Category";
import { v4 as uuidv4 } from "uuid";
import { getDb } from "../database/init";

export interface ICategoryRepository {
  findAll(userId: string): Promise<Category[]>;
  findById(id: string, userId: string): Promise<Category | null>;
  findByName(name: string, userId: string): Promise<Category | null>;
  create(data: CreateCategoryDto, userId: string): Promise<Category>;
  update(id: string, userId: string, data: UpdateCategoryDto): Promise<Category | null>;
  delete(id: string, userId: string): Promise<boolean>;
}

interface CategoryRow {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
}

const rowToCategory = (row: CategoryRow): Category => ({
  id: row.id,
  user_id: row.user_id,
  name: row.name,
  color: row.color,
  created_at: new Date(row.created_at),
  updated_at: new Date(row.updated_at),
});

class SqliteCategoryRepository implements ICategoryRepository {
  async findAll(userId: string): Promise<Category[]> {
    const db = getDb();
    const rows = db
      .prepare("SELECT * FROM categories WHERE user_id = ? ORDER BY name ASC")
      .all(userId) as CategoryRow[];
    return rows.map(rowToCategory);
  }

  async findById(id: string, userId: string): Promise<Category | null> {
    const db = getDb();
    const row = db
      .prepare("SELECT * FROM categories WHERE id = ? AND user_id = ?")
      .get(id, userId) as CategoryRow | undefined;
    return row ? rowToCategory(row) : null;
  }

  async findByName(name: string, userId: string): Promise<Category | null> {
    const db = getDb();
    const row = db
      .prepare("SELECT * FROM categories WHERE name = ? AND user_id = ?")
      .get(name, userId) as CategoryRow | undefined;
    return row ? rowToCategory(row) : null;
  }

  async create(data: CreateCategoryDto, userId: string): Promise<Category> {
    const db = getDb();
    const now = new Date().toISOString();
    const id = uuidv4();

    const stmt = db.prepare(`
      INSERT INTO categories (id, user_id, name, color, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, userId, data.name, data.color, now, now);

    const created = await this.findById(id, userId);
    if (!created) throw new Error("Failed to create category");
    return created;
  }

  async update(id: string, userId: string, data: UpdateCategoryDto): Promise<Category | null> {
    const db = getDb();
    const existing = await this.findById(id, userId);
    if (!existing) return null;

    const now = new Date().toISOString();

    const stmt = db.prepare(`
      UPDATE categories SET
        name = ?,
        color = ?,
        updated_at = ?
      WHERE id = ? AND user_id = ?
    `);

    stmt.run(
      data.name !== undefined ? data.name : existing.name,
      data.color !== undefined ? data.color : existing.color,
      now,
      id,
      userId
    );

    return await this.findById(id, userId);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const db = getDb();
    const result = db
      .prepare("DELETE FROM categories WHERE id = ? AND user_id = ?")
      .run(id, userId);
    return result.changes > 0;
  }
}

export const categoryRepository = new SqliteCategoryRepository();
