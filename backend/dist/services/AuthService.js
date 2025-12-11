"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const UserRepository_1 = require("../repositories/UserRepository");
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = "7d";
class AuthService {
    async register(data) {
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            throw new Error("Invalid email format");
        }
        // Validate password length
        if (data.password.length < 8) {
            throw new Error("Password must be at least 8 characters long");
        }
        // Check if user already exists
        const existingUser = await UserRepository_1.userRepository.findByEmail(data.email);
        if (existingUser) {
            throw new Error("User with this email already exists");
        }
        // Hash password
        const hashedPassword = await bcryptjs_1.default.hash(data.password, 10);
        // Create user
        const user = await UserRepository_1.userRepository.create({
            email: data.email,
            password: hashedPassword,
        });
        // Generate token
        const token = this.generateToken(user.id);
        return {
            user: this.toUserResponse(user),
            token,
        };
    }
    async login(data) {
        // Find user by email
        const user = await UserRepository_1.userRepository.findByEmail(data.email);
        if (!user) {
            throw new Error("Invalid email or password");
        }
        // Verify password
        const isPasswordValid = await bcryptjs_1.default.compare(data.password, user.password);
        if (!isPasswordValid) {
            throw new Error("Invalid email or password");
        }
        // Generate token
        const token = this.generateToken(user.id);
        return {
            user: this.toUserResponse(user),
            token,
        };
    }
    verifyToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            return decoded;
        }
        catch (error) {
            throw new Error("Invalid or expired token");
        }
    }
    generateToken(userId) {
        return jsonwebtoken_1.default.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    }
    toUserResponse(user) {
        return {
            id: user.id,
            email: user.email,
            createdAt: user.createdAt,
        };
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
//# sourceMappingURL=AuthService.js.map