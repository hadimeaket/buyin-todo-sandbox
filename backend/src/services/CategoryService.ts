import { categoryRepository } from "../repositories/CategoryRepository";
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  Category,
} from "../models/Category";

export class CategoryService {
  async getAllCategories(userId: string): Promise<Category[]> {
    return await categoryRepository.findAll(userId);
  }

  async getCategoryById(id: string, userId: string): Promise<Category | null> {
    return await categoryRepository.findById(id, userId);
  }

  async createCategory(
    data: CreateCategoryDto,
    userId: string
  ): Promise<Category> {
    if (!data.name || data.name.trim() === "") {
      throw new Error("Category name is required");
    }

    // Check for duplicate category name for this user
    const existingCategories = await categoryRepository.findAll(userId);
    const duplicate = existingCategories.find(
      (cat) => cat.name.toLowerCase().trim() === data.name.toLowerCase().trim()
    );

    if (duplicate) {
      throw new Error("A category with this name already exists");
    }

    return await categoryRepository.create(data, userId);
  }

  async updateCategory(
    id: string,
    data: UpdateCategoryDto,
    userId: string
  ): Promise<Category | null> {
    if (data.name !== undefined && data.name.trim() === "") {
      throw new Error("Category name cannot be empty");
    }

    // Check for duplicate name if updating name
    if (data.name) {
      const existingCategories = await categoryRepository.findAll(userId);
      const duplicate = existingCategories.find(
        (cat) =>
          cat.id !== id &&
          cat.name.toLowerCase().trim() === data.name!.toLowerCase().trim()
      );

      if (duplicate) {
        throw new Error("A category with this name already exists");
      }
    }

    return await categoryRepository.update(id, data, userId);
  }

  async deleteCategory(id: string, userId: string): Promise<boolean> {
    return await categoryRepository.delete(id, userId);
  }
}

export const categoryService = new CategoryService();
