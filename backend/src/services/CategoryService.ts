import { categoryRepository } from "../repositories/CategoryRepository";
import { CreateCategoryDto, UpdateCategoryDto, Category } from "../models/Category";

// HEX color validation regex: #RRGGBB
const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;

export class CategoryService {
  validateHexColor(color: string): boolean {
    return HEX_COLOR_REGEX.test(color);
  }

  async getAllCategories(userId: string): Promise<Category[]> {
    return await categoryRepository.findAll(userId);
  }

  async getCategoryById(id: string, userId: string): Promise<Category | null> {
    return await categoryRepository.findById(id, userId);
  }

  async createCategory(data: CreateCategoryDto, userId: string): Promise<Category> {
    // Validate name
    if (!data.name || data.name.trim() === "") {
      throw new Error("Category name is required");
    }

    // Validate color format
    if (!this.validateHexColor(data.color)) {
      throw new Error("Invalid color format. Use HEX format: #RRGGBB (e.g., #FF5733)");
    }

    // Check for duplicate name
    const duplicate = await categoryRepository.findByName(data.name, userId);
    if (duplicate) {
      throw new Error("A category with this name already exists");
    }

    return await categoryRepository.create(data, userId);
  }

  async updateCategory(
    id: string,
    userId: string,
    data: UpdateCategoryDto
  ): Promise<Category | null> {
    // Validate color format if provided
    if (data.color !== undefined && !this.validateHexColor(data.color)) {
      throw new Error("Invalid color format. Use HEX format: #RRGGBB (e.g., #FF5733)");
    }

    // Validate name if provided
    if (data.name !== undefined && data.name.trim() === "") {
      throw new Error("Category name cannot be empty");
    }

    // Check for duplicate name if changing name
    if (data.name) {
      const duplicate = await categoryRepository.findByName(data.name, userId);
      if (duplicate && duplicate.id !== id) {
        throw new Error("A category with this name already exists");
      }
    }

    return await categoryRepository.update(id, userId, data);
  }

  async deleteCategory(id: string, userId: string): Promise<boolean> {
    return await categoryRepository.delete(id, userId);
  }
}

export const categoryService = new CategoryService();
