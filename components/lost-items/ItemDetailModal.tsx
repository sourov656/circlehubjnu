"use client";

import { useState } from "react";
import {
  X,
  Calendar,
  MapPin,
  Eye,
  Clock,
  User,
  Mail,
  Phone,
  Tag,
} from "lucide-react";
import Image from "next/image";
import { LostItemWithProfile } from "@/types/items.types";

// Utility functions for date/time formatting
const getTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return "today";
  if (diffInDays === 1) return "yesterday";
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
  }
  if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return months === 1 ? "1 month ago" : `${months} months ago`;
  }
  const years = Math.floor(diffInDays / 365);
  return years === 1 ? "1 year ago" : `${years} years ago`;
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

interface ItemDetailModalProps {
  item: LostItemWithProfile | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ItemDetailModal({
  item,
  isOpen,
  onClose,
}: ItemDetailModalProps) {
  const [contactRevealed, setContactRevealed] = useState(false);

  if (!isOpen || !item) return null;

  const contact = {
    email: item.profile?.email || null,
    phone: item.profile?.phone || null,
    name: item.profile?.name || "Unknown",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 backdrop-blur-lg bg-black/20 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative w-full max-w-4xl bg-card rounded-lg shadow-xl border border-border">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <MapPin className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  Lost Item Details
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Posted {getTimeAgo(item.created_at || "")}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Image */}
              {item.image_url && (
                <div className="aspect-video w-full overflow-hidden rounded-lg border border-border">
                  <Image
                    src={item.image_url}
                    alt={item.title}
                    width={600}
                    height={400}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Main Info */}
              <div
                className={`space-y-4 ${
                  !item.image_url ? "lg:col-span-2" : ""
                }`}
              >
                <div>
                  <h1 className="text-2xl font-bold text-foreground mb-2">
                    {item.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-muted text-foreground rounded-full">
                      {item.category}
                    </span>
                    <span
                      className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${
                        item.status === "active"
                          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                          : item.status === "found"
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                            : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                      }`}
                    >
                      {item.status
                        ? item.status.charAt(0).toUpperCase() +
                          item.status.slice(1)
                        : "Unknown"}
                    </span>
                  </div>
                </div>

                <div className="text-muted-foreground leading-relaxed">
                  {item.description}
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-slate-500 dark:text-slate-400 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Location
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.location}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-slate-500 dark:text-slate-400 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Date Lost
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(item.date_lost)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Eye className="w-5 h-5 text-slate-500 dark:text-slate-400 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Views
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.views} views
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-slate-500 dark:text-slate-400 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Posted
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(item.created_at || "")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {item.tags && item.tags.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {item.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-block px-2 py-1 text-sm bg-muted text-muted-foreground rounded-md"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Reporter Info & Contact */}
            <div className="border-t border-border pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                    {item.profile?.avatar_url ? (
                      <Image
                        src={item.profile.avatar_url}
                        alt={item.profile.name}
                        width={48}
                        height={48}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>

                  <div>
                    <h3 className="font-medium text-foreground">
                      Reported by {contact.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Posted {getTimeAgo(item.created_at || "")} •{" "}
                      {item.views || 0} views
                    </p>

                    {/* Contact Info */}
                    {!contactRevealed ? (
                      <button
                        onClick={() => setContactRevealed(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                      >
                        <Mail className="w-4 h-4" />
                        Show Contact Information
                      </button>
                    ) : (
                      <div className="space-y-2">
                        {contact.email && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-4 h-4 text-slate-500" />
                            <a
                              href={`mailto:${contact.email}`}
                              className="text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              {contact.email}
                            </a>
                          </div>
                        )}
                        {contact.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-slate-500" />
                            <a
                              href={`tel:${contact.phone}`}
                              className="text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              {contact.phone}
                            </a>
                          </div>
                        )}
                        {!contact.email && !contact.phone && (
                          <div className="text-sm text-muted-foreground">
                            No contact information available
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
