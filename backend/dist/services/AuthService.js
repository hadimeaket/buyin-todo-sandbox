"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const UserRepository_1 = require("../repositories/UserRepository");
const bcrypt_1 = __importDefault(require("bcrypt"));
const SALT_ROUNDS = 10;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
class AuthService {
    async register(data) {
        // Validate email
        if (!data.email || !EMAIL_REGEX.test(data.email)) {
            throw new Error("Invalid email address");
        }
        // Validate password
        if (!data.password || data.password.length < 8) {
            throw new Error("Password must be at least 8 characters long");
        }
        // Check if user already exists
        const existingUser = await UserRepository_1.userRepository.findByEmail(data.email);
        if (existingUser) {
            throw new Error("User with this email already exists");
        }
        // Hash password
        const hashedPassword = await bcrypt_1.default.hash(data.password, SALT_ROUNDS);
        // Create user
        const user = await UserRepository_1.userRepository.create({
            email: data.email,
            password: hashedPassword,
        });
        return UserRepository_1.userRepository.toUserResponse(user);
    }
    async login(data) {
        // Validate input
        if (!data.email || !data.password) {
            throw new Error("Email and password are required");
        }
        // Find user by email
        const user = await UserRepository_1.userRepository.findByEmail(data.email);
        if (!user) {
            throw new Error("Invalid email or password");
        }
        // Verify password
        const isPasswordValid = await bcrypt_1.default.compare(data.password, user.password);
        if (!isPasswordValid) {
            throw new Error("Invalid email or password");
        }
        return UserRepository_1.userRepository.toUserResponse(user);
    }
    async getUserById(id) {
        const user = await UserRepository_1.userRepository.findById(id);
        if (!user) {
            return null;
        }
        return UserRepository_1.userRepository.toUserResponse(user);
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
//# sourceMappingURL=AuthService.js.map