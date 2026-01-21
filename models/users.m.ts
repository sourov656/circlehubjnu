import mongoose, { Schema, Document } from "mongoose";

/**
 * User Interface
 * Represents a user in the system with authentication and profile data
 */
export interface IUser extends Document {
  email: string;
  password: string; // hashed password
  name: string;
  phone?: string;
  avatar_url?: string;
  university?: string;
  student_id?: string;
  role: "admin" | "student";
  verified: boolean;
  is_active: boolean;
  is_banned: boolean;
  ban_reason?: string;
  ban_date?: Date;
  last_active?: Date;
  created_at: Date;
  updated_at: Date;
}

/**
 * User Schema
 * Main user model for authentication and profile management
 */
const user_schema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
      select: false, // Don't include password by default in queries
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [255, "Name cannot exceed 255 characters"],
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [20, "Phone number cannot exceed 20 characters"],
    },
    avatar_url: {
      type: String,
      trim: true,
    },
    university: {
      type: String,
      trim: true,
      maxlength: [255, "University name cannot exceed 255 characters"],
    },
    student_id: {
      type: String,
      trim: true,
      maxlength: [100, "Student ID cannot exceed 100 characters"],
    },
    role: {
      type: String,
      enum: {
        values: ["student", "admin", "moderator", "support_staff"],
        message: "{VALUE} is not a valid role",
      },
      default: "student",
      index: true,
    },
    verified: {
      type: Boolean,
      default: false,
      index: true,
    },
    is_active: {
      type: Boolean,
      default: true,
      index: true,
    },
    is_banned: {
      type: Boolean,
      default: false,
      index: true,
    },
    ban_reason: {
      type: String,
      trim: true,
      maxlength: [500, "Ban reason cannot exceed 500 characters"],
    },
    ban_date: {
      type: Date,
      index: true,
    },
    last_active: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    collection: "users",
  },
);

// Indexes for better query performance
// Note: email already has unique index from schema definition
user_schema.index({ role: 1, verified: 1 });
user_schema.index({ is_active: 1, is_banned: 1 });
user_schema.index({ last_active: -1 });

// Virtual for user's items
user_schema.virtual("lost_items", {
  ref: "LostItem",
  localField: "_id",
  foreignField: "user_id",
});

user_schema.virtual("found_items", {
  ref: "FoundItem",
  localField: "_id",
  foreignField: "user_id",
});

user_schema.virtual("share_items", {
  ref: "ShareItem",
  localField: "_id",
  foreignField: "user_id",
});

// Ensure virtuals are included when converting to JSON
user_schema.set("toJSON", { virtuals: true });
user_schema.set("toObject", { virtuals: true });

// Create or retrieve the model
const User = mongoose.models.User || mongoose.model<IUser>("User", user_schema);

// Export both named and default for flexibility
export { User };
export default User;
