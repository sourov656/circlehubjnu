"use client";

import { Calendar, MapPin, Eye, User, Tag } from "lucide-react";
import { FoundItemWithProfile } from "@/types/items.types";
import Image from "next/image";

// Simple date formatting function
const formatDateDistance = (date: string) => {
  const now = new Date();
  const foundDate = new Date(date);
  const diffInMs = now.getTime() - foundDate.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return "today";
  if (diffInDays === 1) return "1 day";
  if (diffInDays < 30) return `${diffInDays} days`;
  if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return months === 1 ? "1 month" : `${months} months`;
  }
  const years = Math.floor(diffInDays / 365);
  return years === 1 ? "1 year" : `${years} years`;
};

interface ItemCardProps {
  item: FoundItemWithProfile;
  onClick: (item: FoundItemWithProfile) => void;
}

const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig: Record<string, { label: string; className: string }> = {
    available: {
      label: "Available",
      className:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    },
    claimed: {
      label: "Claimed",
      className:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    },
    returned: {
      label: "Returned",
      className:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    },
  };

  const config = statusConfig[status] || statusConfig.available;

  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full ${config.className}`}
    >
      {config.label}
    </span>
  );
};

export default function ItemCard({ item, onClick }: ItemCardProps) {
  const handleClick = () => {
    onClick(item);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-card rounded-lg shadow-sm border border-border hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
    >
      {/* Image */}
      {item.image_url && (
        <div className="aspect-video overflow-hidden bg-muted">
          <Image
            src={item.image_url}
            alt={item.title}
            width={600}
            height={400}
            className="w-full h-full object-cover"
          />
        </div>
      )}{" "}
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-foreground text-lg leading-tight line-clamp-2">
            {item.title}
          </h3>
          <StatusBadge status={item.status} />
        </div>

        {/* Description */}
        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
          {item.description}
        </p>

        {/* Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <MapPin className="w-4 h-4 shrink-0" />
            <span className="truncate">{item.location}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Calendar className="w-4 h-4 shrink-0" />
            <span>Found {formatDateDistance(item.date_found)} ago</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <User className="w-4 h-4 shrink-0" />
            <span className="truncate">
              Found by {item.profile?.name || "Anonymous"}
            </span>
          </div>
        </div>

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="flex gap-1 flex-wrap">
              {item.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md"
                >
                  {tag}
                </span>
              ))}
              {item.tags.length > 3 && (
                <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md">
                  +{item.tags.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="text-sm font-medium text-green-600 dark:text-green-400">
            {item.category}
          </div>
          <div className="flex items-center gap-1 text-muted-foreground text-sm">
            <Eye className="w-4 h-4" />
            <span>{item.views || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
