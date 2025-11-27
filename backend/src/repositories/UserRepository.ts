import { User, RegisterDto } from "../models/User";
import { v4 as uuidv4 } from "uuid";
import db from "../database/Database";
import bcrypt from "bcrypt";

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(data: RegisterDto): Promise<User>;
}

interface UserRow {
  id: string;
  email: string;
  password: string;
  isVerified: number;
  verificationToken: string | null;
  verificationTokenExpiry: string | null;
  createdAt: string;
  updatedAt: string;
}

class UserRepository implements IUserRepository {
  private rowToUser(row: UserRow): User {
    return {
      id: row.id,
      email: row.email,
      password: row.password,
      isVerified: row.isVerified === 1,
      verificationToken: row.verificationToken || undefined,
      verificationTokenExpiry: row.verificationTokenExpiry || undefined,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as
      | UserRow
      | undefined;
    return row ? this.rowToUser(row) : null;
  }

  async findById(id: string): Promise<User | null> {
    const row = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as
      | UserRow
      | undefined;
    return row ? this.rowToUser(row) : null;
  }

  async create(data: RegisterDto): Promise<User> {
    const now = new Date();
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const verificationToken = uuidv4();
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user: User = {
      id: uuidv4(),
      email: data.email,
      password: hashedPassword,
      isVerified: false,
      verificationToken,
      verificationTokenExpiry: verificationTokenExpiry.toISOString(),
      createdAt: now,
      updatedAt: now,
    };

    db.prepare(
      `INSERT INTO users (id, email, password, isVerified, verificationToken, verificationTokenExpiry, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      user.id,
      user.email,
      user.password,
      user.isVerified ? 1 : 0,
      user.verificationToken,
      user.verificationTokenExpiry,
      user.createdAt.toISOString(),
      user.updatedAt.toISOString()
    );

    return user;
  }

  async verifyEmail(token: string): Promise<User | null> {
    const row = db
      .prepare("SELECT * FROM users WHERE verificationToken = ?")
      .get(token) as UserRow | undefined;

    if (!row) return null;

    const user = this.rowToUser(row);

    // Check if token is expired
    if (user.verificationTokenExpiry) {
      const expiry = new Date(user.verificationTokenExpiry);
      if (expiry < new Date()) {
        return null;
      }
    }

    // Mark user as verified
    db.prepare(
      `UPDATE users SET isVerified = 1, verificationToken = NULL, verificationTokenExpiry = NULL, updatedAt = ? WHERE id = ?`
    ).run(new Date().toISOString(), user.id);

    return { ...user, isVerified: true };
  }
}

export const userRepository = new UserRepository();
