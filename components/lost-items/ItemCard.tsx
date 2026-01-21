"use client";

import Image from "next/image";
import { Calendar, MapPin, Eye, Clock, User } from "lucide-react";
import { LostItemWithProfile } from "@/types/items.types";

interface ItemCardProps {
  item: LostItemWithProfile;
  onClick: (item: LostItemWithProfile) => void;
}

export default function ItemCard({ item, onClick }: ItemCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMilliseconds = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "1 day ago";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  return (
    <div
      className="bg-card rounded-lg shadow-sm border border-border overflow-hidden hover:shadow-md hover:border-border transition-all duration-200 cursor-pointer group h-fit"
      onClick={() => onClick(item)}
    >
      {/* Image */}
      {item.image_url && (
        <div className="aspect-video w-full overflow-hidden">
          <Image
            src={item.image_url}
            alt={item.title}
            width={400}
            height={200}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        </div>
      )}

      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
              {item.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-muted text-foreground rounded-full">
                {item.category}
              </span>
              {item.reward_amount && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                  ৳{item.reward_amount}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end text-xs text-muted-foreground">
            <span>{getTimeAgo(item.created_at)}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-muted-foreground text-sm line-clamp-2">
          {item.description}
        </p>

        {/* Details */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4 shrink-0" />
            <span className="truncate">{item.location}</span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4 shrink-0" />
            <span className="truncate">{formatDate(item.date_lost)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <User className="w-3 h-3" />
              <span>{item.profile?.name || "Anonymous"}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{item.views || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{formatDate(item.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-block px-2 py-1 text-xs bg-muted text-muted-foreground rounded"
              >
                #{tag}
              </span>
            ))}
            {item.tags.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{item.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
