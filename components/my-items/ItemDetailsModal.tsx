"use client";

import { LostItem, FoundItem, ShareItem } from "@/types/items.types";
import {
  X,
  Calendar,
  MapPin,
  Tag,
  Eye,
  DollarSign,
  Package,
  Clock,
} from "lucide-react";
import Image from "next/image";

interface ItemDetailsModalProps {
  item: LostItem | FoundItem | ShareItem | null;
  type: "lost" | "found" | "share";
  isOpen: boolean;
  onClose: () => void;
}

export default function ItemDetailsModal({
  item,
  type,
  isOpen,
  onClose,
}: ItemDetailsModalProps) {
  if (!isOpen || !item) return null;

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      pending:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      active:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      available:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      found:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      claimed:
        "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
      returned:
        "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
      reserved:
        "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
      shared:
        "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400",
      closed:
        "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
      rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    };
    return (
      statusColors[status] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    );
  };

  const getDateLabel = () => {
    if (type === "lost") {
      return (item as LostItem).date_lost;
    } else if (type === "found") {
      return (item as FoundItem).date_found;
    } else {
      return item.created_at;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-card rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors z-10"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>

          {/* Image Section */}
          {item.image_url && (
            <div className="relative h-80 bg-muted">
              <Image
                src={item.image_url}
                alt={item.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 896px"
              />
            </div>
          )}

          {/* Content Section */}
          <div className="p-6">
            {/* Header */}
            <div className="mb-4">
              <div className="flex items-start justify-between mb-2">
                <h2 className="text-2xl font-bold text-foreground pr-12">
                  {item.title}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                    item.status,
                  )}`}
                >
                  {item.status}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                  {item.category}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Description
              </h3>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {item.description}
              </p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Location
                  </p>
                  <p className="text-gray-900 dark:text-gray-100">
                    {item.location}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {type === "lost"
                      ? "Date Lost"
                      : type === "found"
                        ? "Date Found"
                        : "Posted"}
                  </p>
                  <p className="text-gray-900 dark:text-gray-100">
                    {formatDate(getDateLabel())}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Views
                  </p>
                  <p className="text-gray-900 dark:text-gray-100">
                    {("views" in item ? item.views : 0) || 0} times
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Created
                  </p>
                  <p className="text-gray-900 dark:text-gray-100">
                    {formatDateTime(item.created_at)}
                  </p>
                </div>
              </div>

              {type === "share" && (
                <>
                  <div className="flex items-start gap-3">
                    <Tag className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Offer Type
                      </p>
                      <p className="text-gray-900 dark:text-gray-100 capitalize">
                        {(item as ShareItem).offer_type}
                      </p>
                    </div>
                  </div>

                  {(item as ShareItem).offer_type === "sale" && (
                    <div className="flex items-start gap-3">
                      <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400 mt-1" />
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Price
                        </p>
                        <p className="text-gray-900 dark:text-gray-100 font-semibold">
                          ৳{(item as ShareItem).price}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <Package className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Condition
                      </p>
                      <p className="text-gray-900 dark:text-gray-100 capitalize">
                        {(item as ShareItem).condition?.replace("-", " ")}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {type === "lost" && (item as LostItem).reward_amount && (
                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Reward
                    </p>
                    <p className="text-gray-900 dark:text-gray-100 font-semibold">
                      ৳{(item as LostItem).reward_amount}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex justify-end pt-4 border-t border-border">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
