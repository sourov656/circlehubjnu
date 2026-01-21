"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import useAxios from "@/hooks/use-axios";
import { useAuth } from "@/contexts/auth-context";

// Types
interface OverviewStats {
  total_users: number;
  total_items: number;
  active_claims: number;
  today_activity: {
    new_users: number;
    items_posted: number;
    claims_made: number;
  };
  user_growth: number;
  items_trend: number;
  recent_activity?: {
    items?: any[];
    users?: any[];
    claims?: any[];
  };
}

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  student_id?: string;
  role: string;
  verified: boolean;
  is_active: boolean;
  is_banned: boolean;
  created_at: string;
  last_active?: string;
}

interface Item {
  _id: string;
  title: string;
  category: string;
  description: string;
  image_url?: string | null;
  images?: string[];
  status: string;
  user_id?: {
    _id: string;
    name: string;
    email: string;
  };
  profile?: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    avatar_url: string | null;
  } | null;
  created_at: string;
  location?: string;
  condition?: string;
  offer_type?: string;
  price?: number | null;
  tags?: string[];
}

interface Claim {
  _id: string;
  foundItemId: Item;
  claimerId: User;
  status: string;
  verification_answers: any;
  message?: string;
  contactInfo?: {
    phone?: string;
    email?: string;
    other?: string;
  };
  createdAt: string;
  updatedAt?: string;
  reject_reason?: string;
}

interface Report {
  _id: string;
  reporter_id: User;
  reported_type: string;
  reported_id: string;
  reason: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
}

interface AuditLog {
  _id: string;
  admin_id: {
    _id: string;
    name: string;
    email: string;
    role?: string;
  };
  action: string;
  target_type: string;
  target_id: string;
  details: any;
  ip_address: string;
  timestamp: string;
}

interface AdminContextType {
  // Stats
  overview_stats: OverviewStats | null;

  // Data
  users: User[];
  lost_items: Item[];
  found_items: Item[];
  share_items: Item[];
  claims: Claim[];
  reports: Report[];
  audit_logs: AuditLog[];

  // Loading states
  loading: {
    overview: boolean;
    users: boolean;
    items: boolean;
    claims: boolean;
    reports: boolean;
    logs: boolean;
  };

  // Fetch functions
  fetch_overview: () => Promise<void>;
  fetch_users: (filters?: any) => Promise<void>;
  fetch_lost_items: (filters?: any) => Promise<void>;
  fetch_found_items: (filters?: any) => Promise<void>;
  fetch_share_items: (filters?: any) => Promise<void>;
  fetch_claims: (filters?: any) => Promise<void>;
  fetch_reports: (filters?: any) => Promise<void>;
  fetch_audit_logs: (filters?: any) => Promise<void>;

  // Action functions
  update_user: (user_id: string, updates: any) => Promise<void>;
  update_user_role: (user_id: string, new_role: string) => Promise<void>;
  verify_user: (user_id: string) => Promise<void>;
  unverify_user: (user_id: string) => Promise<void>;
  activate_user: (user_id: string) => Promise<void>;
  deactivate_user: (user_id: string) => Promise<void>;
  ban_user: (user_id: string, reason: string) => Promise<void>;
  unban_user: (user_id: string) => Promise<void>;
  approve_item: (item_id: string, type: string) => Promise<void>;
  reject_item: (item_id: string, type: string, reason: string) => Promise<void>;
  delete_item: (item_id: string, type: string) => Promise<void>;
  approve_claim: (claim_id: string) => Promise<void>;
  reject_claim: (claim_id: string, reason: string) => Promise<void>;
  resolve_report: (report_id: string, resolution: string) => Promise<void>;

