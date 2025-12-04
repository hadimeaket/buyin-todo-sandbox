import { Category, CreateCategoryDto, UpdateCategoryDto } from "../models/Category";
export interface ICategoryRepository {
    findAll(userId: string): Promise<Category[]>;
    findById(id: string, userId: string): Promise<Category | null>;
    findByName(name: string, userId: string): Promise<Category | null>;
    create(data: CreateCategoryDto, userId: string): Promise<Category>;
    update(id: string, userId: string, data: UpdateCategoryDto): Promise<Category | null>;
    delete(id: string, userId: string): Promise<boolean>;
}
declare class SQLiteCategoryRepository implements ICategoryRepository {
    findAll(userId: string): Promise<Category[]>;
    findById(id: string, userId: string): Promise<Category | null>;
    findByName(name: string, userId: string): Promise<Category | null>;
    create(data: CreateCategoryDto, userId: string): Promise<Category>;
    update(id: string, userId: string, data: UpdateCategoryDto): Promise<Category | null>;
    delete(id: string, userId: string): Promise<boolean>;
}
export declare const categoryRepository: SQLiteCategoryRepository;
export {};
//# sourceMappingURL=CategoryRepository.d.ts.map