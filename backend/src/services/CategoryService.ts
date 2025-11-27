import categoryRepository from "../repositories/CategoryRepository";
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  Category,
} from "../models/Category";

export class CategoryService {
  getAllCategories(userId: string): Category[] {
    return categoryRepository.findAllByUser(userId);
  }

  getCategoryById(id: string, userId: string): Category {
    const category = categoryRepository.findByIdAndUser(id, userId);
    if (!category) {
      throw new Error("Category not found");
    }
    return category;
  }

  createCategory(data: CreateCategoryDto, userId: string): Category {
    // Check for duplicate category name for this user
    const existing = categoryRepository.findByNameAndUser(data.name, userId);
    if (existing) {
      throw new Error("A category with this name already exists");
    }

    return categoryRepository.create(data, userId);
  }

  updateCategory(
    id: string,
    userId: string,
    data: UpdateCategoryDto
  ): Category {
    // If updating name, check for duplicates
    if (data.name) {
      const existing = categoryRepository.findByNameAndUser(data.name, userId);
      if (existing && existing.id !== id) {
        throw new Error("A category with this name already exists");
      }
    }

    const updated = categoryRepository.update(id, userId, data);
    if (!updated) {
      throw new Error("Category not found");
    }
    return updated;
  }

  deleteCategory(id: string, userId: string): void {
    const deleted = categoryRepository.delete(id, userId);
    if (!deleted) {
      throw new Error("Category not found");
    }
  }
}

export default new CategoryService();
