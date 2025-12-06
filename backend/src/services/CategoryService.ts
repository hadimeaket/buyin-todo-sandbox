import type {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "../models/Category";
import type { CategoryRepository } from "../repositories/CategoryRepository";

export class CategoryService {
  constructor(private categoryRepository: CategoryRepository) {}

  private validateHexColor(color: string): boolean {
    // Validate HEX color format: #RRGGBB or #RGB
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexRegex.test(color);
  }

  private normalizeHexColor(color: string): string {
    // Normalize 3-digit hex to 6-digit hex
    if (color.length === 4) {
      return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
    }
    return color.toUpperCase();
  }

  async getAllCategories(userId: string): Promise<Category[]> {
    return this.categoryRepository.findAll(userId);
  }

  async getCategoryById(id: string, userId: string): Promise<Category | null> {
    return this.categoryRepository.findById(id, userId);
  }

  async createCategory(
    data: CreateCategoryDto,
    userId: string
  ): Promise<Category> {
    // Validate name
    if (!data.name || data.name.trim().length === 0) {
      throw new Error("Category name is required");
    }

    if (data.name.length > 50) {
      throw new Error("Category name must be 50 characters or less");
    }

    // Validate and normalize color
    if (!this.validateHexColor(data.color)) {
      throw new Error("Invalid color format. Use HEX format (#RRGGBB or #RGB)");
    }

    const normalizedColor = this.normalizeHexColor(data.color);

    // Check for duplicate name for this user
    const existingCategories = await this.getAllCategories(userId);
    const isDuplicate = existingCategories.some(
      (cat) => cat.name.toLowerCase() === data.name.trim().toLowerCase()
    );

    if (isDuplicate) {
      throw new Error("A category with this name already exists");
    }

    return this.categoryRepository.create(
      {
        name: data.name.trim(),
        color: normalizedColor,
      },
      userId
    );
  }

  async updateCategory(
    id: string,
    data: UpdateCategoryDto,
    userId: string
  ): Promise<Category | null> {
    const existing = await this.getCategoryById(id, userId);
    if (!existing) {
      return null;
    }

    // Validate name if provided
    if (data.name !== undefined) {
      if (data.name.trim().length === 0) {
        throw new Error("Category name cannot be empty");
      }

      if (data.name.length > 50) {
        throw new Error("Category name must be 50 characters or less");
      }

      // Check for duplicate name (excluding current category)
      const existingCategories = await this.getAllCategories(userId);
      const isDuplicate = existingCategories.some(
        (cat) =>
          cat.id !== id &&
          cat.name.toLowerCase() === data.name!.trim().toLowerCase()
      );

      if (isDuplicate) {
        throw new Error("A category with this name already exists");
      }
    }

    // Validate and normalize color if provided
    let normalizedColor: string | undefined;
    if (data.color !== undefined) {
      if (!this.validateHexColor(data.color)) {
        throw new Error(
          "Invalid color format. Use HEX format (#RRGGBB or #RGB)"
        );
      }
      normalizedColor = this.normalizeHexColor(data.color);
    }

    return this.categoryRepository.update(
      id,
      {
        name: data.name?.trim(),
        color: normalizedColor,
      },
      userId
    );
  }

  async deleteCategory(id: string, userId: string): Promise<boolean> {
    return this.categoryRepository.delete(id, userId);
  }
}
