"use client";

import { useAdmin } from "@/contexts/admin-context";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { RefreshCw, ClipboardCheck, Eye } from "lucide-react";
import Image from "next/image";
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

interface Claim {
  _id: string;
  foundItemId?: {
    _id: string;
    title: string;
    category: string;
    images?: string[];
  } | null;
  claimerId?: {
    _id: string;
    name: string;
    email: string;
  } | null;
  status: string;
  verification_answers?: any;
  message?: string;
  contactInfo?: {
    phone?: string;
    email?: string;
    other?: string;
  } | null;
  createdAt: string;
  updatedAt?: string;
  admin_notes?: string;
  reject_reason?: string;
}

export default function ClaimsPage() {
  const { claims, loading, fetch_claims, approve_claim, reject_claim } =
    useAdmin();

  const [status_filter, set_status_filter] = useState("all");
  const [selected_claim, set_selected_claim] = useState<Claim | null>(null);
  const [action_modal, set_action_modal] = useState<
    "approve" | "reject" | "view" | null
  >(null);
  const [reject_reason, set_reject_reason] = useState("");
  const [action_loading, set_action_loading] = useState(false);

  useEffect(() => {
    fetch_claims({ status: status_filter === "all" ? "" : status_filter });
  }, [fetch_claims, status_filter]);

  const handle_approve = async () => {
    if (selected_claim) {
      set_action_loading(true);
      try {
        await approve_claim(selected_claim._id);
        set_action_modal(null);
        set_selected_claim(null);
      } catch (error) {
        console.error("Error approving claim:", error);
      } finally {
        set_action_loading(false);
      }
    }
  };

  const handle_reject = async () => {
    if (selected_claim && reject_reason) {
      set_action_loading(true);
      try {
        await reject_claim(selected_claim._id, reject_reason);
        set_action_modal(null);
        set_reject_reason("");
        set_selected_claim(null);
      } catch (error) {
        console.error("Error rejecting claim:", error);
      } finally {
        set_action_loading(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Claims Management</h1>
        <button
          onClick={() =>
            fetch_claims({
              status: status_filter === "all" ? "" : status_filter,
            })
          }
          disabled={loading.claims}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loading.claims ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Select value={status_filter} onValueChange={set_status_filter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center md:col-span-2">
            <span className="text-sm text-gray-600">
              Total: <strong>{claims.length}</strong> claims
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading.claims ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : claims.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <ClipboardCheck size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No claims found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Claimant
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
                {claims.map((claim) => (
                  <tr key={claim._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="shrink-0 h-10 w-10 relative bg-gray-200 rounded overflow-hidden">
                          {claim.foundItemId?.images?.[0] ? (
                            <Image
                              fill
                              src={claim.foundItemId.images[0]}
                              alt={claim.foundItemId.title || "Item"}
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <ClipboardCheck size={20} />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                            {claim.foundItemId?.title || "Unknown Item"}
                          </div>
                          {claim.foundItemId?.category && (
                            <div className="text-xs text-gray-500 capitalize">
                              {claim.foundItemId.category}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {claim.claimerId?.name || "Unknown"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {claim.claimerId?.email || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded capitalize ${
                          claim.status === "approved" ||
                          claim.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : claim.status === "rejected"
                              ? "bg-red-100 text-red-700"
                              : claim.status === "processing"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {claim.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDistanceToNow(new Date(claim.createdAt), {
                        addSuffix: true,
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            set_selected_claim(claim);
                            set_action_modal("view");
                          }}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        {(claim.status === "pending" ||
                          claim.status === "processing") && (
                          <>
                            <button
                              onClick={() => {
                                set_selected_claim(claim);
                                set_action_modal("approve");
                              }}
                              className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                set_selected_claim(claim);
                                set_action_modal("reject");
                              }}
                              className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </>
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
            {claims.map((claim) => (
              <div key={claim._id} className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="shrink-0 h-16 w-16 relative bg-gray-200 rounded overflow-hidden">
                    {claim.foundItemId?.images?.[0] ? (
                      <Image
                        fill
                        src={claim.foundItemId.images[0]}
                        alt={claim.foundItemId.title || "Item"}
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ClipboardCheck size={24} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">
                      {claim.foundItemId?.title || "Unknown Item"}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      {claim.foundItemId?.category && (
                        <span className="px-2 py-0.5 text-xs bg-gray-100 rounded capitalize">
                          {claim.foundItemId.category}
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 text-xs rounded capitalize ${
                          claim.status === "approved" ||
                          claim.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : claim.status === "rejected"
                              ? "bg-red-100 text-red-700"
                              : claim.status === "processing"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {claim.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      By {claim.claimerId?.name || "Unknown"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3 pb-3 border-b">
                  <span>{claim.claimerId?.email || "N/A"}</span>
                  <span>
                    {formatDistanceToNow(new Date(claim.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      set_selected_claim(claim);
                      set_action_modal("view");
                    }}
                    className="flex-1 px-3 py-1.5 border border-blue-600 text-blue-600 rounded text-xs hover:bg-blue-50 flex items-center justify-center gap-1"
                  >
                    <Eye size={14} />
                    View
                  </button>
                  {(claim.status === "pending" ||
                    claim.status === "processing") && (
                    <>
                      <button
                        onClick={() => {
                          set_selected_claim(claim);
                          set_action_modal("approve");
                        }}
                        className="flex-1 px-3 py-1.5 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          set_selected_claim(claim);
                          set_action_modal("reject");
                        }}
                        className="flex-1 px-3 py-1.5 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <Dialog
        open={action_modal === "view" && !!selected_claim}
        onOpenChange={(open) => {
          if (!open) {
            set_action_modal(null);
            set_selected_claim(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Claim Details</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {selected_claim?.foundItemId?.images?.[0] && (
              <div className="relative w-full h-64 mb-4">
                <Image
                  fill
                  src={selected_claim.foundItemId.images[0]}
                  alt={selected_claim.foundItemId.title || "Item"}
                  className="object-cover rounded-lg"
                />
              </div>
            )}
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-700">Item:</span>
                <p className="text-sm text-gray-600 mt-1">
                  {selected_claim?.foundItemId?.title || "Unknown Item"}
                </p>
              </div>
              {selected_claim?.foundItemId?.category && (
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Category:
                  </span>
                  <p className="text-sm text-gray-600 capitalize">
                    {selected_claim.foundItemId.category}
                  </p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Claimant:
                  </span>
                  <p className="text-sm text-gray-600">
                    {selected_claim?.claimerId?.name || "Unknown"}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Status:
                  </span>
                  <p className="text-sm text-gray-600 capitalize">
                    {selected_claim?.status}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Email:
                  </span>
                  <p className="text-sm text-gray-600">
                    {selected_claim?.claimerId?.email || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Claimed:
                  </span>
                  <p className="text-sm text-gray-600">
                    {selected_claim &&
                      formatDistanceToNow(new Date(selected_claim.createdAt), {
                        addSuffix: true,
                      })}
                  </p>
                </div>
              </div>
              {selected_claim?.message && (
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Message:
                  </span>
                  <p className="text-sm text-gray-600 mt-1">
                    {selected_claim.message}
                  </p>
                </div>
              )}
              {selected_claim?.contactInfo && (
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Contact Information:
                  </span>
                  <div className="text-sm text-gray-600 mt-1 space-y-1">
                    {selected_claim.contactInfo.phone && (
                      <p>Phone: {selected_claim.contactInfo.phone}</p>
                    )}
                    {selected_claim.contactInfo.email && (
                      <p>Email: {selected_claim.contactInfo.email}</p>
                    )}
                    {selected_claim.contactInfo.other && (
                      <p>Other: {selected_claim.contactInfo.other}</p>
                    )}
                  </div>
                </div>
              )}
              {selected_claim?.verification_answers && (
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Verification Answers:
                  </span>
                  <pre className="text-xs text-gray-600 bg-gray-50 p-3 rounded mt-1 overflow-auto max-h-48">
                    {JSON.stringify(
                      selected_claim.verification_answers,
                      null,
                      2,
                    )}
                  </pre>
                </div>
              )}
              {selected_claim?.reject_reason && (
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Rejection Reason:
                  </span>
                  <p className="text-sm text-red-600 mt-1">
                    {selected_claim.reject_reason}
                  </p>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => {
                set_action_modal(null);
                set_selected_claim(null);
              }}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Close
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={action_modal === "approve" && !!selected_claim}
        onOpenChange={(open) => {
          if (!open) {
            set_action_modal(null);
            set_selected_claim(null);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Approve Claim</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve the claim for{" "}
              <strong>
                {selected_claim?.foundItemId?.title || "this item"}
              </strong>{" "}
              by <strong>{selected_claim?.claimerId?.name}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={() => {
                set_action_modal(null);
                set_selected_claim(null);
              }}
              disabled={action_loading}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handle_approve}
              disabled={action_loading}
              className="px-4 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {action_loading ? "Approving..." : "Approve"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={action_modal === "reject" && !!selected_claim}
        onOpenChange={(open) => {
          if (!open) {
            set_action_modal(null);
            set_reject_reason("");
            set_selected_claim(null);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Claim</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this claim.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for rejection
            </label>
            <textarea
              value={reject_reason}
              onChange={(e) => set_reject_reason(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Enter reason..."
              disabled={action_loading}
            />
          </div>
          <DialogFooter>
            <button
              onClick={() => {
                set_action_modal(null);
                set_reject_reason("");
                set_selected_claim(null);
              }}
              disabled={action_loading}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handle_reject}
              disabled={!reject_reason.trim() || action_loading}
              className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {action_loading ? "Rejecting..." : "Reject"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
