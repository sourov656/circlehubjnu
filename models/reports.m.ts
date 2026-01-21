import mongoose, { Schema, Document } from "mongoose";

/**
 * Report Interface
 * Represents a user report or flagged content
 */
export interface IReport extends Document {
  reporter_id: mongoose.Types.ObjectId;
  reported_type: "item" | "user" | "claim";
  reported_id: mongoose.Types.ObjectId;
  reason: string;
  description: string;
  status: "new" | "under_review" | "resolved" | "dismissed";
  priority: "low" | "medium" | "high" | "critical";
  assigned_to?: mongoose.Types.ObjectId; // Admin ID
  resolution?: string;
  resolved_at?: Date;
  created_at: Date;
  updated_at: Date;
}

/**
 * Report Schema
 * Manages user-generated reports and content flagging
 */
const report_schema = new Schema<IReport>(
  {
    reporter_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Reporter ID is required"],
      index: true,
    },
    reported_type: {
      type: String,
      enum: {
        values: ["item", "user", "claim"],
        message: "{VALUE} is not a valid report type",
      },
      required: [true, "Reported type is required"],
      index: true,
    },
    reported_id: {
      type: Schema.Types.ObjectId,
      required: [true, "Reported ID is required"],
      index: true,
    },
    reason: {
      type: String,
      required: [true, "Reason is required"],
      enum: {
        values: [
          "inappropriate_content",
          "spam",
          "fraudulent_claim",
          "user_misconduct",
          "scam_attempt",
          "fake_listing",
          "harassment",
          "duplicate",
          "other",
        ],
        message: "{VALUE} is not a valid reason",
      },
      index: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    status: {
      type: String,
      enum: {
        values: ["new", "under_review", "resolved", "dismissed"],
        message: "{VALUE} is not a valid status",
      },
      default: "new",
      index: true,
    },
    priority: {
      type: String,
      enum: {
        values: ["low", "medium", "high", "critical"],
        message: "{VALUE} is not a valid priority level",
      },
      default: "medium",
      index: true,
    },
    assigned_to: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      index: true,
    },
    resolution: {
      type: String,
      trim: true,
      maxlength: [1000, "Resolution cannot exceed 1000 characters"],
    },
    resolved_at: {
      type: Date,
      index: true,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    collection: "reports",
  }
);

// Compound indexes for common queries
report_schema.index({ status: 1, priority: -1, created_at: -1 });
report_schema.index({ reported_type: 1, reported_id: 1 });
report_schema.index({ assigned_to: 1, status: 1 });

// Pre-save hook to set resolved_at when status changes to resolved
report_schema.pre("save", function () {
  if (
    this.isModified("status") &&
    this.status === "resolved" &&
    !this.resolved_at
  ) {
    this.resolved_at = new Date();
  }
});

// Static method to get reports count by status
report_schema.statics.getCountByStatus = async function () {
  return this.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);
};

// Static method to get reports count by priority
report_schema.statics.getCountByPriority = async function () {
  return this.aggregate([
    {
      $group: {
        _id: "$priority",
        count: { $sum: 1 },
      },
    },
  ]);
};

// Export model
export const Report =
  mongoose.models.Report || mongoose.model<IReport>("Report", report_schema);
