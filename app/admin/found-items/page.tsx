"use client";

import { useAdmin } from "@/contexts/admin-context";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { RefreshCw, Sparkles, Eye } from "lucide-react";
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

interface FoundItem {
  _id: string;
  title: string;
  category: string;
  description: string;
  images?: string[];
  status: string;
  user_id?: {
    _id: string;
    name: string;
    email: string;
  };
  created_at: string;
  location?: string;
}

export default function FoundItemsPage() {
  const {
    found_items,
    loading,
    fetch_found_items,
    approve_item,
    reject_item,
    delete_item,
  } = useAdmin();

  const [search, set_search] = useState("");
  const [status_filter, set_status_filter] = useState("all");
  const [category_filter, set_category_filter] = useState("all");
  const [selected_item, set_selected_item] = useState<FoundItem | null>(null);
  const [action_modal, set_action_modal] = useState<
    "approve" | "reject" | "delete" | "view" | null
  >(null);
  const [reject_reason, set_reject_reason] = useState("");
  const [action_loading, set_action_loading] = useState(false);

  useEffect(() => {
    fetch_found_items({
      search,
      status: status_filter === "all" ? "" : status_filter,
      category: category_filter === "all" ? "" : category_filter,
    });
  }, [fetch_found_items, search, status_filter, category_filter]);

  const handle_approve = async () => {
    if (selected_item) {
      set_action_loading(true);
      try {
        await approve_item(selected_item._id, "found");
        set_action_modal(null);
        set_selected_item(null);
      } catch (error) {
        console.error("Error approving item:", error);
      } finally {
        set_action_loading(false);
      }
    }
  };

  const handle_reject = async () => {
    if (selected_item && reject_reason) {
      set_action_loading(true);
      try {
        await reject_item(selected_item._id, "found", reject_reason);
        set_action_modal(null);
        set_reject_reason("");
        set_selected_item(null);
      } catch (error) {
        console.error("Error rejecting item:", error);
      } finally {
        set_action_loading(false);
      }
    }
  };

  const handle_delete = async () => {
    if (selected_item) {
      set_action_loading(true);
      try {
        await delete_item(selected_item._id, "found");
        set_action_modal(null);
        set_selected_item(null);
      } catch (error) {
        console.error("Error deleting item:", error);
      } finally {
        set_action_loading(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Found Items Management
        </h1>
        <button
          onClick={() =>
            fetch_found_items({
              search,
              status: status_filter === "all" ? "" : status_filter,
              category: category_filter === "all" ? "" : category_filter,
            })
          }
          disabled={loading.items}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loading.items ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <input
              type="text"
              placeholder="Search items..."
              value={search}
              onChange={(e) => set_search(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          <div>
            <Select value={status_filter} onValueChange={set_status_filter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="claimed">Claimed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select value={category_filter} onValueChange={set_category_filter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="electronics">Electronics</SelectItem>
                <SelectItem value="books">Books</SelectItem>
                <SelectItem value="clothing">Clothing</SelectItem>
                <SelectItem value="accessories">Accessories</SelectItem>
                <SelectItem value="others">Others</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-600">
              Total: <strong>{found_items.length}</strong> items
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading.items ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : found_items.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Sparkles size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No found items</p>
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
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Posted By
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
                {found_items.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="shrink-0 h-10 w-10 relative bg-gray-200 rounded overflow-hidden">
                          {item.images?.[0] ? (
                            <Image
                              fill
                              src={item.images[0]}
                              alt={item.title}
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Sparkles size={20} />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                            {item.title}
                          </div>
                          {item.location && (
                            <div className="text-xs text-gray-500 truncate max-w-xs">
                              📍 {item.location}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs bg-gray-100 rounded capitalize">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded capitalize ${
                          item.status === "available"
                            ? "bg-green-100 text-green-700"
                            : item.status === "claimed"
                              ? "bg-blue-100 text-blue-700"
                              : item.status === "rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {item.user_id?.name || "Unknown"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDistanceToNow(new Date(item.created_at), {
                        addSuffix: true,
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            set_selected_item(item);
                            set_action_modal("view");
                          }}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        {item.status !== "claimed" && (
                          <>
                            {item.status !== "available" && (
                              <button
                                onClick={() => {
                                  set_selected_item(item);
                                  set_action_modal("approve");
                                }}
                                className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                              >
                                Approve
                              </button>
                            )}
                            <button
                              onClick={() => {
                                set_selected_item(item);
                                set_action_modal("reject");
                              }}
                              className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => {
                            set_selected_item(item);
                            set_action_modal("delete");
                          }}
                          className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile/Tablet Cards */}
          <div className="lg:hidden divide-y divide-gray-200">
            {found_items.map((item) => (
              <div key={item._id} className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="shrink-0 h-16 w-16 relative bg-gray-200 rounded overflow-hidden">
                    {item.images?.[0] ? (
                      <Image
                        fill
                        src={item.images[0]}
                        alt={item.title}
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Sparkles size={24} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">
                      {item.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 text-xs bg-gray-100 rounded capitalize">
                        {item.category}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-xs rounded capitalize ${
                          item.status === "available"
                            ? "bg-green-100 text-green-700"
                            : item.status === "claimed"
                              ? "bg-blue-100 text-blue-700"
                              : item.status === "rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                    {item.location && (
                      <p className="text-xs text-gray-500 truncate">
                        📍 {item.location}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3 pb-3 border-b">
                  <span>By {item.user_id?.name || "Unknown"}</span>
                  <span>
                    {formatDistanceToNow(new Date(item.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      set_selected_item(item);
                      set_action_modal("view");
                    }}
                    className="flex-1 px-3 py-1.5 border border-blue-600 text-blue-600 rounded text-xs hover:bg-blue-50 flex items-center justify-center gap-1"
                  >
                    <Eye size={14} />
                    View
                  </button>
                  {item.status !== "claimed" && (
                    <>
                      {item.status !== "available" && (
                        <button
                          onClick={() => {
                            set_selected_item(item);
                            set_action_modal("approve");
                          }}
                          className="flex-1 px-3 py-1.5 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                        >
                          Approve
                        </button>
                      )}
                      <button
                        onClick={() => {
                          set_selected_item(item);
                          set_action_modal("reject");
                        }}
                        className="flex-1 px-3 py-1.5 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => {
                      set_selected_item(item);
                      set_action_modal("delete");
                    }}
                    className="px-3 py-1.5 bg-gray-600 text-white rounded text-xs hover:bg-gray-700"
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <Dialog
        open={action_modal === "view" && !!selected_item}
        onOpenChange={(open) => {
          if (!open) {
            set_action_modal(null);
            set_selected_item(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selected_item?.title}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {selected_item?.images && selected_item.images.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                {selected_item.images.map((img: string, idx: number) => (
                  <div key={idx} className="relative w-full h-48">
                    <Image
                      fill
                      src={img}
                      alt={`Image ${idx + 1}`}
                      className="object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
            )}
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Description:
                </span>
                <p className="text-sm text-gray-600 mt-1">
                  {selected_item?.description}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Category:
                  </span>
                  <p className="text-sm text-gray-600 capitalize">
                    {selected_item?.category}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Status:
                  </span>
                  <p className="text-sm text-gray-600 capitalize">
                    {selected_item?.status}
                  </p>
                </div>
                {selected_item?.location && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">
                      Location:
                    </span>
                    <p className="text-sm text-gray-600">
                      {selected_item.location}
                    </p>
                  </div>
                )}
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Posted:
                  </span>
                  <p className="text-sm text-gray-600">
                    {selected_item &&
                      formatDistanceToNow(new Date(selected_item.created_at), {
                        addSuffix: true,
                      })}
                  </p>
                </div>
              </div>
              {selected_item?.user_id && (
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Posted by:
                  </span>
                  <p className="text-sm text-gray-600">
                    {selected_item.user_id.name} ({selected_item.user_id.email})
                  </p>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => {
                set_action_modal(null);
                set_selected_item(null);
              }}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Close
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={action_modal === "approve" && !!selected_item}
        onOpenChange={(open) => {
          if (!open) {
            set_action_modal(null);
            set_selected_item(null);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Approve Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve{" "}
              <strong>{selected_item?.title}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={() => {
                set_action_modal(null);
                set_selected_item(null);
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
        open={action_modal === "reject" && !!selected_item}
        onOpenChange={(open) => {
          if (!open) {
            set_action_modal(null);
            set_reject_reason("");
            set_selected_item(null);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Item</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this item.
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
                set_selected_item(null);
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

      <Dialog
        open={action_modal === "delete" && !!selected_item}
        onOpenChange={(open) => {
          if (!open) {
            set_action_modal(null);
            set_selected_item(null);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <strong>{selected_item?.title}</strong>? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={() => {
                set_action_modal(null);
                set_selected_item(null);
              }}
              disabled={action_loading}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handle_delete}
              disabled={action_loading}
              className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {action_loading ? "Deleting..." : "Delete"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
