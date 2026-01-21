import mongoose, { Schema, Document, Types } from "mongoose";

/**
 * Share Item Interface
 * Represents an item that users want to share (give away or sell)
 */
export interface IShareItem extends Document {
  user_id: Types.ObjectId;
  title: string;
  description: string;
  category: string;
  condition: "new" | "like-new" | "good" | "fair";
  offer_type: "free" | "sale";
  price?: number;
  location: string;
  image_url?: string;
  tags?: string[];
  status: "pending" | "available" | "reserved" | "shared" | "rejected";
  created_at: Date;
  updated_at: Date;
}

/**
 * Share Item Schema
 * Model for items that users want to share or sell
 */
const share_item_schema = new Schema<IShareItem>(
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
    condition: {
      type: String,
      required: [true, "Condition is required"],
      enum: {
        values: ["new", "like-new", "good", "fair"],
        message: "{VALUE} is not a valid condition",
      },
    },
    offer_type: {
      type: String,
      required: [true, "Offer type is required"],
      enum: {
        values: ["free", "sale"],
        message: "{VALUE} is not a valid offer type",
      },
      index: true,
    },
    price: {
      type: Number,
      min: [0, "Price cannot be negative"],
      validate: {
        validator: function (this: IShareItem, value: number | undefined) {
          // Price is required for sale items
          if (this.offer_type === "sale") {
            return value !== undefined && value > 0;
          }
          // Price should be null/undefined for free items
          if (this.offer_type === "free") {
            return value === undefined || value === null;
          }
          return true;
        },
        message:
          "Price is required and must be greater than 0 for sale items, and should not be set for free items",
      },
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
      maxlength: [255, "Location cannot exceed 255 characters"],
    },
    image_url: {
      type: String,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "available", "reserved", "shared", "rejected"],
        message: "{VALUE} is not a valid status",
      },
      default: "pending",
      index: true,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    collection: "share_items",
  },
);

// Indexes for better query performance
share_item_schema.index({ user_id: 1, created_at: -1 });
share_item_schema.index({ status: 1, created_at: -1 });
share_item_schema.index({ category: 1, status: 1 });
share_item_schema.index({ offer_type: 1, status: 1 });
share_item_schema.index({ condition: 1 });
share_item_schema.index({ tags: 1 });
share_item_schema.index({
  location: "text",
  title: "text",
  description: "text",
});

// Virtual for user
share_item_schema.virtual("user", {
  ref: "User",
  localField: "user_id",
  foreignField: "_id",
  justOne: true,
});

// Ensure virtuals are included when converting to JSON
share_item_schema.set("toJSON", { virtuals: true });
share_item_schema.set("toObject", { virtuals: true });

// Create or retrieve the model
const ShareItem =
  mongoose.models.ShareItem ||
  mongoose.model<IShareItem>("ShareItem", share_item_schema);

// Export both named and default for flexibility
export { ShareItem };
export default ShareItem;
