"use client";

import { useAdmin } from "@/contexts/admin-context";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { RefreshCw, AlertTriangle, Eye } from "lucide-react";
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

interface Report {
  _id: string;
  reporter_id?: {
    _id: string;
    name: string;
    email: string;
  } | null;
  reported_type: string;
  reported_id: string;
  reason: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at?: string;
  resolution?: string;
}

export default function ReportsPage() {
  const { reports, loading, resolve_report } = useAdmin();

  const [status_filter, set_status_filter] = useState("all");
  const [priority_filter, set_priority_filter] = useState("all");
  const [selected_report, set_selected_report] = useState<Report | null>(null);
  const [action_modal, set_action_modal] = useState<"resolve" | "view" | null>(
    null,
  );
  const [resolution, set_resolution] = useState("");
  const [action_loading, set_action_loading] = useState(false);

  const { fetch_reports } = useAdmin();

  useEffect(() => {
    fetch_reports({
      status: status_filter === "all" ? "" : status_filter,
      priority: priority_filter === "all" ? "" : priority_filter,
    });
  }, [fetch_reports, status_filter, priority_filter]);

  const handle_resolve = async () => {
    if (selected_report && resolution) {
      set_action_loading(true);
      try {
        await resolve_report(selected_report._id, resolution);
        set_action_modal(null);
        set_resolution("");
        set_selected_report(null);
      } catch (error) {
        console.error("Error resolving report:", error);
      } finally {
        set_action_loading(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Reports & Flagged Content
        </h1>
        <button
          onClick={() =>
            fetch_reports({
              status: status_filter === "all" ? "" : status_filter,
              priority: priority_filter === "all" ? "" : priority_filter,
            })
          }
          disabled={loading.reports}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading.reports ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Select value={status_filter} onValueChange={set_status_filter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select value={priority_filter} onValueChange={set_priority_filter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center md:col-span-2">
            <span className="text-sm text-gray-600">
              Total: <strong>{reports.length}</strong> reports
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading.reports ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <AlertTriangle size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No reports found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type & Target
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reporter
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.map((report) => (
                  <tr key={report._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 capitalize">
                        {report.reported_type}
                      </div>
                      <div className="text-xs text-gray-500 truncate max-w-xs">
                        ID: {report.reported_id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {report.reporter_id?.name || "Unknown"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {report.reporter_id?.email || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs">
                        {report.reason}
                      </div>
                      <div className="text-xs text-gray-500 line-clamp-1 max-w-xs">
                        {report.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded capitalize ${
                          report.priority === "critical"
                            ? "bg-red-100 text-red-700"
                            : report.priority === "high"
                            ? "bg-orange-100 text-orange-700"
                            : report.priority === "medium"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {report.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded capitalize ${
                          report.status === "resolved"
                            ? "bg-green-100 text-green-700"
                            : report.status === "dismissed"
                            ? "bg-gray-100 text-gray-700"
                            : report.status === "under_review"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {report.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDistanceToNow(new Date(report.created_at), {
                        addSuffix: true,
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            set_selected_report(report);
                            set_action_modal("view");
                          }}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        {report.status !== "resolved" && report.status !== "dismissed" && (
                          <button
                            onClick={() => {
                              set_selected_report(report);
                              set_action_modal("resolve");
                            }}
                            className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Resolve
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile/Tablet Cards */}
          <div className="lg:hidden divide-y divide-gray-200">
            {reports.map((report) => (
              <div key={report._id} className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="shrink-0 h-12 w-12 bg-gray-100 rounded flex items-center justify-center">
                    <AlertTriangle size={24} className="text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 mb-1 capitalize">
                      {report.reported_type}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span
                        className={`px-2 py-0.5 text-xs rounded capitalize ${
                          report.priority === "critical"
                            ? "bg-red-100 text-red-700"
                            : report.priority === "high"
                            ? "bg-orange-100 text-orange-700"
                            : report.priority === "medium"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {report.priority}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-xs rounded capitalize ${
                          report.status === "resolved"
                            ? "bg-green-100 text-green-700"
                            : report.status === "dismissed"
                            ? "bg-gray-100 text-gray-700"
                            : report.status === "under_review"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {report.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      By {report.reporter_id?.name || "Unknown"}
                    </p>
                  </div>
                </div>
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-900">{report.reason}</p>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                    {report.description}
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3 pb-3 border-b">
                  <span>ID: {report.reported_id.substring(0, 8)}...</span>
                  <span>
                    {formatDistanceToNow(new Date(report.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      set_selected_report(report);
                      set_action_modal("view");
                    }}
                    className="flex-1 px-3 py-1.5 border border-blue-600 text-blue-600 rounded text-xs hover:bg-blue-50 flex items-center justify-center gap-1"
                  >
                    <Eye size={14} />
                    View
                  </button>
                  {report.status !== "resolved" && report.status !== "dismissed" && (
                    <button
                      onClick={() => {
                        set_selected_report(report);
                        set_action_modal("resolve");
                      }}
                      className="flex-1 px-3 py-1.5 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <Dialog
        open={action_modal === "view" && !!selected_report}
        onOpenChange={(open) => {
          if (!open) {
            set_action_modal(null);
            set_selected_report(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-700">Type:</span>
                  <p className="text-sm text-gray-600 capitalize">
                    {selected_report?.reported_type}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  <p className="text-sm text-gray-600 capitalize">
                    {selected_report?.status.replace("_", " ")}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Priority:</span>
                  <p className="text-sm text-gray-600 capitalize">
                    {selected_report?.priority}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Reported:</span>
                  <p className="text-sm text-gray-600">
                    {selected_report &&
                      formatDistanceToNow(new Date(selected_report.created_at), {
                        addSuffix: true,
                      })}
                  </p>
                </div>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Target ID:</span>
                <p className="text-sm text-gray-600 font-mono break-all">
                  {selected_report?.reported_id}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Reporter:</span>
                <p className="text-sm text-gray-600">
                  {selected_report?.reporter_id?.name || "Unknown"} (
                  {selected_report?.reporter_id?.email || "N/A"})
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Reason:</span>
                <p className="text-sm text-gray-600 mt-1">{selected_report?.reason}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Description:</span>
                <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">
                  {selected_report?.description}
                </p>
              </div>
              {selected_report?.resolution && (
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Resolution:
                  </span>
                  <p className="text-sm text-green-600 mt-1">
                    {selected_report.resolution}
                  </p>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => {
                set_action_modal(null);
                set_selected_report(null);
              }}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Close
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={action_modal === "resolve" && !!selected_report}
        onOpenChange={(open) => {
          if (!open) {
            set_action_modal(null);
            set_resolution("");
            set_selected_report(null);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Resolve Report</DialogTitle>
            <DialogDescription>
              Provide resolution notes for this report. The report will be marked as
              resolved.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resolution notes
            </label>
            <textarea
              value={resolution}
              onChange={(e) => set_resolution(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter resolution notes..."
              disabled={action_loading}
            />
          </div>
          <DialogFooter>
            <button
              onClick={() => {
                set_action_modal(null);
                set_resolution("");
                set_selected_report(null);
              }}
              disabled={action_loading}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handle_resolve}
              disabled={!resolution.trim() || action_loading}
              className="px-4 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {action_loading ? "Resolving..." : "Resolve"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
