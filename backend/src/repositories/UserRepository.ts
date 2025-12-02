import { User, CreateUserDto } from "../models/User";
import { v4 as uuidv4 } from "uuid";
import * as fs from "fs";
import * as path from "path";

export interface IUserRepository {
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: CreateUserDto): Promise<User>;
  update(id: string, data: Partial<User>): Promise<User | null>;
  delete(id: string): Promise<boolean>;
}

class FileBasedUserRepository implements IUserRepository {
  private users: User[] = [];
  private dataFilePath: string;

  constructor() {
    this.dataFilePath = path.join(process.cwd(), "data", "users.json");
    this.loadFromFile();
  }

  private loadFromFile(): void {
    try {
      const dataDir = path.dirname(this.dataFilePath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      if (fs.existsSync(this.dataFilePath)) {
        const data = fs.readFileSync(this.dataFilePath, "utf-8");
        const parsed = JSON.parse(data);
        this.users = parsed.map((user: any) => ({
          ...user,
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt),
        }));
        console.log(`Loaded ${this.users.length} users from persistent storage`);
      }
    } catch (error) {
      console.error("Error loading users from file:", error);
      this.users = [];
    }
  }

  private saveToFile(): void {
    try {
      const dataDir = path.dirname(this.dataFilePath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(
        this.dataFilePath,
        JSON.stringify(this.users, null, 2),
        "utf-8"
      );
    } catch (error) {
      console.error("Error saving users to file:", error);
    }
  }

  async findAll(): Promise<User[]> {
    return [...this.users];
  }

  async findById(id: string): Promise<User | null> {
    const user = this.users.find((u) => u.id === id);
    return user || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = this.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    return user || null;
  }

  async create(data: CreateUserDto): Promise<User> {
    const now = new Date();
    const user: User = {
      id: uuidv4(),
      email: data.email.toLowerCase(),
      password: data.password,
      name: data.name,
      authProvider: data.authProvider,
      createdAt: now,
      updatedAt: now,
    };
    this.users.push(user);
    this.saveToFile();
    return user;
  }

  async update(id: string, data: Partial<User>): Promise<User | null> {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) return null;

    const updatedUser: User = {
      ...this.users[index],
      ...data,
      updatedAt: new Date(),
    };
    this.users[index] = updatedUser;
    this.saveToFile();
    return updatedUser;
  }

  async delete(id: string): Promise<boolean> {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) return false;

    this.users.splice(index, 1);
    this.saveToFile();
    return true;
  }
}

export const userRepository = new FileBasedUserRepository();
