"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const uuid_1 = require("uuid");
const UserRepository_1 = require("../repositories/UserRepository");
const SALT_ROUNDS = 10;
class AuthService {
    async register(data) {
        // Validate email
        if (!data.email || !data.email.includes("@")) {
            throw new Error("Valid email is required");
        }
        // Validate password length
        if (!data.password || data.password.length < 8) {
            throw new Error("Password must be at least 8 characters long");
        }
        // Check if user already exists
        const existingUser = UserRepository_1.userRepository.findByEmail(data.email);
        if (existingUser) {
            throw new Error("User with this email already exists");
        }
        // Hash password
        const passwordHash = await bcrypt_1.default.hash(data.password, SALT_ROUNDS);
        // Create user
        const user = {
            id: (0, uuid_1.v4)(),
            email: data.email,
            passwordHash,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        return UserRepository_1.userRepository.create(user);
    }
    async login(data) {
        // Find user by email
        const user = UserRepository_1.userRepository.findByEmail(data.email);
        if (!user) {
            throw new Error("Invalid email or password");
        }
        // Verify password
        const isPasswordValid = await bcrypt_1.default.compare(data.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new Error("Invalid email or password");
        }
        return user;
    }
    getUserById(id) {
        return UserRepository_1.userRepository.findById(id);
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
//# sourceMappingURL=AuthService.js.map