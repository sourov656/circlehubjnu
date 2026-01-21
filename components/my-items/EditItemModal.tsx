"use client";

import { LostItem, FoundItem, ShareItem } from "@/types/items.types";
import { X, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { DatePicker } from "@/components/ui/date-picker";
import { NumberInput } from "@/components/ui/number-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ItemFormData {
  title: string;
  description: string;
  category: string;
  location: string;
  tags: string;
  dateLost?: Date;
  rewardAmount?: string;
  dateFound?: Date;
  offerType?: string;
  condition?: string;
  price?: string;
}

interface UpdateData {
  title: string;
  description: string;
  category: string;
  location: string;
  tags: string[];
  dateLost?: string;
  rewardAmount?: number;
  dateFound?: string;
  offerType?: string;
  condition?: string;
  price?: number;
}

interface EditItemModalProps {
  item: LostItem | FoundItem | ShareItem | null;
  type: "lost" | "found" | "share";
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemId: string, updatedData: UpdateData) => Promise<void>;
}

export default function EditItemModal({
  item,
  type,
  isOpen,
  onClose,
  onSave,
}: EditItemModalProps) {
  const [formData, setFormData] = useState<ItemFormData>({
    title: "",
    description: "",
    category: "",
    location: "",
    tags: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (item && isOpen) {
      setFormData({
        title: item.title,
        description: item.description,
        category: item.category,
        location: item.location,
        tags: item.tags?.join(", ") || "",
        ...(type === "lost" && {
          dateLost: (item as LostItem).date_lost
            ? new Date((item as LostItem).date_lost)
            : undefined,
          rewardAmount: (item as LostItem).reward_amount?.toString() || "",
        }),
        ...(type === "found" && {
          dateFound: (item as FoundItem).date_found
            ? new Date((item as FoundItem).date_found)
            : undefined,
        }),
        ...(type === "share" && {
          offerType: (item as ShareItem).offer_type,
          condition: (item as ShareItem).condition,
          price: (item as ShareItem).price?.toString() || "",
        }),
      });
      setError(null);
    }
  }, [item, type, isOpen]);

  if (!isOpen || !item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      const updatedData: UpdateData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        tags: formData.tags
          ? formData.tags.split(",").map((tag: string) => tag.trim())
          : [],
      };

      if (type === "lost") {
        if (formData.dateLost) {
          updatedData.dateLost = formData.dateLost.toISOString();
        }
        if (formData.rewardAmount) {
          updatedData.rewardAmount = parseFloat(formData.rewardAmount);
        }
      } else if (type === "found") {
        if (formData.dateFound) {
          updatedData.dateFound = formData.dateFound.toISOString();
        }
      } else if (type === "share") {
        updatedData.offerType = formData.offerType;
        updatedData.condition = formData.condition;
        if (formData.offerType === "sale" && formData.price) {
          updatedData.price = parseFloat(formData.price);
        }
      }

      await onSave(item._id, updatedData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update item");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-card rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Close Button */}
          <button
            onClick={onClose}
            disabled={isSaving}
            className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors z-10 disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>

          {/* Content */}
          <div className="p-6">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Edit{" "}
              {type === "lost" ? "Lost" : type === "found" ? "Found" : "Share"}{" "}
              Item
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title || ""}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter item title"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description || ""}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter item description"
                />
              </div>

              {/* Category & Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category *
                  </label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="accessories">Accessories</SelectItem>
                      <SelectItem value="documents">Documents</SelectItem>
                      <SelectItem value="clothing">Clothing</SelectItem>
                      <SelectItem value="books">Books</SelectItem>
                      <SelectItem value="bags">Bags</SelectItem>
                      <SelectItem value="keys">Keys</SelectItem>
                      <SelectItem value="sports">Sports Equipment</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location || ""}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter location"
                  />
                </div>
              </div>

              {/* Conditional Fields */}
              {type === "lost" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Date Lost *
                    </label>
                    <DatePicker
                      date={formData.dateLost}
                      onDateChange={(date) =>
                        setFormData((prev) => ({ ...prev, dateLost: date }))
                      }
                      placeholder="Select date lost"
                      maxDate={new Date()}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Reward Amount (৳)
                    </label>
                    <NumberInput
                      value={formData.rewardAmount || ""}
                      onChange={(value, formatted) =>
                        setFormData((prev) => ({
                          ...prev,
                          rewardAmount: formatted,
                        }))
                      }
                      allowDecimal={true}
                      maxDecimals={2}
                      placeholder="Optional reward"
                    />
                  </div>
                </div>
              )}

              {type === "found" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date Found *
                  </label>
                  <DatePicker
                    date={formData.dateFound}
                    onDateChange={(date) =>
                      setFormData((prev) => ({ ...prev, dateFound: date }))
                    }
                    placeholder="Select date found"
                    maxDate={new Date()}
                  />
                </div>
              )}

              {type === "share" && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Offer Type *
                      </label>
                      <Select
                        value={formData.offerType}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, offerType: value }))
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select offer type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="free">Free</SelectItem>
                          <SelectItem value="sale">Sale</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Condition *
                      </label>
                      <Select
                        value={formData.condition}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, condition: value }))
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="like-new">Like New</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="fair">Fair</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {formData.offerType === "sale" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Price (৳) *
                      </label>
                      <NumberInput
                        value={formData.price || ""}
                        onChange={(value, formatted) =>
                          setFormData((prev) => ({ ...prev, price: formatted }))
                        }
                        allowDecimal={true}
                        maxDecimals={2}
                        placeholder="Enter price"
                      />
                    </div>
                  )}
                </>
              )}

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., blue, leather, important"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSaving}
                  className="px-6 py-2 border border-border rounded-lg text-gray-700 dark:text-gray-300 hover:bg-muted transition-colors duration-200 font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
