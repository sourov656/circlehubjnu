import mongoose, { Schema, Document, Types } from "mongoose";

/**
 * Lost Item Interface
 * Represents an item that has been lost
 */
export interface ILostItem extends Document {
  user_id: Types.ObjectId;
  title: string;
  description: string;
  category: string;
  location: string;
  date_lost: Date;
  image_url?: string;
  status: "pending" | "active" | "found" | "closed" | "rejected";
  tags?: string[];
  reward_amount?: number | null;
  views: number;
  created_at: Date;
  updated_at: Date;
}

/**
 * Lost Item Schema
 * Model for items that users have lost
 */
const lost_item_schema = new Schema<ILostItem>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [255, "Title cannot exceed 255 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      maxlength: [100, "Category cannot exceed 100 characters"],
      index: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
      maxlength: [255, "Location cannot exceed 255 characters"],
    },
    date_lost: {
      type: Date,
      required: [true, "Date lost is required"],
      index: true,
    },
    image_url: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "active", "found", "closed", "rejected"],
        message: "{VALUE} is not a valid status",
      },
      default: "pending",
      index: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    reward_amount: {
      type: Number,
      default: null,
      min: [0, "Reward amount cannot be negative"],
    },
    views: {
      type: Number,
      default: 0,
      min: [0, "Views cannot be negative"],
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    collection: "lost_items",
  },
);

// Indexes for better query performance
lost_item_schema.index({ user_id: 1, created_at: -1 });
lost_item_schema.index({ status: 1, created_at: -1 });
lost_item_schema.index({ category: 1, status: 1 });
lost_item_schema.index({ tags: 1 });
lost_item_schema.index({
  location: "text",
  title: "text",
  description: "text",
});

// Virtual for user
lost_item_schema.virtual("user", {
  ref: "User",
  localField: "user_id",
  foreignField: "_id",
  justOne: true,
});

// Ensure virtuals are included when converting to JSON
lost_item_schema.set("toJSON", { virtuals: true });
lost_item_schema.set("toObject", { virtuals: true });

// Create or retrieve the model
const LostItem =
  mongoose.models.LostItem ||
  mongoose.model<ILostItem>("LostItem", lost_item_schema);

// Export both named and default for flexibility
export { LostItem };
export default LostItem;
