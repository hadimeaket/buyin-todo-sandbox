"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const requireAuth = (req, res, next) => {
    if (req.session?.userId) {
        next();
    }
    else {
        res.status(401).json({ message: "Authentication required" });
    }
};
exports.requireAuth = requireAuth;
//# sourceMappingURL=auth.js.map