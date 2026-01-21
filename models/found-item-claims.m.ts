import mongoose, { Schema, Document, Types } from "mongoose";

/**
 * Found Item Claim Interface
 * Represents a claim made by a user on a found item
 */
export interface IFoundItemClaim extends Document {
  foundItemId: Types.ObjectId;
  claimerId: Types.ObjectId;
  status: "pending" | "approved" | "rejected";
  message?: string;
  contactInfo?: {
    phone?: string;
    email?: string;
    other?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Found Item Claim Schema
 * Model for claims made on found items
 */
const found_item_claim_schema = new Schema<IFoundItemClaim>(
  {
    foundItemId: {
      type: Schema.Types.ObjectId,
      ref: "FoundItem",
      required: [true, "Found item ID is required"],
      index: true,
    },
    claimerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Claimer ID is required"],
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "approved", "rejected"],
        message: "{VALUE} is not a valid status",
      },
      default: "pending",
      index: true,
    },
    message: {
      type: String,
      trim: true,
    },
    contactInfo: {
      phone: {
        type: String,
        trim: true,
      },
      email: {
        type: String,
        trim: true,
        lowercase: true,
      },
      other: {
        type: String,
        trim: true,
      },
    },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
    collection: "found_item_claims",
  },
);

// Compound indexes for better query performance
found_item_claim_schema.index(
  { foundItemId: 1, claimerId: 1 },
  { unique: true },
);
found_item_claim_schema.index({ foundItemId: 1, status: 1 });
found_item_claim_schema.index({ claimerId: 1, createdAt: -1 });
found_item_claim_schema.index({ createdAt: -1 });

// Virtual for found item
found_item_claim_schema.virtual("foundItem", {
  ref: "FoundItem",
  localField: "foundItemId",
  foreignField: "_id",
  justOne: true,
});

// Virtual for claimer
found_item_claim_schema.virtual("claimer", {
  ref: "User",
  localField: "claimerId",
  foreignField: "_id",
  justOne: true,
});

// Ensure virtuals are included when converting to JSON
found_item_claim_schema.set("toJSON", { virtuals: true });
found_item_claim_schema.set("toObject", { virtuals: true });

// Pre-save middleware to validate claim
found_item_claim_schema.pre("save", async function () {
  if (this.isNew) {
    try {
      // Check if the item is still available
      const FoundItem = mongoose.model("FoundItem");
      const foundItem = await FoundItem.findById(this.foundItemId);

      if (!foundItem) {
        throw new Error("Found item not found");
      }

      if (foundItem.status === "claimed" || foundItem.status === "returned") {
        throw new Error("This item has already been claimed");
      }

      // Check if user is trying to claim their own item
      if (foundItem.user_id.toString() === this.claimerId.toString()) {
        throw new Error("You cannot claim your own item");
      }
    } catch (error) {
      throw error;
    }
  }
});

// Pre-update middleware to handle claim approval
found_item_claim_schema.pre("findOneAndUpdate", async function () {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const update = this.getUpdate() as any;

    // Check if status is being updated to approved
    if (update.$set?.status === "approved" || update.status === "approved") {
      const claim = await this.model.findOne(this.getQuery());

      if (!claim) {
        throw new Error("Claim not found");
      }

      // Verify the found item exists and is available
      const FoundItem = mongoose.model("FoundItem");
      const foundItem = await FoundItem.findById(claim.foundItemId);

      if (!foundItem) {
        throw new Error("Found item not found");
      }

      if (foundItem.status === "claimed" || foundItem.status === "returned") {
        throw new Error("This item has already been claimed");
      }
    }
  } catch (error) {
    throw error;
  }
});

// Post-update middleware to update found item status when claim is approved
found_item_claim_schema.post("findOneAndUpdate", async function (doc) {
  if (doc && doc.status === "approved") {
    try {
      const FoundItem = mongoose.model("FoundItem");

      // Update the found item status to claimed
      await FoundItem.findByIdAndUpdate(doc.foundItemId, {
        status: "claimed",
        updatedAt: new Date(),
      });

      // Reject all other pending claims for this item
      await mongoose.model("FoundItemClaim").updateMany(
        {
          foundItemId: doc.foundItemId,
          _id: { $ne: doc._id },
          status: "pending",
        },
        {
          $set: {
            status: "rejected",
            updatedAt: new Date(),
          },
        },
      );
    } catch (error) {
      console.error("Error updating found item and claims:", error);
      // Don't throw in post middleware as it would be too late
      // Log the error for monitoring
    }
  }
});

// Create or retrieve the model
const FoundItemClaim =
  mongoose.models.FoundItemClaim ||
  mongoose.model<IFoundItemClaim>("FoundItemClaim", found_item_claim_schema);

// Export both named and default for flexibility
export { FoundItemClaim };
export default FoundItemClaim;
