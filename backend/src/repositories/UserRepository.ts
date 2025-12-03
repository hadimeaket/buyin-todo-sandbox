import { getDatabase } from "../db/database";
import { User, RegisterUserDto } from "../models/User";
import * as bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export class UserRepository {
  /**
   * Create a new user with hashed password
   */
  async create(dto: RegisterUserDto): Promise<User> {
    const db = getDatabase();

    // Hash the password
    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const createdAt = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO users (email, passwordHash, createdAt)
      VALUES (?, ?, ?)
    `);

    const result = stmt.run(dto.email, passwordHash, createdAt);

    return {
      id: result.lastInsertRowid as number,
      email: dto.email,
      passwordHash,
      createdAt,
    };
  }

  /**
   * Find user by email
   */
  findByEmail(email: string): User | undefined {
    const db = getDatabase();

    const stmt = db.prepare(`
      SELECT id, email, passwordHash, createdAt
      FROM users
      WHERE email = ?
    `);

    return stmt.get(email) as User | undefined;
  }

  /**
   * Find user by id
   */
  findById(id: number): User | undefined {
    const db = getDatabase();

    const stmt = db.prepare(`
      SELECT id, email, passwordHash, createdAt
      FROM users
      WHERE id = ?
    `);

    return stmt.get(id) as User | undefined;
  }

  /**
   * Verify password against stored hash
   */
  async verifyPassword(
    plainPassword: string,
    passwordHash: string
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, passwordHash);
  }
}
