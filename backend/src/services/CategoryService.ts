import {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "../models/Category";
import {
  categoryRepository,
  ICategoryRepository,
} from "../repositories/CategoryRepository";
import { todoRepository } from "../repositories/TodoRepository";

export interface ICategoryService {
  getAllCategories(userId: string): Promise<Category[]>;
  getCategoryById(id: string, userId: string): Promise<Category>;
  createCategory(data: CreateCategoryDto, userId: string): Promise<Category>;
  updateCategory(
    id: string,
    userId: string,
    data: UpdateCategoryDto
  ): Promise<Category>;
  deleteCategory(id: string, userId: string): Promise<void>;
  validateHexColor(color: string): boolean;
}

class CategoryService implements ICategoryService {
  constructor(private repository: ICategoryRepository) {}

  validateHexColor(color: string): boolean {
    // Validiert HEX-Format: #RGB oder #RRGGBB
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexRegex.test(color);
  }

  async getAllCategories(userId: string): Promise<Category[]> {
    return this.repository.findAll(userId);
  }

  async getCategoryById(id: string, userId: string): Promise<Category> {
    const category = await this.repository.findById(id, userId);
    if (!category) {
      throw new Error("Category not found");
    }
    return category;
  }

  async createCategory(
    data: CreateCategoryDto,
    userId: string
  ): Promise<Category> {
    // Validiere Name
    if (!data.name || data.name.trim().length === 0) {
      throw new Error("Category name is required");
    }

    if (data.name.trim().length > 50) {
      throw new Error("Category name cannot exceed 50 characters");
    }

    // Validiere HEX-Farbe
    if (!data.color) {
      throw new Error("Color is required");
    }

    if (!this.validateHexColor(data.color)) {
      throw new Error("Invalid HEX color format. Use #RGB or #RRGGBB");
    }

    // Prüfe auf Duplikat
    const existing = await this.repository.findByName(data.name, userId);
    if (existing) {
      throw new Error("Category with this name already exists");
    }

    return this.repository.create(data, userId);
  }

  async updateCategory(
    id: string,
    userId: string,
    data: UpdateCategoryDto
  ): Promise<Category> {
    // Validiere Name falls angegeben
    if (data.name !== undefined) {
      if (data.name.trim().length === 0) {
        throw new Error("Category name cannot be empty");
      }
      if (data.name.trim().length > 50) {
        throw new Error("Category name cannot exceed 50 characters");
      }

      // Prüfe auf Duplikat (nur wenn Name geändert wird)
      const existing = await this.repository.findByName(data.name, userId);
      if (existing && existing.id !== id) {
        throw new Error("Category with this name already exists");
      }
    }

    // Validiere HEX-Farbe falls angegeben
    if (data.color !== undefined && !this.validateHexColor(data.color)) {
      throw new Error("Invalid HEX color format. Use #RGB or #RRGGBB");
    }

    const updated = await this.repository.update(id, userId, data);
    if (!updated) {
      throw new Error("Category not found");
    }

    return updated;
  }

  async deleteCategory(id: string, userId: string): Promise<void> {
    // Entferne Category-Zuweisung von allen Todos
    await todoRepository.removeCategoryFromTodos(id, userId);

    const deleted = await this.repository.delete(id, userId);
    if (!deleted) {
      throw new Error("Category not found");
    }
  }
}

export const categoryService = new CategoryService(categoryRepository);
