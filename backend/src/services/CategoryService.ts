import {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "../models/Category";
import { categoryRepository } from "../repositories/CategoryRepository";

const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;

export function isValidHexColor(color: string): boolean {
  return HEX_COLOR_REGEX.test(color);
}

class CategoryService {
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

    // Validate color format
    if (!isValidHexColor(data.color)) {
      throw new Error("Color must be in HEX format (#RRGGBB)");
    }

    return categoryRepository.create(data, userId);
  }

  async updateCategory(
    id: string,
    userId: string,
    data: UpdateCategoryDto
  ): Promise<Category | null> {
    // Validate name if provided
    if (data.name !== undefined && data.name.trim().length === 0) {
      throw new Error("Category name cannot be empty");
    }

    // Validate color format if provided
    if (data.color !== undefined && !isValidHexColor(data.color)) {
      throw new Error("Color must be in HEX format (#RRGGBB)");
    }

    return categoryRepository.update(id, userId, data);
  }

  async deleteCategory(id: string, userId: string): Promise<boolean> {
    return categoryRepository.delete(id, userId);
  }
}

export const categoryService = new CategoryService();
