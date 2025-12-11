import { categoryRepository } from "../repositories/CategoryRepository";
import {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "../models/Category";

export class CategoryService {
  getAllCategories(userId: string): Category[] {
    return categoryRepository.findAllByUserId(userId);
  }

  getCategoryById(id: string, userId: string): Category | null {
    return categoryRepository.findById(id, userId);
  }

  createCategory(dto: CreateCategoryDto, userId: string): Category {
    // Validate color format (hex color)
    if (!dto.color.match(/^#[0-9A-Fa-f]{6}$/)) {
      throw new Error("Invalid color format. Use hex color (e.g., #FF5733)");
    }

    if (!dto.name || dto.name.trim().length === 0) {
      throw new Error("Category name is required");
    }

    return categoryRepository.create(dto, userId);
  }

  updateCategory(
    id: string,
    userId: string,
    dto: UpdateCategoryDto
  ): Category | null {
    if (dto.color && !dto.color.match(/^#[0-9A-Fa-f]{6}$/)) {
      throw new Error("Invalid color format. Use hex color (e.g., #FF5733)");
    }

    if (dto.name !== undefined && dto.name.trim().length === 0) {
      throw new Error("Category name cannot be empty");
    }

    return categoryRepository.update(id, userId, dto);
  }

  deleteCategory(id: string, userId: string): boolean {
    return categoryRepository.delete(id, userId);
  }
}

export const categoryService = new CategoryService();
