"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const requireAuth = (req, res, next) => {
    const userId = req.headers["x-user-id"];
    if (!userId) {
        res.status(401).json({ error: "Authentication required. Please provide x-user-id header." });
        return;
    }
    req.userId = userId;
    next();
};
exports.requireAuth = requireAuth;
//# sourceMappingURL=auth.js.map