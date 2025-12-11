"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const AuthService_1 = require("../services/AuthService");
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ message: "No token provided" });
            return;
        }
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        const { userId } = AuthService_1.authService.verifyToken(token);
        req.userId = userId;
        next();
    }
    catch (error) {
        res.status(401).json({ message: "Invalid or expired token" });
    }
};
exports.authMiddleware = authMiddleware;
//# sourceMappingURL=auth.js.map