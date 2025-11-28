"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const AuthService_1 = require("../services/AuthService");
const register = async (req, res) => {
    try {
        const user = await AuthService_1.authService.register(req.body);
        res.status(201).json(user);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: "Internal server error" });
        }
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const user = await AuthService_1.authService.login(req.body);
        res.status(200).json(user);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(401).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: "Internal server error" });
        }
    }
};
exports.login = login;
//# sourceMappingURL=authController.js.map