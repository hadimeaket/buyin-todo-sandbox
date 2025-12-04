/**
 * Mongoose Schema for Category Model
 *
 * Defines the database schema with:
 * - Name and color validation
 * - HEX color format validation
 * - User ownership
 * - Unique constraint per user
 */

import mongoose, { Schema, Document } from "mongoose";

export interface ICategoryDocument extends Document {
  name: string;
  color: string;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Category Schema Definition
 */
const CategorySchema = new Schema<ICategoryDocument>(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      minlength: [1, "Category name must be at least 1 character"],
      maxlength: [50, "Category name must not exceed 50 characters"],
    },
    color: {
      type: String,
      required: [true, "Color is required"],
      validate: {
        validator: function (value: string) {
          // HEX color format: #RRGGBB
          return /^#[0-9A-Fa-f]{6}$/.test(value);
        },
        message: "Color must be in HEX format (#RRGGBB, e.g., #FF5733)",
      },
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (_doc, ret: any) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: function (_doc, ret: any) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound unique index: user can't have duplicate category names
CategorySchema.index({ userId: 1, name: 1 }, { unique: true });

export const CategoryModel = mongoose.model<ICategoryDocument>(
  "Category",
  CategorySchema
);
