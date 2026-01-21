"use client";

import {
  X,
  Calendar,
  MapPin,
  User,
  Phone,
  Mail,
  DollarSign,
} from "lucide-react";
import Image from "next/image";
import { ShareItemWithProfile } from "@/types/items.types";

interface ItemDetailModalProps {
  item: ShareItemWithProfile | null;
  isOpen: boolean;
  onClose: () => void;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "long",
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

export default function ItemDetailModal({
  item,
  isOpen,
  onClose,
}: ItemDetailModalProps) {
  if (!isOpen || !item) return null;

  const contact = {
    email: item.profile?.email || null,
    phone: item.profile?.phone || null,
    name: item.profile?.name || "Anonymous",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-2 sm:p-4">
        <div
          className="fixed inset-0 backdrop-blur-lg bg-black/20"
          onClick={onClose}
        />

        <div className="relative bg-card rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-border">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground">
              Item Details
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6">
            {/* Image */}
            <div className="relative h-48 sm:h-64 w-full mb-4 sm:mb-6 rounded-lg overflow-hidden">
              <Image
                src={item.image_url || "/placeholder-image.jpg"}
                alt={item.title}
                fill
                className="object-cover"
              />
            </div>

            {/* Title and Category */}
            <div className="mb-4">
              <div className="flex items-start sm:items-center justify-between mb-2 flex-col sm:flex-row gap-2">
                <span className="inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                  {item.category.charAt(0).toUpperCase() +
                    item.category.slice(1)}
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getConditionColor(
                      item.condition
                    )}`}
                  >
                    {item.condition
                      .split("-")
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(" ")}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getOfferTypeColor(
                      item.offer_type
                    )}`}
                  >
                    {item.offer_type.charAt(0).toUpperCase() +
                      item.offer_type.slice(1)}
                  </span>
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                {item.title}
              </h3>
              {item.offer_type === "sale" && item.price && (
                <div className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
                  <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span>৳{item.price}</span>
                </div>
              )}
              {item.status === "available" && (
                <span className="inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  Available
                </span>
              )}
            </div>

            {/* Description */}
            <div className="mb-4 sm:mb-6">
              <h4 className="text-base sm:text-lg font-semibold text-foreground mb-2">
                Description
              </h4>
              <p className="text-sm sm:text-base text-foreground leading-relaxed">
                {item.description}
              </p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
              <div>
                <h4 className="text-base sm:text-lg font-semibold text-foreground mb-2 sm:mb-3">
                  Item Information
                </h4>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-2 text-sm sm:text-base text-foreground">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                    <span className="break-all">{item.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm sm:text-base text-foreground">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                    <span>
                      Posted{" "}
                      {item.created_at
                        ? formatDate(item.created_at)
                        : "Unknown"}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-base sm:text-lg font-semibold text-foreground mb-2 sm:mb-3">
                  Contact Information
                </h4>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-2 text-sm sm:text-base text-foreground">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                    <span className="break-all">{contact.name}</span>
                  </div>
                  {contact.email && (
                    <div className="flex items-center gap-2 text-sm sm:text-base text-foreground">
                      <Mail className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                      <a
                        href={`mailto:${contact.email}`}
                        className="text-yellow-600 hover:text-yellow-700 font-medium break-all"
                      >
                        {contact.email}
                      </a>
                    </div>
                  )}
                  {contact.phone && (
                    <div className="flex items-center gap-2 text-sm sm:text-base text-foreground">
                      <Phone className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                      <a
                        href={`tel:${contact.phone}`}
                        className="text-yellow-600 hover:text-yellow-700 font-medium"
                      >
                        {contact.phone}
                      </a>
                    </div>
                  )}
                  {!contact.email && !contact.phone && (
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      No contact information available
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <div className="mb-4 sm:mb-6">
                <h4 className="text-base sm:text-lg font-semibold text-foreground mb-2 sm:mb-3">
                  Tags
                </h4>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {item.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 sm:px-3 py-1 rounded-md text-xs sm:text-sm bg-muted text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 border-t border-border">
              <button className="w-full sm:flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base">
                Contact Sharer
              </button>
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 border border-border text-muted-foreground rounded-lg font-medium hover:bg-muted transition-colors text-sm sm:text-base"
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
