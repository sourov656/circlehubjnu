import mongoose, { Schema, Document } from "mongoose";

/**
 * Audit Log Interface
 * Records all admin actions for security and compliance
 */
export interface IAuditLog extends Document {
  admin_id: mongoose.Types.ObjectId;
  action: string;
  target_type: "user" | "item" | "claim" | "report" | "setting" | "admin";
  target_id?: mongoose.Types.ObjectId;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  timestamp: Date;
}

/**
 * Audit Log Schema
 * Maintains comprehensive audit trail of all admin activities
 */
const audit_log_schema = new Schema<IAuditLog>(
  {
    admin_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Admin ID is required"],
      index: true,
    },
    action: {
      type: String,
      required: [true, "Action is required"],
      trim: true,
      maxlength: [255, "Action cannot exceed 255 characters"],
      index: true,
    },
    target_type: {
      type: String,
      enum: {
        values: ["user", "item", "claim", "report", "setting", "admin"],
        message: "{VALUE} is not a valid target type",
      },
      required: [true, "Target type is required"],
      index: true,
    },
    target_id: {
      type: Schema.Types.ObjectId,
      index: true,
    },
    details: {
      type: Schema.Types.Mixed,
      default: {},
    },
    ip_address: {
      type: String,
      trim: true,
    },
    user_agent: {
      type: String,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    collection: "audit_logs",
  },
);

// Compound indexes for common queries
audit_log_schema.index({ admin_id: 1, timestamp: -1 });
audit_log_schema.index({ target_type: 1, target_id: 1 });
audit_log_schema.index({ action: 1, timestamp: -1 });

// Static method to create audit log
audit_log_schema.statics.logAction = async function (
  admin_id: mongoose.Types.ObjectId,
  action: string,
  target_type: string,
  target_id: mongoose.Types.ObjectId | null | undefined,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details: Record<string, any>,
  ip_address?: string,
  user_agent?: string,
) {
  const log_data: Record<string, unknown> = {
    admin_id,
    action,
    target_type,
    details,
    ip_address,
    user_agent,
    timestamp: new Date(),
  };

  if (target_id) {
    log_data.target_id = target_id;
  }

  return this.create(log_data);
};

// Export model
export const AuditLog =
  mongoose.models.AuditLog ||
  mongoose.model<IAuditLog>("AuditLog", audit_log_schema);
