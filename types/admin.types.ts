/**
 * Service Response Types
 */
export interface ServiceResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode: number;
}

/**
 * Admin Filter Types
 */
export interface AdminFilters {
  role?: "super_admin" | "moderator" | "support_staff";
  is_active?: boolean;
}

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  verified?: boolean;
  is_banned?: boolean;
  is_active?: boolean;
}

export interface ItemFilters {
  type: "lost" | "found" | "share";
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
  search?: string;
  date_from?: Date;
  date_to?: Date;
}

export interface ClaimFilters {
  page?: number;
  limit?: number;
  status?: string;
  verification_status?: string;
}

export interface ReportFilters {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  reported_type?: string;
}

export interface AuditLogFilters {
  page?: number;
  limit?: number;
  admin_id?: string;
  action?: string;
  target_type?: string;
  date_from?: Date;
  date_to?: Date;
}

export interface AuditLogExportFilters {
  date_from?: Date;
  date_to?: Date;
  admin_id?: string;
}

/**
 * Query Types for MongoDB
 */
export type UserQueryFilter = Record<string, unknown>;

export type ItemQueryFilter = Record<string, unknown>;

export type ClaimQueryFilter = Record<string, unknown>;

export type ReportQueryFilter = Record<string, unknown>;

export type AuditLogQueryFilter = Record<string, unknown>;

export type AdminQueryFilter = Record<string, unknown>;

/**
 * Update Types
 */
export interface AdminUpdateData {
  role?: "super_admin" | "moderator" | "support_staff";
  is_active?: boolean;
  permissions?: string[];
}

export interface UserUpdateData {
  name?: string;
  email?: string;
  phone?: string;
  university?: string;
  student_id?: string;
  verified?: boolean;
  role?: string;
}

export interface ReportUpdateData {
  status?: "new" | "under_review" | "resolved" | "dismissed";
  resolution?: string;
  resolved_at?: Date;
}

/**
 * Response Data Types
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  total_pages: number;
}

export interface DashboardStats {
  users: {
    total: number;
    active: number;
    banned: number;
    new_today: number;
  };
  items: {
    total: number;
    pending: number;
    active: number;
    lost_items: number;
    found_items: number;
    share_items: number;
  };
  claims: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  reports: {
    total: number;
    new: number;
    under_review: number;
    resolved: number;
  };
}
