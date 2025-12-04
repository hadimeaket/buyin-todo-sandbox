"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = exports.logout = exports.login = exports.register = void 0;
const AuthService_1 = require("../services/AuthService");
const register = async (req, res, next) => {
    try {
        const data = req.body;
        const user = await AuthService_1.authService.register(data);
        // Set session and save it
        if (req.session) {
            req.session.userId = user.id;
            req.session.email = user.email;
            // Ensure session is saved before sending response
            try {
                await new Promise((resolve, reject) => {
                    req.session.save((err) => {
                        if (err) {
                            console.error("Session save error:", err);
                            reject(err);
                        }
                        else {
                            console.log("Session saved successfully for user:", user.email);
                            resolve();
                        }
                    });
                });
            }
            catch (sessionError) {
                console.error("Failed to save session:", sessionError);
                throw sessionError;
            }
        }
        res.status(201).json({
            id: user.id,
            email: user.email,
            createdAt: user.createdAt,
        });
    }
    catch (error) {
        if (error.message === "Password must be at least 8 characters long" ||
            error.message === "Valid email is required" ||
            error.message === "User with this email already exists") {
            res.status(400).json({ message: error.message });
        }
        else {
            console.error("Registration error:", error);
            next(error);
        }
    }
};
exports.register = register;
const login = async (req, res, next) => {
    try {
        const data = req.body;
        const user = await AuthService_1.authService.login(data);
        // Set session and save it
        if (req.session) {
            req.session.userId = user.id;
            req.session.email = user.email;
            // Ensure session is saved before sending response
            await new Promise((resolve, reject) => {
                req.session.save((err) => {
                    if (err)
                        reject(err);
                    else
                        resolve();
                });
            });
        }
        res.status(200).json({
            id: user.id,
            email: user.email,
        });
    }
    catch (error) {
        if (error.message === "Invalid email or password") {
            res.status(401).json({ message: error.message });
        }
        else {
            next(error);
        }
    }
};
exports.login = login;
const logout = (req, res) => {
    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                res.status(500).json({ message: "Failed to logout" });
                return;
            }
            res.status(200).json({ message: "Logged out successfully" });
        });
    }
    else {
        res.status(200).json({ message: "Logged out successfully" });
    }
};
exports.logout = logout;
const getCurrentUser = (req, res) => {
    if (req.session?.userId) {
        const user = AuthService_1.authService.getUserById(req.session.userId);
        if (user) {
            res.status(200).json({
                id: user.id,
                email: user.email,
            });
            return;
        }
    }
    res.status(401).json({ message: "Not authenticated" });
};
exports.getCurrentUser = getCurrentUser;
//# sourceMappingURL=authController.js.map