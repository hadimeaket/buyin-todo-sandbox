import { Category, CreateCategoryDto, UpdateCategoryDto } from "../models/Category";
import { ICategoryRepository } from "../repositories/CategoryRepository";
export interface ICategoryService {
    getAllCategories(userId: string): Promise<Category[]>;
    getCategoryById(id: string, userId: string): Promise<Category>;
    createCategory(data: CreateCategoryDto, userId: string): Promise<Category>;
    updateCategory(id: string, userId: string, data: UpdateCategoryDto): Promise<Category>;
    deleteCategory(id: string, userId: string): Promise<void>;
    validateHexColor(color: string): boolean;
}
declare class CategoryService implements ICategoryService {
    private repository;
    constructor(repository: ICategoryRepository);
    validateHexColor(color: string): boolean;
    getAllCategories(userId: string): Promise<Category[]>;
    getCategoryById(id: string, userId: string): Promise<Category>;
    createCategory(data: CreateCategoryDto, userId: string): Promise<Category>;
    updateCategory(id: string, userId: string, data: UpdateCategoryDto): Promise<Category>;
    deleteCategory(id: string, userId: string): Promise<void>;
}
export declare const categoryService: CategoryService;
export {};
//# sourceMappingURL=CategoryService.d.ts.map