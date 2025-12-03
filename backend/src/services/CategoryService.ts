import { CategoryRepository } from "../repositories/CategoryRepository";
import {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "../models/Category";

export class CategoryService {
  private categoryRepository: CategoryRepository;
  private readonly HEX_COLOR_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  private readonly MAX_NAME_LENGTH = 50;

  constructor() {
    this.categoryRepository = new CategoryRepository();
  }

  /**
   * Validate hex color format
   */
  private validateHexColor(color: string): void {
    if (!this.HEX_COLOR_REGEX.test(color)) {
      throw new Error(
        "Invalid hex color format. Expected format: #RGB or #RRGGBB"
      );
    }
  }

  /**
   * Validate category name
   */
  private validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error("Category name is required");
    }

    if (name.length > this.MAX_NAME_LENGTH) {
      throw new Error(
        `Category name must not exceed ${this.MAX_NAME_LENGTH} characters`
      );
    }
  }

  /**
   * Get all categories for a user
   */
  getAllCategories(userId: number): Category[] {
    return this.categoryRepository.findAll(userId);
  }

  /**
   * Get category by ID
   */
  getCategoryById(id: string, userId: number): Category | null {
    return this.categoryRepository.findById(id, userId);
  }

  /**
   * Create a new category
   */
  createCategory(data: CreateCategoryDto, userId: number): Category {
    this.validateName(data.name);
    this.validateHexColor(data.color);

    // Check if category with same name already exists for this user
    const existing = this.categoryRepository.findByName(data.name, userId);
    if (existing) {
      throw new Error("A category with this name already exists");
    }

    return this.categoryRepository.create(data, userId);
  }

  /**
   * Update a category
   */
  updateCategory(
    id: string,
    data: UpdateCategoryDto,
    userId: number
  ): Category {
    if (data.name !== undefined) {
      this.validateName(data.name);

      // Check if another category with the same name exists
      const existing = this.categoryRepository.findByName(data.name, userId);
      if (existing && existing.id !== id) {
        throw new Error("A category with this name already exists");
      }
    }

    if (data.color !== undefined) {
      this.validateHexColor(data.color);
    }

    const updated = this.categoryRepository.update(id, data, userId);
    if (!updated) {
      throw new Error("Category not found");
    }

    return updated;
  }

  /**
   * Delete a category
   */
  deleteCategory(id: string, userId: number): void {
    // Check if category exists
    const category = this.categoryRepository.findById(id, userId);
    if (!category) {
      throw new Error("Category not found");
    }

    // Check if category has assigned todos
    const todoCount = this.categoryRepository.countTodos(id, userId);
    if (todoCount > 0) {
      throw new Error(
        `Cannot delete category. It has ${todoCount} assigned task(s)`
      );
    }

    const deleted = this.categoryRepository.delete(id, userId);
    if (!deleted) {
      throw new Error("Failed to delete category");
    }
  }
}
