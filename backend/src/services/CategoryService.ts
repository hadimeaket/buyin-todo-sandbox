/**
 * Category Service
 *
 * Business logic for category management
 */

import { categoryRepository } from "../repositories/CategoryRepository";
import {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "../models/Category";

export class CategoryService {
  /**
   * Validate HEX color format
   */
  private validateHexColor(color: string): void {
    const hexRegex = /^#[0-9A-Fa-f]{6}$/;
    if (!hexRegex.test(color)) {
      throw new Error(
        "Invalid HEX color format. Use #RRGGBB format (e.g., #FF5733)"
      );
    }
  }

  /**
   * Validate category name
   */
  private validateName(name: string): void {
    const trimmedName = name.trim();
    if (trimmedName.length < 1 || trimmedName.length > 50) {
      throw new Error("Category name must be between 1 and 50 characters");
    }
  }

  /**
   * Get all categories for a user
   */
  async getAllCategories(userId: string): Promise<Category[]> {
    return await categoryRepository.findAll(userId);
  }

  /**
   * Get category by ID
   */
  async getCategoryById(id: string, userId: string): Promise<Category> {
    const category = await categoryRepository.findById(id, userId);

    if (!category) {
      throw new Error("Category not found");
    }

    return category;
  }

  /**
   * Create new category
   */
  async createCategory(
    data: CreateCategoryDto,
    userId: string
  ): Promise<Category> {
    // Validate input
    this.validateName(data.name);
    this.validateHexColor(data.color);

    // Check for duplicate name
    const existing = await categoryRepository.findByName(data.name, userId);
    if (existing) {
      throw new Error("Category with this name already exists");
    }

    return await categoryRepository.create(data, userId);
  }

  /**
   * Update category
   */
  async updateCategory(
    id: string,
    data: UpdateCategoryDto,
    userId: string
  ): Promise<Category> {
    // Validate input
    if (data.name !== undefined) {
      this.validateName(data.name);

      // Check for duplicate name (exclude current category)
      const existing = await categoryRepository.findByName(data.name, userId);
      if (existing && existing.id !== id) {
        throw new Error("Category with this name already exists");
      }
    }

    if (data.color !== undefined) {
      this.validateHexColor(data.color);
    }

    const category = await categoryRepository.update(id, data, userId);

    if (!category) {
      throw new Error("Category not found");
    }

    return category;
  }

  /**
   * Delete category
   */
  async deleteCategory(id: string, userId: string): Promise<void> {
    // Check if category exists and belongs to user
    const category = await categoryRepository.findById(id, userId);
    if (!category) {
      throw new Error("Category not found");
    }

    // Check if category is used by any todos
    const todoCount = await categoryRepository.countTodosWithCategory(id);
    if (todoCount > 0) {
      throw new Error(
        `Cannot delete category. It is assigned to ${todoCount} todo(s). Please reassign or delete those todos first.`
      );
    }

    const deleted = await categoryRepository.delete(id, userId);

    if (!deleted) {
      throw new Error("Failed to delete category");
    }
  }

  /**
   * Check if category exists and belongs to user
   */
  async validateCategoryOwnership(
    categoryId: string,
    userId: string
  ): Promise<boolean> {
    const category = await categoryRepository.findById(categoryId, userId);
    return category !== null;
  }
}

export const categoryService = new CategoryService();
