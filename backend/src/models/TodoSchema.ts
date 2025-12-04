/**
 * Mongoose Schema for Todo Model
 *
 * Defines the database schema with:
 * - Comprehensive validation rules
 * - Automatic timestamps
 * - Index optimization for queries
 * - Type safety with TypeScript
 */

import mongoose, { Schema, Document } from "mongoose";
import { RecurrenceType, Attachment } from "./Todo";

/**
 * Mongoose Document interface
 */
export interface ITodoDocument extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  categoryId?: mongoose.Types.ObjectId;
  dueDate?: Date;
  dueEndDate?: Date;
  isAllDay?: boolean;
  startTime?: string;
  endTime?: string;
  recurrence?: RecurrenceType;
  attachments?: Attachment[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Todo Schema Definition
 */
const TodoSchema = new Schema<ITodoDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [1, "Title cannot be empty"],
      maxlength: [200, "Title cannot exceed 200 characters"],
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
      default: undefined,
    },
    completed: {
      type: Boolean,
      required: true,
      default: false,
      index: true,
    },
    priority: {
      type: String,
      enum: {
        values: ["low", "medium", "high"],
        message: "Priority must be low, medium, or high",
      },
      required: true,
      default: "medium",
      index: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: undefined,
      index: true,
    },
    dueDate: {
      type: Date,
      default: undefined,
      index: true,
    },
    dueEndDate: {
      type: Date,
      default: undefined,
    },
    isAllDay: {
      type: Boolean,
      default: true,
    },
    startTime: {
      type: String,
      validate: {
        validator: function (value: string) {
          // Validate time format HH:MM
          return !value || /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
        },
        message: "Start time must be in HH:MM format",
      },
      default: undefined,
    },
    endTime: {
      type: String,
      validate: {
        validator: function (value: string) {
          // Validate time format HH:MM
          return !value || /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
        },
        message: "End time must be in HH:MM format",
      },
      default: undefined,
    },
    recurrence: {
      type: String,
      enum: {
        values: [
          "none",
          "daily",
          "weekly",
          "monthly",
          "yearly",
        ] as RecurrenceType[],
        message: "Recurrence must be none, daily, weekly, monthly, or yearly",
      },
      default: "none",
    },
    attachments: [
      {
        id: {
          type: String,
          required: true,
        },
        filename: {
          type: String,
          required: true,
        },
        storedFilename: {
          type: String,
          required: true,
        },
        mimetype: {
          type: String,
          required: true,
          enum: ["image/png", "image/jpeg", "application/pdf"],
        },
        size: {
          type: Number,
          required: true,
          min: 1,
          max: 5 * 1024 * 1024, // 5MB
        },
        uploadedAt: {
          type: Date,
          required: true,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
    collection: "todos",
  }
);

/**
 * Compound Indexes for optimized queries
 */
TodoSchema.index({ completed: 1, priority: 1 });
TodoSchema.index({ dueDate: 1, completed: 1 });
TodoSchema.index({ title: "text", description: "text" }); // Full-text search

/**
 * Virtual field to expose _id as id for consistency with API
 */
TodoSchema.virtual("id").get(function (this: ITodoDocument) {
  return this._id.toHexString();
});

/**
 * Ensure virtuals are included in JSON output
 */
TodoSchema.set("toJSON", {
  virtuals: true,
  transform: function (_doc, ret: any) {
    ret.id = ret._id.toString();
    ret._id = undefined;
    ret.__v = undefined;
    return ret;
  },
});

TodoSchema.set("toObject", {
  virtuals: true,
  transform: function (_doc, ret: any) {
    ret.id = ret._id.toString();
    ret._id = undefined;
    ret.__v = undefined;
    return ret;
  },
});

/**
 * Export Mongoose Model
 */
export const TodoModel = mongoose.model<ITodoDocument>("Todo", TodoSchema);
