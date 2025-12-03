import { Request, Response, NextFunction } from "express";
export declare const getAllTodos: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getTodoById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const createTodo: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateTodo: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const toggleTodo: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteTodo: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=todoController.d.ts.map