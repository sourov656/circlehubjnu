"use client";

import { LostItem, FoundItem, ShareItem } from "@/types/items.types";
import {
  Calendar,
  MapPin,
  Tag,
  Eye,
  Edit,
  Trash2,
  DollarSign,
} from "lucide-react";
import Image from "next/image";

interface ItemCardProps {
  item: LostItem | FoundItem | ShareItem;
  type: "lost" | "found" | "share";
  onView: (item: LostItem | FoundItem | ShareItem) => void;
  onEdit: (item: LostItem | FoundItem | ShareItem) => void;
  onDelete: (item: LostItem | FoundItem | ShareItem) => void;
}

export default function ItemCard({
  item,
  type,
  onView,
  onEdit,
  onDelete,
}: ItemCardProps) {
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
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Image Section */}
      <div className="relative h-48 bg-muted">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Tag className="w-16 h-16 text-gray-300 dark:text-gray-600" />
          </div>
        )}
        {/* Status Badge */}
        <div className="absolute top-2 right-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
              item.status,
            )}`}
          >
            {item.status}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-1">
          {item.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {item.description}
        </p>

        {/* Metadata */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <MapPin className="w-4 h-4 mr-2" />
            <span className="line-clamp-1">{item.location}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Calendar className="w-4 h-4 mr-2" />
            <span>{formatDate(getDateLabel())}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Eye className="w-4 h-4 mr-2" />
            <span>{("views" in item ? item.views : 0) || 0} views</span>
          </div>
          {type === "share" && (
            <>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <Tag className="w-4 h-4 mr-2" />
                <span className="capitalize">
                  {(item as ShareItem).offer_type}
                  {(item as ShareItem).offer_type === "sale" &&
                    ` - ৳${(item as ShareItem).price}`}
                </span>
              </div>
            </>
          )}
          {type === "lost" && (item as LostItem).reward_amount && (
            <div className="flex items-center text-sm text-green-600 dark:text-green-400 font-semibold">
              <DollarSign className="w-4 h-4 mr-2" />
              <span>Reward: ৳{(item as LostItem).reward_amount}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {item.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {item.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                +{item.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-3 border-t border-border">
          <button
            onClick={() => onView(item)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
          >
            <Eye className="w-4 h-4" />
            View
          </button>
          <button
            onClick={() => onEdit(item)}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 text-sm font-medium"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(item)}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-200 text-sm font-medium"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
