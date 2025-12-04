import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { User, RegisterDto, LoginDto } from "../models/User";
import { userRepository } from "../repositories/UserRepository";

const SALT_ROUNDS = 10;

export class AuthService {
  async register(data: RegisterDto): Promise<User> {
    // Validate email
    if (!data.email || !data.email.includes("@")) {
      throw new Error("Valid email is required");
    }

    // Validate password length
    if (!data.password || data.password.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }

    // Check if user already exists
    const existingUser = userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

    // Create user
    const user: User = {
      id: uuidv4(),
      email: data.email,
      passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return userRepository.create(user);
  }

  async login(data: LoginDto): Promise<User> {
    // Find user by email
    const user = userRepository.findByEmail(data.email);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    return user;
  }

  getUserById(id: string): User | null {
    return userRepository.findById(id);
  }
}

export const authService = new AuthService();
