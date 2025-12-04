/**
 * User Repository
 *
 * Handles database operations for User entity
 */

import { User, RegisterDto, SSODto } from "../models/User";
import { UserModel, IUserDocument } from "../models/UserSchema";
import mongoose from "mongoose";

export interface IUserRepository {
  findByEmail(email: string): Promise<IUserDocument | null>;
  findById(id: string): Promise<User | null>;
  create(data: RegisterDto | SSODto): Promise<IUserDocument>;
  exists(email: string): Promise<boolean>;
}

export class UserRepository implements IUserRepository {
  /**
   * Converts Mongoose document to plain User object
   */
  private toUser(doc: any): User {
    return {
      id: doc._id.toString(),
      email: doc.email,
      name: doc.name,
      authProvider: doc.authProvider,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<IUserDocument | null> {
    try {
      const user = await UserModel.findOne({
        email: email.toLowerCase().trim(),
      }).exec();
      return user;
    } catch (error) {
      console.error("Error in findByEmail:", error);
      throw new Error("Failed to find user");
    }
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return null;
      }

      const doc = await UserModel.findById(id).exec();
      return doc ? this.toUser(doc) : null;
    } catch (error) {
      console.error(`Error in findById for id ${id}:`, error);
      throw new Error("Failed to find user");
    }
  }

  /**
   * Create new user
   */
  async create(data: RegisterDto | SSODto): Promise<IUserDocument> {
    try {
      let userData: any;

      if ("password" in data) {
        // Email registration
        userData = {
          email: data.email.toLowerCase().trim(),
          password: data.password,
          name: data.name?.trim(),
          authProvider: "email",
        };
      } else {
        // SSO registration
        userData = {
          email: data.email.toLowerCase().trim(),
          name: data.name?.trim(),
          authProvider: data.provider,
        };
      }

      const users = await UserModel.create([userData]);
      return users[0];
    } catch (error: any) {
      console.error("Error in create:", error);

      if (error.code === 11000) {
        throw new Error("User with this email already exists");
      }

      if (error.name === "ValidationError") {
        const messages = Object.values(error.errors)
          .map((err: any) => err.message)
          .join(", ");
        throw new Error(`Validation error: ${messages}`);
      }

      throw new Error("Failed to create user");
    }
  }

  /**
   * Check if user exists by email
   */
  async exists(email: string): Promise<boolean> {
    try {
      const count = await UserModel.countDocuments({
        email: email.toLowerCase().trim(),
      }).exec();
      return count > 0;
    } catch (error) {
      console.error("Error in exists:", error);
      throw new Error("Failed to check user existence");
    }
  }
}

export const userRepository = new UserRepository();
