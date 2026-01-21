"use client";

import { useState } from "react";
import {
  X,
  MapPin,
  Calendar,
  Eye,
  User,
  Tag,
  MessageCircle,
  Share2,
  Phone,
  Mail,
  CheckCircle,
} from "lucide-react";
import { FoundItemWithProfile } from "@/types/items.types";
import Image from "next/image";
import { useAuth } from "@/contexts/auth-context";
import useAxios from "@/hooks/use-axios";

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

const formatFullDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

interface ItemDetailModalProps {
  item: FoundItemWithProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onClaimSuccess?: () => void;
}

const StatusBadge = ({
  status,
}: {
  status: FoundItemWithProfile["status"];
}) => {
  const statusConfig: Record<
    string,
    {
      label: string;
      className: string;
      description: string;
    }
  > = {
    available: {
      label: "Available",
      className:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      description: "This item is still available for the owner to claim",
    },
    claimed: {
      label: "Claimed",
      className:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      description: "This item has been successfully claimed by its owner",
    },
    returned: {
      label: "Returned",
      className:
        "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
      description: "This item has been successfully returned to its owner",
    },
  };

  const config = statusConfig[status || "available"] || statusConfig.available;

  return (
    <div className="text-center">
      <span
        className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${config.className} mb-2`}
      >
        {config.label}
      </span>
      <p className="text-xs text-muted-foreground">{config.description}</p>
    </div>
  );
};

export default function ItemDetailModal({
  item,
  isOpen,
  onClose,
  onClaimSuccess,
}: ItemDetailModalProps) {
  const { user } = useAuth();
  const axios = useAxios();
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimMessage, setClaimMessage] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);
  const [hasClaimed, setHasClaimed] = useState(false);

  if (!isOpen || !item) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleClaimItem = async () => {
    if (!user) {
      alert("Please login to claim this item");
      return;
    }

    if (user.id === item.user_id) {
      alert("You cannot claim your own found item");
      return;
    }

    setShowClaimModal(true);
  };

  const handleSubmitClaim = async () => {
    if (!user || !item) return;

    setIsSubmittingClaim(true);

    try {
      const claimData: {
        found_item_id: string;
        message?: string;
        contact_info?: {
          phone?: string;
          email?: string;
          preferredContact?: string;
        };
      } = {
        found_item_id: item._id,
      };

      // Only add message if provided
      if (claimMessage && claimMessage.trim()) {
        claimData.message = claimMessage.trim();
      }

      // Only add contact_info if we have phone or email
      if (contactPhone || user.email) {
        claimData.contact_info = {
          preferredContact: contactPhone ? "phone" : "email",
        };

        if (contactPhone) {
          claimData.contact_info.phone = contactPhone;
        }

        if (user.email) {
          claimData.contact_info.email = user.email;
        }
      }

      const response = await axios.post("/api/claims", claimData);

      setHasClaimed(true);
      setShowClaimModal(false);
      setClaimMessage("");
      setContactPhone("");

      alert(
        response.data?.message ||
          "Claim submitted successfully! The finder will review your request.",
      );

      if (onClaimSuccess) {
        onClaimSuccess();
      }
    } catch (error) {
      console.error("Error submitting claim:", error);
      const err = error as {
        response?: { data?: { error?: string; details?: string } };
        message?: string;
      };
      const errorMessage =
        err?.response?.data?.error ||
        err?.response?.data?.details ||
        err?.message ||
        "Failed to submit claim. Please try again.";
      alert(errorMessage);
    } finally {
      setIsSubmittingClaim(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Found Item: ${item.title}`,
          text: `I found this item: ${item.title}. Location: ${item.location}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      } catch (error) {
        console.error("Error copying to clipboard:", error);
      }
    }
  };

  const contact = {
    email: item.profile?.email || null,
    phone: item.profile?.phone || null,
    name: item.profile?.name || "Unknown",
  };

  return (
    <div
      className="fixed inset-0 backdrop-blur-lg bg-black/20 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-card rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden border border-border shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-border">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {item.title}
            </h2>
            <div className="flex items-center gap-4 text-muted-foreground text-sm">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Found {formatDateDistance(item.date_found)} ago</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{item.views || 0} views</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={handleShare}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              title="Share this found item"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
            {/* Left Column - Image and Status */}
            <div className="lg:col-span-1">
              {item.image_url && (
                <div className="aspect-square overflow-hidden bg-muted rounded-lg mb-6">
                  <Image
                    src={item.image_url}
                    alt={item.title}
                    width={400}
                    height={400}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <StatusBadge status={item.status} />
            </div>

            {/* Right Column - Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <div>
                <h3 className="font-semibold text-foreground mb-3">
                  Description
                </h3>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {item.description}
                </p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Tag className="w-4 h-4 shrink-0" />
                    <div>
                      <span className="text-sm font-medium">Category</span>
                      <p className="text-foreground">{item.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <div>
                      <span className="text-sm font-medium">Found at</span>
                      <p className="text-foreground">{item.location}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4 shrink-0" />
                    <div>
                      <span className="text-sm font-medium">Date found</span>
                      <p className="text-foreground">
                        {formatFullDate(item.date_found)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="w-4 h-4 shrink-0" />
                    <div>
                      <span className="text-sm font-medium">Found by</span>
                      <p className="text-foreground">{contact.name}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Tags</h3>
                  <div className="flex gap-2 flex-wrap">
                    {item.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-muted text-muted-foreground text-sm rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Information or Claim Button */}
              {item.status === "available" && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 sm:p-6">
                  <h3 className="font-semibold text-foreground mb-3">
                    {user && user.id !== item.user_id
                      ? "Claim This Item"
                      : "Contact Finder"}
                  </h3>

                  {user && user.id !== item.user_id ? (
                    // Claim button for other users
                    <div className="text-center">
                      {!hasClaimed ? (
                        <>
                          <p className="text-muted-foreground mb-4">
                            Is this your item? Submit a claim request to the
                            finder.
                          </p>
                          <button
                            onClick={handleClaimItem}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl"
                          >
                            <CheckCircle className="w-5 h-5" />
                            Claim This Item
                          </button>
                        </>
                      ) : (
                        <div className="text-center">
                          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-lg mb-2">
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-medium">Claim Submitted</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            The finder will review your claim request
                          </p>
                        </div>
                      )}
                    </div>
                  ) : !showContactInfo ? (
                    // Contact info for item owner
                    <div className="text-center">
                      <p className="text-muted-foreground mb-4">
                        Is this your item? Contact the finder to claim it.
                      </p>
                      <button
                        onClick={() => setShowContactInfo(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Show Contact Information
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {contact.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-green-600" />
                          <a
                            href={`mailto:${contact.email}`}
                            className="text-green-600 hover:text-green-700 font-medium"
                          >
                            {contact.email}
                          </a>
                        </div>
                      )}
                      {contact.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-green-600" />
                          <a
                            href={`tel:${contact.phone}`}
                            className="text-green-600 hover:text-green-700 font-medium"
                          >
                            {contact.phone}
                          </a>
                        </div>
                      )}
                      {!contact.email && !contact.phone && (
                        <p className="text-muted-foreground">
                          No contact information available
                        </p>
                      )}
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                        Please be prepared to describe the item in detail to
                        verify ownership.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {item.status === "claimed" && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                  <h3 className="font-semibold text-foreground mb-2">
                    Item Claimed
                  </h3>
                  <p className="text-muted-foreground">
                    This item has been successfully returned to its owner.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Claim Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 backdrop-blur-lg bg-black/40 z-60 flex items-center justify-center p-4">
          <div className="bg-card rounded-lg max-w-md w-full border border-border shadow-xl">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border">
              <h3 className="text-xl font-bold text-foreground">
                Submit Claim Request
              </h3>
              <button
                onClick={() => setShowClaimModal(false)}
                className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Why do you think this is your item?
                </label>
                <textarea
                  value={claimMessage}
                  onChange={(e) => setClaimMessage(e.target.value)}
                  rows={4}
                  placeholder="Describe the item features, where you lost it, or any identifying marks..."
                  className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Contact Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+1234567890"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Providing a phone number helps the finder contact you faster
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> The finder will review your claim and
                  may contact you for verification. Be prepared to describe the
                  item in detail.
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 p-4 sm:p-6 border-t border-border">
              <button
                onClick={() => setShowClaimModal(false)}
                disabled={isSubmittingClaim}
                className="flex-1 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitClaim}
                disabled={isSubmittingClaim}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmittingClaim ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Submit Claim
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
