import db from "../database/Database";
import { v4 as uuidv4 } from "uuid";
import {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
  isValidHexColor,
} from "../models/Category";

export class CategoryRepository {
  findAllByUser(userId: string): Category[] {
    const stmt = db.prepare(
      "SELECT * FROM categories WHERE userId = ? ORDER BY name ASC"
    );
    return stmt.all(userId) as Category[];
  }

  findByIdAndUser(id: string, userId: string): Category | undefined {
    const stmt = db.prepare(
      "SELECT * FROM categories WHERE id = ? AND userId = ?"
    );
    return stmt.get(id, userId) as Category | undefined;
  }

  findByNameAndUser(name: string, userId: string): Category | undefined {
    const stmt = db.prepare(
      "SELECT * FROM categories WHERE name = ? AND userId = ?"
    );
    return stmt.get(name, userId) as Category | undefined;
  }

  create(data: CreateCategoryDto, userId: string): Category {
    if (!isValidHexColor(data.color)) {
      throw new Error("Invalid HEX color format. Use format: #RRGGBB");
    }

    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO categories (id, userId, name, color, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, userId, data.name, data.color.toUpperCase(), now, now);

    return {
      id,
      userId,
      name: data.name,
      color: data.color.toUpperCase(),
      createdAt: now,
      updatedAt: now,
    };
  }

  update(
    id: string,
    userId: string,
    data: UpdateCategoryDto
  ): Category | undefined {
    const existing = this.findByIdAndUser(id, userId);
    if (!existing) {
      return undefined;
    }

    if (data.color && !isValidHexColor(data.color)) {
      throw new Error("Invalid HEX color format. Use format: #RRGGBB");
    }

    const now = new Date().toISOString();
    const updatedName = data.name ?? existing.name;
    const updatedColor = data.color ? data.color.toUpperCase() : existing.color;

    const stmt = db.prepare(`
      UPDATE categories
      SET name = ?, color = ?, updatedAt = ?
      WHERE id = ? AND userId = ?
    `);

    stmt.run(updatedName, updatedColor, now, id, userId);

    return {
      ...existing,
      name: updatedName,
      color: updatedColor,
      updatedAt: now,
    };
  }

  delete(id: string, userId: string): boolean {
    const stmt = db.prepare(
      "DELETE FROM categories WHERE id = ? AND userId = ?"
    );
    const result = stmt.run(id, userId);
    return result.changes > 0;
  }
}

export default new CategoryRepository();
