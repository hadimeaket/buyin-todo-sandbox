import Database from "better-sqlite3";
import type {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "../models/Category";
import { v4 as uuidv4 } from "uuid";

export interface CategoryRepository {
  findAll(userId: string): Category[];
  findById(id: string, userId: string): Category | null;
  create(data: CreateCategoryDto, userId: string): Category;
  update(id: string, data: UpdateCategoryDto, userId: string): Category | null;
  delete(id: string, userId: string): boolean;
}

export class SQLiteCategoryRepository implements CategoryRepository {
  constructor(private db: Database.Database) {}

  findAll(userId: string): Category[] {
    const stmt = this.db.prepare(
      "SELECT * FROM categories WHERE userId = ? ORDER BY name ASC"
    );
    const rows = stmt.all(userId) as Array<{
      id: string;
      name: string;
      color: string;
      userId: string;
      createdAt: string;
      updatedAt: string;
    }>;

    return rows.map((row) => ({
      ...row,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    }));
  }

  findById(id: string, userId: string): Category | null {
    const stmt = this.db.prepare(
      "SELECT * FROM categories WHERE id = ? AND userId = ?"
    );
    const row = stmt.get(id, userId) as
      | {
          id: string;
          name: string;
          color: string;
          userId: string;
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

  create(data: CreateCategoryDto, userId: string): Category {
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(
      "INSERT INTO categories (id, name, color, userId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)"
    );

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

  update(id: string, data: UpdateCategoryDto, userId: string): Category | null {
    const existing = this.findById(id, userId);
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

    if (updates.length === 0) {
      return existing;
    }

    updates.push("updatedAt = ?");
    const now = new Date().toISOString();
    values.push(now);

    values.push(id, userId);

    const stmt = this.db.prepare(
      `UPDATE categories SET ${updates.join(", ")} WHERE id = ? AND userId = ?`
    );

    stmt.run(...values);

    return this.findById(id, userId);
  }

  delete(id: string, userId: string): boolean {
    const stmt = this.db.prepare(
      "DELETE FROM categories WHERE id = ? AND userId = ?"
    );
    const result = stmt.run(id, userId);
    return result.changes > 0;
  }
}

export class InMemoryCategoryRepository implements CategoryRepository {
  private categories: Map<string, Category> = new Map();

  findAll(userId: string): Category[] {
    return Array.from(this.categories.values())
      .filter((category) => category.userId === userId)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  findById(id: string, userId: string): Category | null {
    const category = this.categories.get(id);
    if (!category || category.userId !== userId) return null;
    return category;
  }

  create(data: CreateCategoryDto, userId: string): Category {
    const category: Category = {
      id: uuidv4(),
      name: data.name,
      color: data.color,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.categories.set(category.id, category);
    return category;
  }

  update(id: string, data: UpdateCategoryDto, userId: string): Category | null {
    const category = this.findById(id, userId);
    if (!category) return null;

    if (data.name !== undefined) {
      category.name = data.name;
    }

    if (data.color !== undefined) {
      category.color = data.color;
    }

    category.updatedAt = new Date();
    this.categories.set(id, category);
    return category;
  }

  delete(id: string, userId: string): boolean {
    const category = this.findById(id, userId);
    if (!category) return false;
    return this.categories.delete(id);
  }
}
