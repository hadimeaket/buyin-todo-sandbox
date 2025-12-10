import {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "../models/Category";
import { categoryRepository } from "../repositories/CategoryRepository";

class CategoryService {
  // Validate HEX color code
  private isValidHexColor(color: string): boolean {
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexRegex.test(color);
  }

  async getAllCategories(userId: string): Promise<Category[]> {
    return categoryRepository.findAll(userId);
  }

  async getCategoryById(id: string, userId: string): Promise<Category | null> {
    return categoryRepository.findById(id, userId);
  }

  async createCategory(
    data: CreateCategoryDto,
    userId: string
  ): Promise<Category> {
    // Validate name
    if (!data.name || data.name.trim().length === 0) {
      throw new Error("Category name is required");
    }

    if (data.name.trim().length > 50) {
      throw new Error("Category name must be 50 characters or less");
    }

    // Validate color
    if (!data.color || !this.isValidHexColor(data.color)) {
      throw new Error(
        "Invalid color format. Please provide a valid HEX color code (e.g., #FF5733)"
      );
    }

    // Check for duplicate name
    const existing = await categoryRepository.findByName(data.name, userId);
    if (existing) {
      throw new Error("A category with this name already exists");
    }

    return categoryRepository.create(data, userId);
  }

  async updateCategory(
    id: string,
    userId: string,
    data: UpdateCategoryDto
  ): Promise<Category | null> {
    // Validate name if provided
    if (data.name !== undefined) {
      if (data.name.trim().length === 0) {
        throw new Error("Category name cannot be empty");
      }
      if (data.name.trim().length > 50) {
        throw new Error("Category name must be 50 characters or less");
      }

      // Check for duplicate name (excluding current category)
      const existing = await categoryRepository.findByName(data.name, userId);
      if (existing && existing.id !== id) {
        throw new Error("A category with this name already exists");
      }
    }

    // Validate color if provided
    if (data.color !== undefined && !this.isValidHexColor(data.color)) {
      throw new Error(
        "Invalid color format. Please provide a valid HEX color code (e.g., #FF5733)"
      );
    }

    return categoryRepository.update(id, userId, data);
  }

  async deleteCategory(id: string, userId: string): Promise<boolean> {
    return categoryRepository.delete(id, userId);
  }
}

export const categoryService = new CategoryService();
