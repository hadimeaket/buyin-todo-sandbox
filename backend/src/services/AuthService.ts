import { UserRepository } from "../repositories/UserRepository";
import { RegisterUserDto, LoginUserDto, User } from "../models/User";

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Register a new user
   */
  async register(dto: RegisterUserDto): Promise<{ user: User }> {
    // Validate password length
    if (dto.password.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }

    // Check if user already exists
    const existingUser = this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new Error("Email already registered");
    }

    // Create user
    const user = await this.userRepository.create(dto);

    // Return user without password hash
    return { user };
  }

  /**
   * Login user
   */
  async login(dto: LoginUserDto): Promise<{ user: User }> {
    // Find user by email
    const user = this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Verify password
    const isValidPassword = await this.userRepository.verifyPassword(
      dto.password,
      user.passwordHash
    );
    if (!isValidPassword) {
      throw new Error("Invalid email or password");
    }

    return { user };
  }

  /**
   * Get user by ID
   */
  getUserById(id: number): User | undefined {
    return this.userRepository.findById(id);
  }
}
