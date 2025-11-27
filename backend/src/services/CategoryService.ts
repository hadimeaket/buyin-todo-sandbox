import { categoryRepository } from "../repositories/CategoryRepository";
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  Category,
} from "../models/Category";

export class CategoryService {
  async getAllCategories(): Promise<Category[]> {
    return await categoryRepository.findAll();
  }

  async getCategoryById(id: string): Promise<Category | null> {
    return await categoryRepository.findById(id);
  }

  async createCategory(data: CreateCategoryDto): Promise<Category> {
    if (!data.name || data.name.trim() === "") {
      throw new Error("Category name is required");
    }

    if (!data.color || !this.isValidHexColor(data.color)) {
      throw new Error("Valid color in hex format is required (e.g., #FF5733)");
    }

    // Check for duplicate name
    const duplicate = await categoryRepository.findByName(data.name);
    if (duplicate) {
      throw new Error("A category with this name already exists");
    }

    return await categoryRepository.create(data);
  }

  async updateCategory(
    id: string,
    data: UpdateCategoryDto
  ): Promise<Category | null> {
    if (data.color && !this.isValidHexColor(data.color)) {
      throw new Error("Valid color in hex format is required (e.g., #FF5733)");
    }

    // Check for duplicate name if name is being updated
    if (data.name) {
      const duplicate = await categoryRepository.findByName(data.name);
      if (duplicate && duplicate.id !== id) {
        throw new Error("A category with this name already exists");
      }
    }

    return await categoryRepository.update(id, data);
  }

  async deleteCategory(id: string): Promise<boolean> {
    return await categoryRepository.delete(id);
  }

  private isValidHexColor(color: string): boolean {
    // Check if it's a valid hex color (e.g., #FF5733 or #F57)
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  }
}

export const categoryService = new CategoryService();
