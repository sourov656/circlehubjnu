"use client";

import { useAdmin } from "@/contexts/admin-context";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function UsersPage() {
  const {
    users,
    loading,
    fetch_users,
    ban_user,
    unban_user,
    update_user_role,
    verify_user,
    unverify_user,
    activate_user,
    deactivate_user,
  } = useAdmin();

  const [search, set_search] = useState("");
  const [status_filter, set_status_filter] = useState("all");
  const [role_filter, set_role_filter] = useState("all");
  const [selected_user, set_selected_user] = useState<any>(null);
  const [action_modal, set_action_modal] = useState<
    "ban" | "unban" | "edit" | "role" | null
  >(null);
  const [ban_reason, set_ban_reason] = useState("");
  const [new_role, set_new_role] = useState("");
  const [confirm_dialog, set_confirm_dialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void | Promise<void>;
    variant?: "default" | "danger" | "warning" | "success";
  }>({ open: false, title: "", description: "", onConfirm: () => {} });

  useEffect(() => {
    fetch_users({
      search,
      status: status_filter === "all" ? "" : status_filter,
      role: role_filter === "all" ? "" : role_filter,
    });
  }, [fetch_users, search, status_filter, role_filter]);

  const handle_ban = async () => {
    if (selected_user && ban_reason) {
      await ban_user(selected_user._id, ban_reason);
      set_action_modal(null);
      set_ban_reason("");
      set_selected_user(null);
    }
  };

  const handle_unban = async () => {
    if (selected_user) {
      await unban_user(selected_user._id);
      set_action_modal(null);
      set_selected_user(null);
    }
  };

  const handle_role_change = async () => {
    if (selected_user && new_role) {
      try {
        await update_user_role(selected_user._id, new_role);
        set_action_modal(null);
        set_new_role("");
        set_selected_user(null);
      } catch (error) {
        console.error("Failed to update user role:", error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">User Management</h1>
        <button
          onClick={() => fetch_users({ search, status: status_filter })}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={search}
              onChange={(e) => set_search(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <Select value={status_filter} onValueChange={set_status_filter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select value={role_filter} onValueChange={set_role_filter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="support_staff">Support Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Total: <strong>{users.length}</strong> users
            </span>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-card rounded-lg shadow overflow-hidden">
        {loading.users ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-muted">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-foreground">
                            {user.name}
                          </div>
                          {user.student_id && (
                            <div className="text-xs text-gray-500">
                              ID: {user.student_id}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-foreground">
                        {user.email}
                      </div>
                      {user.phone && (
                        <div className="text-xs text-gray-500">
                          {user.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          user.role === "admin"
                            ? "bg-red-100 text-red-700"
                            : user.role === "moderator"
                            ? "bg-purple-100 text-purple-700"
                            : user.role === "support_staff"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        {/* Active/Inactive Status */}
                        <span
                          className={`px-2 py-1 text-xs rounded inline-block w-fit ${
                            !user.is_active
                              ? "bg-gray-100 text-gray-700"
                              : user.is_banned
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {!user.is_active
                            ? "Inactive"
                            : user.is_banned
                            ? "Banned"
                            : "Active"}
                        </span>
                        {/* Verification Badge */}
                        {user.verified && (
                          <span className="px-2 py-1 text-xs rounded bg-purple-100 text-purple-700 inline-block w-fit">
                            ✓ Verified
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDistanceToNow(new Date(user.created_at), {
                        addSuffix: true,
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        {/* Change Role Button */}
                        <button
                          onClick={() => {
                            set_selected_user(user);
                            set_new_role(user.role);
                            set_action_modal("role");
                          }}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                          title="Change Role"
                        >
                          Change Role
                        </button>

                        {/* Verification Toggle */}
                        {user.verified ? (
                          <button
                            onClick={() => {
                              set_confirm_dialog({
                                open: true,
                                title: "Unverify User",
                                description: `Are you sure you want to unverify ${user.name}? This will remove their verified status.`,
                                onConfirm: async () => {
                                  await unverify_user(user._id);
                                },
                                variant: "warning",
                              });
                            }}
                            className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                            title="Unverify User"
                          >
                            Unverify
                          </button>
                        ) : (
                          <button
                            onClick={async () => {
                              await verify_user(user._id);
                            }}
                            className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                            title="Verify User"
                          >
                            Verify
                          </button>
                        )}

                        {/* Active/Deactivate Toggle */}
                        {user.is_active ? (
                          <button
                            onClick={() => {
                              set_confirm_dialog({
                                open: true,
                                title: "Deactivate User",
                                description: `Are you sure you want to deactivate ${user.name}? They won't be able to login until reactivated.`,
                                onConfirm: async () => {
                                  await deactivate_user(user._id);
                                },
                                variant: "warning",
                              });
                            }}
                            className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200"
                            title="Deactivate User"
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            onClick={async () => {
                              await activate_user(user._id);
                            }}
                            className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                            title="Activate User"
                          >
                            Activate
                          </button>
                        )}

                        {/* Ban/Unban */}
                        {user.is_banned ? (
                          <button
                            onClick={() => {
                              set_selected_user(user);
                              set_action_modal("unban");
                            }}
                            className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                            title="Unban User"
                          >
                            Unban
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              set_selected_user(user);
                              set_action_modal("ban");
                            }}
                            className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                            title="Ban User"
                          >
                            Ban
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Ban Modal */}
      <Dialog
        open={action_modal === "ban" && !!selected_user}
        onOpenChange={(open) => {
          if (!open) {
            set_action_modal(null);
            set_ban_reason("");
            set_selected_user(null);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ban User: {selected_user?.name}</DialogTitle>
            <DialogDescription>
              Provide a reason for banning this user.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              Reason for banning
            </label>
            <textarea
              value={ban_reason}
              onChange={(e) => set_ban_reason(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Enter reason for banning this user..."
            />
          </div>
          <DialogFooter>
            <button
              onClick={() => {
                set_action_modal(null);
                set_ban_reason("");
                set_selected_user(null);
              }}
              className="px-4 py-2 text-sm text-foreground bg-muted rounded-lg hover:bg-muted/80"
            >
              Cancel
            </button>
            <button
              onClick={handle_ban}
              disabled={!ban_reason}
              className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Ban User
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unban Modal */}
      <Dialog
        open={action_modal === "unban" && !!selected_user}
        onOpenChange={(open) => {
          if (!open) {
            set_action_modal(null);
            set_selected_user(null);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Unban User: {selected_user?.name}</DialogTitle>
            <DialogDescription>
              Are you sure you want to unban this user? They will regain full
              access to the platform.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={() => {
                set_action_modal(null);
                set_selected_user(null);
              }}
              className="px-4 py-2 text-sm text-foreground bg-muted rounded-lg hover:bg-muted/80"
            >
              Cancel
            </button>
            <button
              onClick={handle_unban}
              className="px-4 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700"
            >
              Unban User
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Change Modal */}
      <Dialog
        open={action_modal === "role" && !!selected_user}
        onOpenChange={(open) => {
          if (!open) {
            set_action_modal(null);
            set_new_role("");
            set_selected_user(null);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change User Role: {selected_user?.name}</DialogTitle>
            <DialogDescription>
              Current Role:{" "}
              <span className="font-bold text-blue-600">
                {selected_user?.role}
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              Select New Role
            </label>
            <select
              value={new_role}
              onChange={(e) => set_new_role(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="student">Student</option>
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
              <option value="support_staff">Support Staff</option>
            </select>
            <p className="text-xs text-gray-500 mt-2">
              {new_role === "admin" &&
                "Admin has full access to all features and can manage all users."}
              {new_role === "moderator" &&
                "Moderator can manage items, claims, and reports but has limited user management."}
              {new_role === "support_staff" &&
                "Support Staff can view and assist with claims and reports."}
              {new_role === "student" &&
                "Student has basic user access to post and claim items."}
            </p>
          </div>
          <DialogFooter>
            <button
              onClick={() => {
                set_action_modal(null);
                set_new_role("");
                set_selected_user(null);
              }}
              className="px-4 py-2 text-sm text-foreground bg-muted rounded-lg hover:bg-muted/80"
            >
              Cancel
            </button>
            <button
              onClick={handle_role_change}
              disabled={!new_role || new_role === selected_user?.role}
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Update Role
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirm_dialog.open}
        onOpenChange={(open) =>
          set_confirm_dialog((prev) => ({ ...prev, open }))
        }
        title={confirm_dialog.title}
        description={confirm_dialog.description}
        onConfirm={confirm_dialog.onConfirm}
        variant={confirm_dialog.variant}
        confirmText="Confirm"
        cancelText="Cancel"
      />
    </div>
  );
}
