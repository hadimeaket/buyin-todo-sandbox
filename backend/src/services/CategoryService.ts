import { categoryRepository } from "../repositories/CategoryRepository";
import {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "../models/Category";

class CategoryService {
  getAllCategories(userId: string): Category[] {
    return categoryRepository.findAll(userId);
  }

  getCategoryById(id: string, userId: string): Category | null {
    return categoryRepository.findById(id, userId);
  }

  createCategory(data: CreateCategoryDto, userId: string): Category {
    // Validate hex color format
    if (!this.isValidHexColor(data.color)) {
      throw new Error("Invalid hex color format. Must be in format #RRGGBB");
    }

    // Validate name
    if (!data.name || data.name.trim().length === 0) {
      throw new Error("Category name is required");
    }

    if (data.name.length > 50) {
      throw new Error("Category name must be 50 characters or less");
    }

    return categoryRepository.create(data, userId);
  }

  updateCategory(
    id: string,
    userId: string,
    data: UpdateCategoryDto
  ): Category {
    // Validate hex color if provided
    if (data.color && !this.isValidHexColor(data.color)) {
      throw new Error("Invalid hex color format. Must be in format #RRGGBB");
    }

    // Validate name if provided
    if (data.name !== undefined) {
      if (data.name.trim().length === 0) {
        throw new Error("Category name cannot be empty");
      }
      if (data.name.length > 50) {
        throw new Error("Category name must be 50 characters or less");
      }
    }

    const category = categoryRepository.update(id, userId, data);
    if (!category) {
      throw new Error("Category not found");
    }
    return category;
  }

  deleteCategory(id: string, userId: string): boolean {
    const deleted = categoryRepository.delete(id, userId);
    if (!deleted) {
      throw new Error("Category not found");
    }
    return true;
  }

  private isValidHexColor(color: string): boolean {
    // Must start with # and be followed by exactly 6 hex digits
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
    return hexColorRegex.test(color);
  }
}

export const categoryService = new CategoryService();
