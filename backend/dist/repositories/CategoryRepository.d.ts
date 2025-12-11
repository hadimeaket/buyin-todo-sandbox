import { Category, CreateCategoryDto, UpdateCategoryDto } from '../models/Category';
export declare class CategoryRepository {
    findAllByUserId(userId: string): Category[];
    findById(id: string, userId: string): Category | null;
    create(dto: CreateCategoryDto, userId: string): Category;
    update(id: string, userId: string, dto: UpdateCategoryDto): Category | null;
    delete(id: string, userId: string): boolean;
}
export declare const categoryRepository: CategoryRepository;
//# sourceMappingURL=CategoryRepository.d.ts.map