import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth";
export declare const getAllTodos: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getTodoById: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const createTodo: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateTodo: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const toggleTodo: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteTodo: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=todoController.d.ts.map