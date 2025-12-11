import { getDatabase } from "../db";
import {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "../models/Category";
import { v4 as uuidv4 } from "uuid";

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
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class CategoryRepository {
  findAllByUserId(userId: string): Category[] {
    const db = getDatabase();
    const rows = db
      .prepare(
        "SELECT * FROM categories WHERE userId = ? ORDER BY createdAt ASC"
      )
      .all(userId) as CategoryRow[];
    return rows.map(rowToCategory);
  }

  findById(id: string, userId: string): Category | null {
    const db = getDatabase();
    const row = db
      .prepare("SELECT * FROM categories WHERE id = ? AND userId = ?")
      .get(id, userId) as CategoryRow | undefined;
    return row ? rowToCategory(row) : null;
  }

  create(dto: CreateCategoryDto, userId: string): Category {
    const db = getDatabase();
    const now = new Date().toISOString();
    const category: Category = {
      id: uuidv4(),
      userId,
      name: dto.name,
      color: dto.color,
      createdAt: now,
      updatedAt: now,
    };

    db.prepare(
      `INSERT INTO categories (id, userId, name, color, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(
      category.id,
      category.userId,
      category.name,
      category.color,
      category.createdAt,
      category.updatedAt
    );

    return category;
  }

  update(id: string, userId: string, dto: UpdateCategoryDto): Category | null {
    const existing = this.findById(id, userId);
    if (!existing) {
      return null;
    }

    const db = getDatabase();
    const now = new Date().toISOString();
    const updatedCategory: Category = {
      ...existing,
      name: dto.name ?? existing.name,
      color: dto.color ?? existing.color,
      updatedAt: now,
    };

    db.prepare(
      `UPDATE categories
       SET name = ?, color = ?, updatedAt = ?
       WHERE id = ? AND userId = ?`
    ).run(
      updatedCategory.name,
      updatedCategory.color,
      updatedCategory.updatedAt,
      id,
      userId
    );

    return updatedCategory;
  }

  delete(id: string, userId: string): boolean {
    const db = getDatabase();
    const result = db
      .prepare("DELETE FROM categories WHERE id = ? AND userId = ?")
      .run(id, userId);
    return result.changes > 0;
  }
}

export const categoryRepository = new CategoryRepository();
