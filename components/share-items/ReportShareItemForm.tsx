"use client";

import { useState } from "react";
import { X, Upload, Plus, ImageIcon } from "lucide-react";
import { CreateShareItemRequest } from "@/types/items.types";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NumberInput } from "@/components/ui/number-input";

interface ReportShareItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (itemData: CreateShareItemRequest) => void;
}

export default function ReportShareItemForm({
  isOpen,
  onClose,
  onSubmit,
}: ReportShareItemFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    condition: "good" as "new" | "like-new" | "good" | "fair" | "poor",
    offerType: "free" as "free" | "exchange" | "rent" | "sale",
    price: "",
    location: "",
    tags: [""],
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const categories = [
    { value: "electronics", label: "Electronics" },
    { value: "clothing", label: "Clothing" },
    { value: "accessories", label: "Accessories" },
    { value: "documents", label: "Documents" },
    { value: "books", label: "Books" },
    { value: "keys", label: "Keys" },
    { value: "bags", label: "Bags" },
    { value: "sports", label: "Sports" },
    { value: "jewelry", label: "Jewelry" },
    { value: "others", label: "Others" },
  ];

  const conditions = [
    { value: "new", label: "New" },
    { value: "like-new", label: "Like New" },
    { value: "good", label: "Good" },
    { value: "fair", label: "Fair" },
    { value: "poor", label: "Poor" },
  ];

  const offerTypes = [
    { value: "free", label: "Free" },
    { value: "exchange", label: "Exchange" },
    { value: "rent", label: "Rent" },
    { value: "sale", label: "Sale" },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size must be less than 5MB");
        return;
      }

      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Convert image to base64 if present
    let imageBase64: string | undefined;
    if (imageFile) {
      const reader = new FileReader();
      imageBase64 = await new Promise((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(imageFile);
      });
    }

    const shareItemData: CreateShareItemRequest = {
      title: formData.title,
      description: formData.description,
      category: formData.category as any,
      condition: formData.condition,
      offerType: formData.offerType,
      price:
        formData.offerType === "sale" && formData.price
          ? Number(formData.price)
          : null,
      location: formData.location,
      imageBase64,
      tags: formData.tags.filter((tag) => tag.trim() !== ""),
    };

    onSubmit(shareItemData);

    // Reset form
    setFormData({
      title: "",
      description: "",
      category: "",
      condition: "good",
      offerType: "free",
      price: "",
      location: "",
      tags: [""],
    });
    setImageFile(null);
    setImagePreview(null);
  };

  const handleTagChange = (index: number, value: string) => {
    const newTags = [...formData.tags];
    newTags[index] = value;
    setFormData({ ...formData, tags: newTags });
  };

  const addTag = () => {
    setFormData({ ...formData, tags: [...formData.tags, ""] });
  };

  const removeTag = (index: number) => {
    const newTags = formData.tags.filter((_, i) => i !== index);
    setFormData({ ...formData, tags: newTags });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(e);
    }
  };

  if (!isOpen) return null;

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
              Share an Item
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="p-4 sm:p-6 space-y-4 sm:space-y-6"
          >
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">
                Basic Information
              </h3>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Item Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-secondary focus:border-transparent"
                  placeholder="e.g., Engineering Textbooks Set"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description *
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-secondary focus:border-transparent"
                  placeholder="Describe the item you want to share..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Category *
                  </label>
                  <Select
                    required
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Condition *
                  </label>
                  <Select
                    value={formData.condition}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        condition: value as any,
                      })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {conditions.map((condition) => (
                        <SelectItem
                          key={condition.value}
                          value={condition.value}
                        >
                          {condition.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Offer Type *
                  </label>
                  <Select
                    value={formData.offerType}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        offerType: value as any,
                      })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {offerTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.offerType === "sale" && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Price (৳) *
                    </label>
                    <NumberInput
                      required={formData.offerType === "sale"}
                      value={formData.price}
                      onChange={(value, formatted) =>
                        setFormData({ ...formData, price: formatted })
                      }
                      allowDecimal={true}
                      maxDecimals={2}
                      className="w-full"
                      placeholder="Enter price"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-secondary focus:border-transparent"
                  placeholder="e.g., Engineering Block A, Room 201"
                />
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Item Image
              </label>
              {imagePreview ? (
                <div className="relative">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    width={400}
                    height={300}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <ImageIcon className="mx-auto h-12 w-12 text-slate-400" />
                  <div className="mt-2">
                    <label className="cursor-pointer">
                      <span className="text-sm text-secondary dark:text-secondary hover:text-secondary/90">
                        Upload an image
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Tags
              </label>
              <div className="space-y-2">
                {formData.tags.map((tag, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => handleTagChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-secondary focus:border-transparent"
                      placeholder="Enter a tag"
                    />
                    {formData.tags.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTag(index)}
                        className="px-3 py-2 text-red-600 hover:text-red-700 dark:text-red-400"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addTag}
                  className="flex items-center gap-1 text-sm text-secondary hover:text-secondary/90 dark:text-secondary"
                >
                  <Plus className="w-4 h-4" />
                  Add Tag
                </button>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
              <button
                type="submit"
                className="w-full sm:flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Share Item
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-3 border border-border text-muted-foreground rounded-lg font-medium hover:bg-muted transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