  // Refresh function
  refresh_all: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within AdminProvider");
  }
  return context;
};

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const axios = useAxios();
  const { logout } = useAuth();

  // State
  const [overview_stats, set_overview_stats] = useState<OverviewStats | null>(
    null,
  );
  const [users, set_users] = useState<User[]>([]);
  const [lost_items, set_lost_items] = useState<Item[]>([]);
  const [found_items, set_found_items] = useState<Item[]>([]);
  const [share_items, set_share_items] = useState<Item[]>([]);
  const [claims, set_claims] = useState<Claim[]>([]);
  const [reports, set_reports] = useState<Report[]>([]);
  const [audit_logs, set_audit_logs] = useState<AuditLog[]>([]);

  const [loading, set_loading] = useState({
    overview: false,
    users: false,
    items: false,
    claims: false,
    reports: false,
    logs: false,
  });

  // Error handler for API calls
  const handle_error = useCallback(
    (error: any, context: string) => {
      console.error(`Error in ${context}:`, error);

      // If 401, logout user
      if (error.response?.status === 401) {
        console.warn("Unauthorized access, logging out...");
        logout();
      }
    },
    [logout],
  );

  // Fetch functions
  const fetch_overview = useCallback(async () => {
    set_loading((prev) => ({ ...prev, overview: true }));
    try {
      const response = await axios.get("/api/admin/dashboard");
      set_overview_stats(response.data.data);
    } catch (error) {
      handle_error(error, "fetch_overview");
    } finally {
      set_loading((prev) => ({ ...prev, overview: false }));
    }
  }, [axios, handle_error]);

  const fetch_users = useCallback(
    async (filters?: any) => {
      set_loading((prev) => ({ ...prev, users: true }));
      try {
        const params = new URLSearchParams(filters).toString();
        const response = await axios.get(`/api/admin/users/list?${params}`);
        set_users(response.data.data);
      } catch (error) {
        handle_error(error, "fetch_users");
      } finally {
        set_loading((prev) => ({ ...prev, users: false }));
      }
    },
    [axios, handle_error],
  );

  const fetch_lost_items = useCallback(
    async (filters?: any) => {
      set_loading((prev) => ({ ...prev, items: true }));
      try {
        const params = new URLSearchParams(filters).toString();
        const response = await axios.get(`/api/admin/items/lost?${params}`);
        set_lost_items(response.data.data);
      } catch (error) {
        handle_error(error, "fetch_lost_items");
      } finally {
        set_loading((prev) => ({ ...prev, items: false }));
      }
    },
    [axios, handle_error],
  );

  const fetch_found_items = useCallback(
    async (filters?: any) => {
      set_loading((prev) => ({ ...prev, items: true }));
      try {
        const params = new URLSearchParams(filters).toString();
        const response = await axios.get(`/api/admin/items/found?${params}`);
        set_found_items(response.data.data);
      } catch (error) {
        handle_error(error, "fetch_found_items");
      } finally {
        set_loading((prev) => ({ ...prev, items: false }));
      }
    },
    [axios, handle_error],
  );

  const fetch_share_items = useCallback(
    async (filters?: any) => {
      set_loading((prev) => ({ ...prev, items: true }));
      try {
        const params = new URLSearchParams(filters).toString();
        const response = await axios.get(`/api/admin/items/share?${params}`);
        set_share_items(response.data.data);
      } catch (error) {
        handle_error(error, "fetch_share_items");
      } finally {
        set_loading((prev) => ({ ...prev, items: false }));
      }
    },
    [axios, handle_error],
  );

  const fetch_claims = useCallback(
    async (filters?: any) => {
      set_loading((prev) => ({ ...prev, claims: true }));
      try {
        const params = new URLSearchParams(filters).toString();
        const response = await axios.get(`/api/admin/claims/list?${params}`);
        set_claims(response.data.data);
      } catch (error) {
        handle_error(error, "fetch_claims");
      } finally {
        set_loading((prev) => ({ ...prev, claims: false }));
      }
    },
    [axios, handle_error],
  );

  const fetch_reports = useCallback(
    async (filters?: any) => {
      set_loading((prev) => ({ ...prev, reports: true }));
      try {
        const params = new URLSearchParams(filters).toString();
        const response = await axios.get(`/api/admin/reports/list?${params}`);
        set_reports(response.data.data);
      } catch (error) {
        handle_error(error, "fetch_reports");
      } finally {
        set_loading((prev) => ({ ...prev, reports: false }));
      }
    },
    [axios, handle_error],
  );

  const fetch_audit_logs = useCallback(
    async (filters?: any) => {
      set_loading((prev) => ({ ...prev, logs: true }));
      try {
        const params = new URLSearchParams(filters).toString();
        const response = await axios.get(`/api/admin/logs/list?${params}`);
        set_audit_logs(response.data.data);
      } catch (error) {
        handle_error(error, "fetch_audit_logs");
      } finally {
        set_loading((prev) => ({ ...prev, logs: false }));
      }
    },
    [axios, handle_error],
  );

  // Action functions
  const update_user = useCallback(
    async (user_id: string, updates: any) => {
      await axios.patch(`/api/admin/users/${user_id}`, updates);
      await fetch_users();
    },
    [axios, fetch_users],
  );

  const update_user_role = useCallback(
    async (user_id: string, new_role: string) => {
      await axios.patch(`/api/admin/users/${user_id}/role`, { role: new_role });
      await fetch_users();
    },
    [axios, fetch_users],
  );

  const verify_user = useCallback(
    async (user_id: string) => {
      await axios.patch(`/api/admin/users/${user_id}/verify`, {
        verified: true,
      });
      await fetch_users();
    },
    [axios, fetch_users],
  );

  const unverify_user = useCallback(
    async (user_id: string) => {
      await axios.patch(`/api/admin/users/${user_id}/verify`, {
        verified: false,
      });
      await fetch_users();
    },
    [axios, fetch_users],
  );

  const activate_user = useCallback(
    async (user_id: string) => {
      await axios.patch(`/api/admin/users/${user_id}/activate`, {
        is_active: true,
      });
      await fetch_users();
    },
    [axios, fetch_users],
  );

  const deactivate_user = useCallback(
    async (user_id: string) => {
      await axios.patch(`/api/admin/users/${user_id}/activate`, {
        is_active: false,
      });
      await fetch_users();
    },
    [axios, fetch_users],
  );

  const ban_user = useCallback(
    async (user_id: string, reason: string) => {
      await axios.post(`/api/admin/users/${user_id}/ban`, { reason });
      await fetch_users();
    },
    [axios, fetch_users],
  );

  const unban_user = useCallback(
    async (user_id: string) => {
      await axios.post(`/api/admin/users/${user_id}/unban`);
      await fetch_users();
    },
    [axios, fetch_users],
  );

  const approve_item = useCallback(
    async (item_id: string, type: string) => {
      await axios.post(`/api/admin/items/${item_id}/approve`, { type });
      if (type === "lost") await fetch_lost_items();
      if (type === "found") await fetch_found_items();
      if (type === "share") await fetch_share_items();
    },
    [axios, fetch_lost_items, fetch_found_items, fetch_share_items],
  );

  const reject_item = useCallback(
    async (item_id: string, type: string, reason: string) => {
      await axios.post(`/api/admin/items/${item_id}/reject`, { type, reason });
      if (type === "lost") await fetch_lost_items();
      if (type === "found") await fetch_found_items();
      if (type === "share") await fetch_share_items();
    },
    [axios, fetch_lost_items, fetch_found_items, fetch_share_items],
  );

  const delete_item = useCallback(
    async (item_id: string, type: string) => {
      await axios.delete(`/api/admin/items/${item_id}?type=${type}`);
      if (type === "lost") await fetch_lost_items();
      if (type === "found") await fetch_found_items();
      if (type === "share") await fetch_share_items();
    },
    [axios, fetch_lost_items, fetch_found_items, fetch_share_items],
  );

  const approve_claim = useCallback(
    async (claim_id: string) => {
      await axios.post(`/api/admin/claims/${claim_id}/approve`);
      await fetch_claims();
    },
    [axios, fetch_claims],
  );

  const reject_claim = useCallback(
    async (claim_id: string, reason: string) => {
      await axios.post(`/api/admin/claims/${claim_id}/reject`, { reason });
      await fetch_claims();
    },
    [axios, fetch_claims],
  );

  const resolve_report = useCallback(
    async (report_id: string, resolution: string) => {
      await axios.patch(`/api/admin/reports/${report_id}/resolve`, {
        resolution,
      });
      await fetch_reports();
    },
    [axios, fetch_reports],
  );

  const refresh_all = useCallback(async () => {
    await Promise.all([
      fetch_overview(),
      fetch_users(),
      fetch_lost_items(),
      fetch_found_items(),
      fetch_share_items(),
      fetch_claims(),
      fetch_reports(),
      fetch_audit_logs(),
    ]);
  }, [
    fetch_overview,
    fetch_users,
    fetch_lost_items,
    fetch_found_items,
    fetch_share_items,
    fetch_claims,
    fetch_reports,
    fetch_audit_logs,
  ]);

  const value: AdminContextType = {
    overview_stats,
    users,
    lost_items,
    found_items,
    share_items,
    claims,
    reports,
    audit_logs,
    loading,
    fetch_overview,
    fetch_users,
    fetch_lost_items,
    fetch_found_items,
    fetch_share_items,
    fetch_claims,
    fetch_reports,
    fetch_audit_logs,
    update_user,
    update_user_role,
    verify_user,
    unverify_user,
    activate_user,
    deactivate_user,
    ban_user,
    unban_user,
    approve_item,
    reject_item,
    delete_item,
    approve_claim,
    reject_claim,
    resolve_report,
    refresh_all,
  };

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
};
