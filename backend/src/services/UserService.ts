import { userRepository } from "../repositories/UserRepository";
import { User, CreateUserDto, LoginDto } from "../models/User";
import bcrypt from "bcryptjs";

class UserService {
  async createUser(data: CreateUserDto): Promise<User> {
    // Validate email
    if (!data.email || !data.email.includes("@")) {
      throw new Error("Valid email is required");
    }

    // Check if user already exists
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Validate password for local registration
    if (data.provider === "local" || !data.provider) {
      if (!data.password) {
        throw new Error("Password is required");
      }
      if (data.password.length < 8) {
        throw new Error("Password must be at least 8 characters long");
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 10);
      data.password = hashedPassword;
    }

    return await userRepository.create(data);
  }

  async authenticateUser(credentials: LoginDto): Promise<User> {
    const user = await userRepository.findByEmail(credentials.email);

    if (!user) {
      throw new Error("Invalid email or password");
    }

    if (user.provider !== "local") {
      throw new Error(
        `This account uses ${user.provider} sign-in. Please use the ${user.provider} button to log in.`
      );
    }

    if (!user.password) {
      throw new Error("Invalid email or password");
    }

    const isValidPassword = await bcrypt.compare(
      credentials.password,
      user.password
    );

    if (!isValidPassword) {
      throw new Error("Invalid email or password");
    }

    return user;
  }

  async findOrCreateOAuthUser(
    email: string,
    provider: "google" | "apple",
    providerId: string,
    name?: string
  ): Promise<User> {
    // Try to find existing user by provider ID
    let user = await userRepository.findByProvider(provider, providerId);

    if (user) {
      return user;
    }

    // Try to find existing user by email
    user = await userRepository.findByEmail(email);

    if (user) {
      // Email exists but with different provider
      if (user.provider !== provider) {
        throw new Error(
          `An account with this email already exists using ${user.provider} sign-in`
        );
      }
      return user;
    }

    // Create new user
    return await userRepository.create({
      email,
      provider,
      providerId,
      name,
    });
  }

  async getUserById(id: string): Promise<User | null> {
    return await userRepository.findById(id);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return await userRepository.findByEmail(email);
  }
}

export const userService = new UserService();
