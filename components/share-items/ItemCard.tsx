"use client";

import { Calendar, MapPin, User, DollarSign } from "lucide-react";
import Image from "next/image";
import { ShareItemWithProfile } from "@/types/items.types";

interface ItemCardProps {
  item: ShareItemWithProfile;
  onClick: () => void;
  viewMode?: "grid" | "list";
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getConditionColor = (condition: string) => {
  switch (condition) {
    case "new":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "like-new":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    case "good":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "fair":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
    case "poor":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
  }
};

const getOfferTypeColor = (offerType: string) => {
  switch (offerType) {
    case "free":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "exchange":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    case "rent":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
    case "sale":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
  }
};

export default function ItemCard({
  item,
  onClick,
  viewMode = "grid",
}: ItemCardProps) {
  if (viewMode === "list") {
    return (
      <div
        className="bg-card rounded-lg shadow-sm border border-border overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.01]"
        onClick={onClick}
      >
        <div className="flex flex-col sm:flex-row">
          {/* Image */}
          <div className="relative h-48 sm:h-auto sm:w-48 shrink-0">
            <Image
              src={item.image_url || "/placeholder-image.jpg"}
              alt={item.title}
              fill
              className="object-cover"
            />
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex flex-wrap gap-1 sm:gap-2">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getOfferTypeColor(
                  item.offer_type
                )}`}
              >
                {item.offer_type.charAt(0).toUpperCase() +
                  item.offer_type.slice(1)}
              </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getConditionColor(
                  item.condition
                )}`}
              >
                {item.condition
                  .split("-")
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(" ")}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 sm:p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                    {item.category.charAt(0).toUpperCase() +
                      item.category.slice(1)}
                  </span>
                  {item.status === "available" && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      Available
                    </span>
                  )}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
                  {item.title}
                </h3>
                {item.offer_type === "sale" && item.price && (
                  <div className="flex items-center gap-1 mb-2 text-yellow-600 dark:text-yellow-400 font-semibold text-base sm:text-lg">
                    <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>৳{item.price}</span>
                  </div>
                )}
              </div>
            </div>

            <p className="text-foreground text-sm  sm:text-base mb-4 line-clamp-2">
              {item.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-3">
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="truncate">{item.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="truncate">
                  {item.profile?.name || "Anonymous"}
                </span>
              </div>
              <div className="flex items-center gap-1 sm:col-span-2">
                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span>
                  Posted{" "}
                  {item.created_at ? formatDate(item.created_at) : "Unknown"}
                </span>
              </div>
            </div>

            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {item.tags.slice(0, 4).map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-muted text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
                {item.tags.length > 4 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-muted text-muted-foreground">
                    +{item.tags.length - 4}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-card rounded-lg shadow-sm border border-border overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] h-fit break-inside-avoid mb-3 sm:mb-4"
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative h-40 sm:h-48 w-full">
        <Image
          src={item.image_url || "/placeholder-image.jpg"}
          alt={item.title}
          fill
          className="object-cover"
        />
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex flex-wrap gap-1 sm:gap-2 max-w-[calc(100%-1rem)]">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getOfferTypeColor(
              item.offer_type
            )}`}
          >
            {item.offer_type.charAt(0).toUpperCase() + item.offer_type.slice(1)}
          </span>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getConditionColor(
              item.condition
            )}`}
          >
            {item.condition
              .split("-")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" ")}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4">
        {/* Category and Status */}
        <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
            {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
          </span>
          {item.status === "available" && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
              Available
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2 line-clamp-2">
          {item.title}
        </h3>

        {/* Price (if sale) */}
        {item.offer_type === "sale" && item.price && (
          <div className="flex items-center gap-1 mb-2 text-yellow-600 dark:text-yellow-400 font-semibold text-sm sm:text-base">
            <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>৳{item.price}</span>
          </div>
        )}

        {/* Description */}
        <p className="text-foreground text-xs sm:text-sm mb-3 line-clamp-2 sm:line-clamp-3">
          {item.description}
        </p>

        {/* Details */}
        <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">{item.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">
              {item.profile?.name || "Anonymous"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>
              Posted {item.created_at ? formatDate(item.created_at) : "Unknown"}
            </span>
          </div>
        </div>

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {item.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-0.5 sm:py-1 rounded-md text-xs bg-muted text-muted-foreground"
              >
                {tag}
              </span>
            ))}
            {item.tags.length > 3 && (
              <span className="inline-flex items-center px-2 py-0.5 sm:py-1 rounded-md text-xs bg-muted text-muted-foreground">
                +{item.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
