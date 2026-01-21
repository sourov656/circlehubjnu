"use client";

import { useAdmin } from "@/contexts/admin-context";
import { useEffect, useState } from "react";
import { formatDistanceToNow, format } from "date-fns";
import { RefreshCw, FileText, Eye, Download, Filter, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AuditLog {
  _id: string;
  admin_id?: {
    _id: string;
    name: string;
    email: string;
    role?: string;
  } | null;
  action: string;
  target_type: string;
  target_id?: string;
  details: any;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
}

export default function LogsPage() {
  const { audit_logs, loading, fetch_audit_logs } = useAdmin();

  const [action_filter, set_action_filter] = useState("all");
  const [target_type_filter, set_target_type_filter] = useState("all");
  const [selected_log, set_selected_log] = useState<AuditLog | null>(null);
  const [view_modal, set_view_modal] = useState(false);

  useEffect(() => {
    fetch_audit_logs({
      action: action_filter === "all" ? "" : action_filter,
      target_type: target_type_filter === "all" ? "" : target_type_filter,
    });
  }, [fetch_audit_logs, action_filter, target_type_filter]);

  const handle_export = () => {
    const csv_data = audit_logs.map((log) => ({
      Admin: log.admin_id?.name || "System",
      Email: log.admin_id?.email || "N/A",
      Role: log.admin_id?.role || "N/A",
      Action: log.action,
      "Target Type": log.target_type,
      "Target ID": log.target_id || "",
      "IP Address": log.ip_address || "",
      Timestamp: format(new Date(log.timestamp), "yyyy-MM-dd HH:mm:ss"),
      Details: JSON.stringify(log.details),
    }));

    const csv_headers = Object.keys(csv_data[0] || {});
    const csv_rows = csv_data.map((row) =>
      csv_headers
        .map((header) => `"${row[header as keyof typeof row] || ""}"`)
        .join(","),
    );

    const csv_content = [csv_headers.join(","), ...csv_rows].join("\n");
    const blob = new Blob([csv_content], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `audit_logs_${format(new Date(), "yyyy-MM-dd_HHmmss")}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const get_action_badge_color = (action: string) => {
    if (
      action.includes("ban") ||
      action.includes("delete") ||
      action.includes("reject")
    )
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    if (
      action.includes("approve") ||
      action.includes("verify") ||
      action.includes("activate")
    )
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    if (
      action.includes("update") ||
      action.includes("resolve") ||
      action.includes("assign")
    )
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  };

  const clear_filters = () => {
    set_action_filter("all");
    set_target_type_filter("all");
  };

  const has_active_filters =
    action_filter !== "all" || target_type_filter !== "all";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Audit Logs</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track all admin actions and system activities
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handle_export}
            disabled={loading.logs || audit_logs.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Export logs as CSV"
          >
            <Download size={16} />
            Export
          </button>
          <button
            onClick={() =>
              fetch_audit_logs({
                action: action_filter === "all" ? "" : action_filter,
                target_type:
                  target_type_filter === "all" ? "" : target_type_filter,
              })
            }
            disabled={loading.logs}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading.logs ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-card rounded-lg shadow border border-border">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-muted-foreground" />
              <span className="font-medium text-foreground">Filters</span>
              {has_active_filters && (
                <button
                  onClick={clear_filters}
                  className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded flex items-center gap-1 hover:bg-red-200 dark:hover:bg-red-900/50"
                >
                  <X size={12} />
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Action Type
              </label>
              <Select value={action_filter} onValueChange={set_action_filter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="ban_user">Ban User</SelectItem>
                  <SelectItem value="unban_user">Unban User</SelectItem>
                  <SelectItem value="update_user">Update User</SelectItem>
                  <SelectItem value="delete_user">Delete User</SelectItem>
                  <SelectItem value="update_user_role">
                    Update User Role
                  </SelectItem>
                  <SelectItem value="verify_user">Verify User</SelectItem>
                  <SelectItem value="unverify_user">Unverify User</SelectItem>
                  <SelectItem value="activate_user">Activate User</SelectItem>
                  <SelectItem value="deactivate_user">
                    Deactivate User
                  </SelectItem>
                  <SelectItem value="approve_item">Approve Item</SelectItem>
                  <SelectItem value="reject_item">Reject Item</SelectItem>
                  <SelectItem value="delete_item">Delete Item</SelectItem>
                  <SelectItem value="approve_claim">Approve Claim</SelectItem>
                  <SelectItem value="reject_claim">Reject Claim</SelectItem>
                  <SelectItem value="update_report_status">
                    Update Report
                  </SelectItem>
                  <SelectItem value="assign_report">Assign Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Target Type
              </label>
              <Select
                value={target_type_filter}
                onValueChange={set_target_type_filter}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Target Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Target Types</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="item">Item</SelectItem>
                  <SelectItem value="claim">Claim</SelectItem>
                  <SelectItem value="report">Report</SelectItem>
                  <SelectItem value="setting">Setting</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <div className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  {audit_logs.length}
                </span>{" "}
                logs found
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logs Content */}
      {loading.logs ? (
        <div className="flex items-center justify-center h-64 bg-card rounded-lg shadow border border-border">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">
              Loading audit logs...
            </p>
          </div>
        </div>
      ) : audit_logs.length === 0 ? (
        <div className="bg-card rounded-lg shadow border border-border p-12 text-center">
          <FileText
            size={64}
            className="mx-auto text-muted-foreground mb-4 opacity-50"
          />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No Audit Logs Found
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {has_active_filters
              ? "No logs match the selected filters. Try adjusting or clearing them."
              : "No audit logs have been recorded yet."}
          </p>
          {has_active_filters && (
            <button
              onClick={clear_filters}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="bg-card rounded-lg shadow border border-border overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Admin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Target
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    IP Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {audit_logs.map((log) => (
                  <tr
                    key={log._id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                          {(log.admin_id?.name || "SYS")
                            .substring(0, 2)
                            .toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-foreground">
                            {log.admin_id?.name || "System"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {log.admin_id?.email || "N/A"}
                          </div>
                          {log.admin_id?.role && (
                            <div className="text-xs text-muted-foreground capitalize mt-0.5">
                              {log.admin_id.role}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 text-xs font-medium rounded-full ${get_action_badge_color(
                          log.action,
                        )}`}
                      >
                        {log.action.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-foreground capitalize">
                        {log.target_type}
                      </div>
                      {log.target_id && (
                        <div className="text-xs text-muted-foreground truncate max-w-[200px] font-mono mt-0.5">
                          {log.target_id}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-muted-foreground font-mono">
                        {log.ip_address || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-foreground">
                        {formatDistanceToNow(new Date(log.timestamp), {
                          addSuffix: true,
                        })}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {format(new Date(log.timestamp), "MMM dd, yyyy HH:mm")}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => {
                          set_selected_log(log);
                          set_view_modal(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye size={16} />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile/Tablet Cards */}
          <div className="lg:hidden divide-y divide-border">
            {audit_logs.map((log) => (
              <div
                key={log._id}
                className="p-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="shrink-0 h-12 w-12 rounded-full bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                    {(log.admin_id?.name || "SYS")
                      .substring(0, 2)
                      .toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-foreground mb-1">
                      {log.admin_id?.name || "System"}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${get_action_badge_color(
                          log.action,
                        )}`}
                      >
                        {log.action.replace(/_/g, " ")}
                      </span>
                      <span className="px-2 py-0.5 text-xs bg-muted rounded-full capitalize font-medium">
                        {log.target_type}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {log.admin_id?.email || "N/A"}
                      {log.admin_id?.role && ` • ${log.admin_id.role}`}
                    </p>
                  </div>
                </div>
                {log.target_id && (
                  <div className="mb-3 p-2 bg-muted/30 rounded text-xs">
                    <span className="text-muted-foreground">Target ID: </span>
                    <span className="text-foreground font-mono break-all">
                      {log.target_id}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between text-xs mb-3 pb-3 border-b border-border">
                  <div>
                    <span className="text-muted-foreground">IP: </span>
                    <span className="text-foreground font-mono">
                      {log.ip_address || "N/A"}
                    </span>
                  </div>
                  <div className="text-muted-foreground">
                    {formatDistanceToNow(new Date(log.timestamp), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
                <button
                  onClick={() => {
                    set_selected_log(log);
                    set_view_modal(true);
                  }}
                  className="w-full px-3 py-2 border border-blue-600 text-blue-600 rounded-lg text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center justify-center gap-2 transition-colors"
                >
                  <Eye size={16} />
                  View Full Details
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View Details Modal */}
      <Dialog open={view_modal} onOpenChange={set_view_modal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Audit Log Details
            </DialogTitle>
            <DialogDescription>
              Complete information about this audit log entry
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            {/* Admin Info Section */}
            <div className="mb-6 pb-6 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
                Administrator Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                    {(selected_log?.admin_id?.name || "SYS")
                      .substring(0, 2)
                      .toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {selected_log?.admin_id?.name || "System"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selected_log?.admin_id?.email || "N/A"}
                    </p>
                    {selected_log?.admin_id?.role && (
                      <p className="text-xs text-muted-foreground capitalize mt-0.5">
                        Role: {selected_log.admin_id.role}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Info Section */}
            <div className="mb-6 pb-6 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
                Action Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Action
                  </label>
                  <div className="mt-1">
                    <span
                      className={`inline-block px-3 py-1.5 text-sm font-medium rounded-full ${get_action_badge_color(
                        selected_log?.action || "",
                      )}`}
                    >
                      {selected_log?.action.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Target Type
                  </label>
                  <p className="mt-1 text-sm text-foreground capitalize font-medium">
                    {selected_log?.target_type}
                  </p>
                </div>
              </div>
            </div>

            {/* Target Info Section */}
            {selected_log?.target_id && (
              <div className="mb-6 pb-6 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
                  Target Information
                </h3>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Target ID
                  </label>
                  <div className="mt-1 p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm text-foreground font-mono break-all">
                      {selected_log.target_id}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Technical Info Section */}
            <div className="mb-6 pb-6 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
                Technical Information
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    IP Address
                  </label>
                  <p className="mt-1 text-sm text-foreground font-mono">
                    {selected_log?.ip_address || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Timestamp
                  </label>
                  <p className="mt-1 text-sm text-foreground">
                    {selected_log &&
                      format(
                        new Date(selected_log.timestamp),
                        "MMMM dd, yyyy 'at' hh:mm:ss a",
                      )}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selected_log &&
                      formatDistanceToNow(new Date(selected_log.timestamp), {
                        addSuffix: true,
                      })}
                  </p>
                </div>
                {selected_log?.user_agent && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      User Agent
                    </label>
                    <div className="mt-1 p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-foreground break-all font-mono">
                        {selected_log.user_agent}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Details Section */}
            {selected_log?.details &&
              Object.keys(selected_log.details).length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
                    Additional Details
                  </h3>
                  <div className="p-4 bg-muted/50 rounded-lg border border-border">
                    <pre className="text-xs text-foreground font-mono whitespace-pre-wrap break-all overflow-auto max-h-64">
                      {JSON.stringify(selected_log.details, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
          </div>
          <DialogFooter className="gap-2">
            <button
              onClick={() => {
                set_view_modal(false);
                set_selected_log(null);
              }}
              className="flex-1 px-4 py-2.5 bg-muted hover:bg-muted/80 text-foreground rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
