import mongoose, { Schema, Document, Types } from "mongoose";

/**
 * Found Item Interface
 * Represents an item that has been found
 */
export interface IFoundItem extends Document {
  user_id: Types.ObjectId;
  title: string;
  description: string;
  category: string;
  location: string;
  date_found: Date;
  image_url?: string;
  status: "pending" | "available" | "claimed" | "returned" | "rejected";
  tags?: string[];
  views: number;
  created_at: Date;
  updated_at: Date;
}

/**
 * Found Item Schema
 * Model for items that users have found
 */
const found_item_schema = new Schema<IFoundItem>(
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
    date_found: {
      type: Date,
      required: [true, "Date found is required"],
      index: true,
    },
    image_url: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "available", "claimed", "returned", "rejected"],
        message: "{VALUE} is not a valid status",
      },
      default: "pending",
      index: true,
    },
    tags: {
      type: [String],
      default: [],
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
    collection: "found_items",
  },
);

// Indexes for better query performance
found_item_schema.index({ user_id: 1, created_at: -1 });
found_item_schema.index({ status: 1, created_at: -1 });
found_item_schema.index({ category: 1, status: 1 });
found_item_schema.index({ tags: 1 });
found_item_schema.index({
  location: "text",
  title: "text",
  description: "text",
});

// Virtual for user
found_item_schema.virtual("user", {
  ref: "User",
  localField: "user_id",
  foreignField: "_id",
  justOne: true,
});

// Virtual for claims
found_item_schema.virtual("claims", {
  ref: "FoundItemClaim",
  localField: "_id",
  foreignField: "found_item_id",
});

// Ensure virtuals are included when converting to JSON
found_item_schema.set("toJSON", { virtuals: true });
found_item_schema.set("toObject", { virtuals: true });

// Create or retrieve the model
const FoundItem =
  mongoose.models.FoundItem ||
  mongoose.model<IFoundItem>("FoundItem", found_item_schema);

// Export both named and default for flexibility
export { FoundItem };
export default FoundItem;
