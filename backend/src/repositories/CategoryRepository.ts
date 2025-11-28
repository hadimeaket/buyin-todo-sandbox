import {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "../models/Category";
import { v4 as uuidv4 } from "uuid";
import { todoRepository } from "./TodoRepository";

export interface ICategoryRepository {
  findAll(userId: string): Promise<Category[]>;
  findById(id: string, userId: string): Promise<Category | null>;
  create(data: CreateCategoryDto, userId: string): Promise<Category>;
  update(
    id: string,
    data: UpdateCategoryDto,
    userId: string
  ): Promise<Category | null>;
  delete(id: string, userId: string): Promise<boolean>;
}

class SqliteCategoryRepository implements ICategoryRepository {
  private getDb() {
    return (todoRepository as any).getDatabase();
  }

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
    const rows = this.getDb()
      .prepare("SELECT * FROM categories WHERE userId = ?")
      .all(userId);
    return rows.map((row: any) => this.rowToCategory(row));
  }

  async findById(id: string, userId: string): Promise<Category | null> {
    const row = this.getDb()
      .prepare("SELECT * FROM categories WHERE id = ? AND userId = ?")
      .get(id, userId);
    return row ? this.rowToCategory(row) : null;
  }

  async create(data: CreateCategoryDto, userId: string): Promise<Category> {
    const now = new Date();
    const category: Category = {
      id: uuidv4(),
      userId,
      name: data.name,
      color: data.color || this.generateRandomColor(),
      createdAt: now,
      updatedAt: now,
    };

    const stmt = this.getDb().prepare(`
      INSERT INTO categories (id, userId, name, color, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      category.id,
      category.userId,
      category.name,
      category.color,
      category.createdAt.toISOString(),
      category.updatedAt.toISOString()
    );

    return category;
  }

  async update(
    id: string,
    data: UpdateCategoryDto,
    userId: string
  ): Promise<Category | null> {
    const existing = await this.findById(id, userId);
    if (!existing) return null;

    const updatedCategory: Category = {
      ...existing,
      name: data.name !== undefined ? data.name : existing.name,
      color: data.color !== undefined ? data.color : existing.color,
      updatedAt: new Date(),
    };

    const stmt = this.getDb().prepare(`
      UPDATE categories SET name = ?, color = ?, updatedAt = ?
      WHERE id = ? AND userId = ?
    `);

    stmt.run(
      updatedCategory.name,
      updatedCategory.color,
      updatedCategory.updatedAt.toISOString(),
      id,
      userId
    );

    return updatedCategory;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    // First, remove category from todos that use it
    this.getDb()
      .prepare(
        "UPDATE todos SET categoryId = NULL WHERE categoryId = ? AND userId = ?"
      )
      .run(id, userId);

    // Then delete the category
    const stmt = this.getDb().prepare(
      "DELETE FROM categories WHERE id = ? AND userId = ?"
    );
    const result = stmt.run(id, userId);
    return result.changes > 0;
  }

  private generateRandomColor(): string {
    const colors = [
      "#EF4444", // red
      "#F59E0B", // amber
      "#10B981", // green
      "#3B82F6", // blue
      "#8B5CF6", // purple
      "#EC4899", // pink
      "#06B6D4", // cyan
      "#F97316", // orange
      "#14B8A6", // teal
      "#6366F1", // indigo
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}

export const categoryRepository = new SqliteCategoryRepository();
