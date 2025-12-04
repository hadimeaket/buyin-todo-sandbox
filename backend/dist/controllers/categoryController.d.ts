import { Request, Response } from "express";
import { ICategoryService } from "../services/CategoryService";
export declare class CategoryController {
    private service;
    constructor(service: ICategoryService);
    getAllCategories: (req: Request, res: Response) => Promise<void>;
    getCategoryById: (req: Request, res: Response) => Promise<void>;
    createCategory: (req: Request, res: Response) => Promise<void>;
    updateCategory: (req: Request, res: Response) => Promise<void>;
    deleteCategory: (req: Request, res: Response) => Promise<void>;
}
export declare const categoryController: CategoryController;
//# sourceMappingURL=categoryController.d.ts.map