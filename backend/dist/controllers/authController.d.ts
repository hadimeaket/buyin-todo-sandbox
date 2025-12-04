import { Request, Response, NextFunction } from "express";
export declare const register: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const login: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const logout: (req: Request, res: Response) => void;
export declare const getCurrentUser: (req: Request, res: Response) => void;
//# sourceMappingURL=authController.d.ts.map