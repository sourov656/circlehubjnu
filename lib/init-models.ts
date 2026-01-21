/**
 * Model Initialization Script
 * This file imports all mongoose models to ensure they are registered
 * before any database operations are performed.
 *
 * Usage: Import this file at the top of your API routes or services
 * import '@/lib/init-models';
 */

// Import all models to register them with mongoose
// The order matters - import models without dependencies first

// Core user model - must be first as other models reference it
import { User } from "@/models/users.m";

// Admin-related models - depend on User model
import { AuditLog } from "@/models/audit-logs.m";
import { Report } from "@/models/reports.m";

// Item models - depend on User model
import { LostItem } from "@/models/lost-items.m";
import { FoundItem } from "@/models/found-items.m";
import { ShareItem } from "@/models/share-items.m";

// Claims model - depends on FoundItem and User models
import { FoundItemClaim } from "@/models/found-item-claims.m";

console.log("✅ All mongoose models have been registered");

// Prevent unused variable warnings
export {
  User,
  AuditLog,
  Report,
  LostItem,
  FoundItem,
  ShareItem,
  FoundItemClaim,
};
