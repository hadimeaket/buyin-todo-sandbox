import { Category, CreateCategoryDto, UpdateCategoryDto } from '../models/Category';
export declare class CategoryService {
    getAllCategories(userId: string): Category[];
    getCategoryById(id: string, userId: string): Category | null;
    createCategory(dto: CreateCategoryDto, userId: string): Category;
    updateCategory(id: string, userId: string, dto: UpdateCategoryDto): Category | null;
    deleteCategory(id: string, userId: string): boolean;
}
export declare const categoryService: CategoryService;
//# sourceMappingURL=CategoryService.d.ts.map