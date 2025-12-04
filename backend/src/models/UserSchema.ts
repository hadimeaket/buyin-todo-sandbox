/**
 * Mongoose Schema for User Model
 *
 * Defines the database schema with:
 * - Email uniqueness validation
 * - Password hashing
 * - Auth provider tracking
 * - Automatic timestamps
 */

import mongoose, { Schema, Document } from "mongoose";
import { AuthProvider } from "./User";

/**
 * Mongoose Document interface for User
 */
export interface IUserDocument extends Document {
  email: string;
  password?: string; // Optional for SSO users
  name?: string;
  authProvider: AuthProvider;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User Schema Definition
 */
const UserSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
      index: true,
    },
    password: {
      type: String,
      // Required only for email auth, not for SSO
      validate: {
        validator: function (this: IUserDocument, value: string | undefined) {
          // Password required only for email provider
          if (this.authProvider === "email") {
            return value !== undefined && value.length >= 8;
          }
          return true;
        },
        message: "Password must be at least 8 characters long",
      },
    },
    name: {
      type: String,
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    authProvider: {
      type: String,
      enum: {
        values: ["email", "google", "apple"] as AuthProvider[],
        message: "Auth provider must be email, google, or apple",
      },
      required: true,
      default: "email",
    },
  },
  {
    timestamps: true,
    collection: "users",
  }
);

/**
 * Indexes for query optimization
 */
UserSchema.index({ email: 1, authProvider: 1 });

/**
 * Transform output to match User interface
 */
UserSchema.set("toJSON", {
  transform: function (_doc, ret: any) {
    ret.id = ret._id.toString();
    ret._id = undefined;
    ret.__v = undefined;
    ret.password = undefined; // Never expose password
    return ret;
  },
});

UserSchema.set("toObject", {
  transform: function (_doc, ret: any) {
    ret.id = ret._id.toString();
    ret._id = undefined;
    ret.__v = undefined;
    ret.password = undefined;
    return ret;
  },
});

/**
 * Export Mongoose Model
 */
export const UserModel = mongoose.model<IUserDocument>("User", UserSchema);
