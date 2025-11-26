import { Category, CreateCategoryDto, UpdateCategoryDto } from "../models/Category";
import { v4 as uuidv4 } from "uuid";

export interface ICategoryRepository {
  findAll(): Promise<Category[]>;
  findById(id: string): Promise<Category | null>;
  findByName(name: string): Promise<Category | null>;
  create(data: CreateCategoryDto): Promise<Category>;
  update(id: string, data: UpdateCategoryDto): Promise<Category | null>;
  delete(id: string): Promise<boolean>;
  initializeDefaultCategories(): Promise<void>;
}

class InMemoryCategoryRepository implements ICategoryRepository {
  private categories: Category[] = [];
  private initialized = false;

  async initializeDefaultCategories(): Promise<void> {
    if (this.initialized) return;
    
    const defaultCategories = [
      { name: "Gym", color: "#FF6B6B" },
      { name: "Work", color: "#4ECDC4" },
      { name: "Personal", color: "#95E1D3" },
      { name: "Shopping", color: "#FFE66D" },
      { name: "Health", color: "#A8E6CF" },
    ];

    for (const cat of defaultCategories) {
      const exists = await this.findByName(cat.name);
      if (!exists) {
        await this.create(cat);
      }
    }
    
    this.initialized = true;
    console.log(`[CategoryRepository] Initialized with ${this.categories.length} default categories`);
  }

  async findAll(): Promise<Category[]> {
    return [...this.categories];
  }

  async findById(id: string): Promise<Category | null> {
    const category = this.categories.find((c) => c.id === id);
    return category || null;
  }

  async findByName(name: string): Promise<Category | null> {
    const category = this.categories.find(
      (c) => c.name.toLowerCase().trim() === name.toLowerCase().trim()
    );
    return category || null;
  }

  async create(data: CreateCategoryDto): Promise<Category> {
    const now = new Date();
    const category: Category = {
      id: uuidv4(),
      name: data.name,
      color: data.color,
      createdAt: now,
      updatedAt: now,
    };
    this.categories.push(category);
    return category;
  }

  async update(id: string, data: UpdateCategoryDto): Promise<Category | null> {
    const index = this.categories.findIndex((c) => c.id === id);
    if (index === -1) return null;

    const updatedCategory: Category = {
      ...this.categories[index],
      ...data,
      updatedAt: new Date(),
    };
    this.categories[index] = updatedCategory;
    return updatedCategory;
  }

  async delete(id: string): Promise<boolean> {
    const index = this.categories.findIndex((c) => c.id === id);
    if (index === -1) return false;

    this.categories.splice(index, 1);
    return true;
  }
}

export const categoryRepository = new InMemoryCategoryRepository();
