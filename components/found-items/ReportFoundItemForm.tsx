"use client";

import { useState } from "react";
import { X, Upload, Plus, Minus, Image as ImageIcon } from "lucide-react";
import { CATEGORIES, LOCATIONS } from "@/lib/mock-data/found-items";
import Image from "next/image";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ReportFoundItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    category: string;
    location: string;
    dateFound: string;
    imageUrl?: string;
    imageBase64?: string;
    tags?: string[];
  }) => Promise<void>;
}

export default function ReportFoundItemForm({
  isOpen,
  onClose,
  onSubmit,
}: ReportFoundItemFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    dateFound: undefined as Date | undefined,
    imageUrl: "",
    tags: [] as string[],
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [newTag, setNewTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.trim().length < 20) {
      newErrors.description = "Description must be at least 20 characters";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.location) {
      newErrors.location = "Location is required";
    }

    if (!formData.dateFound) {
      newErrors.dateFound = "Date found is required";
    } else if (formData.dateFound > new Date()) {
      newErrors.dateFound = "Date found cannot be in the future";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      let imageBase64 = "";
      if (imageFile) {
        const reader = new FileReader();
        imageBase64 = await new Promise<string>((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(imageFile);
        });
      }

      await onSubmit({
        ...formData,
        dateFound: formData.dateFound
          ? formData.dateFound.toISOString().split("T")[0]
          : "",
        imageBase64: imageBase64 || undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
      });

      // Reset form
      setFormData({
        title: "",
        description: "",
        category: "",
        location: "",
        dateFound: undefined,
        imageUrl: "",
        tags: [],
      });
      setImageFile(null);
      setImagePreview("");
      setNewTag("");
      setErrors({});
      onClose();
    } catch {
      // Error handled silently
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({
        ...prev,
        image: "Please select a valid image file",
      }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        image: "Image size should be less than 5MB",
      }));
      return;
    }

    setImageFile(file);
    setErrors((prev) => ({ ...prev, image: "" }));

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
    setFormData((prev) => ({ ...prev, imageUrl: "" }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div
      className="fixed inset-0 backdrop-blur-lg bg-black/20 z-50 flex items-center justify-center p-2 sm:p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-card rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden border border-border shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border">
          <h2 className="text-lg sm:text-2xl font-bold text-foreground">
            Report Found Item
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <form
            onSubmit={handleSubmit}
            className="p-4 sm:p-6 space-y-4 sm:space-y-6"
          >
            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Item Title *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="e.g., iPhone 15 Pro - Black"
                className={`w-full px-3 py-2 border rounded-md bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-success focus:border-transparent ${
                  errors.title ? "border-destructive" : "border-border"
                }`}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.title}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Description *
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={4}
                placeholder="Please describe the found item in detail..."
                className={`w-full px-3 py-2 border rounded-md bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-success focus:border-transparent ${
                  errors.description ? "border-destructive" : "border-border"
                }`}
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {formData.description.length}/500 characters (minimum 20
                required)
              </p>
              {errors.description && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.description}
                </p>
              )}
            </div>

            {/* Category and Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Category *
                </label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger
                    className={`h-12 w-full ${
                      errors.category ? "border-destructive" : ""
                    }`}
                  >
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.category}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Found at Location *
                </label>
                <Select
                  value={formData.location}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, location: value }))
                  }
                >
                  <SelectTrigger
                    className={`h-12 w-full ${
                      errors.location ? "border-destructive" : ""
                    }`}
                  >
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATIONS.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.location}
                  </p>
                )}
              </div>
            </div>

            {/* Date Found */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Date Found *
              </label>
              <DatePicker
                date={formData.dateFound}
                onDateChange={(date) =>
                  setFormData((prev) => ({ ...prev, dateFound: date }))
                }
                placeholder="Select date found"
                maxDate={new Date()}
                error={!!errors.dateFound}
                className={errors.dateFound ? "border-destructive" : ""}
              />
              {errors.dateFound && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.dateFound}
                </p>
              )}
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Item Image (Optional)
              </label>

              {!imagePreview ? (
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted transition-colors"
                  >
                    <Upload className="w-8 h-8 text-slate-400 mb-2" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Click to upload image
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                      PNG, JPG, JPEG (Max 5MB)
                    </span>
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="mt-2 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <ImageIcon className="w-4 h-4" />
                    <span>{imageFile?.name}</span>
                    <span className="text-slate-500">
                      ({(imageFile!.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                </div>
              )}

              {errors.image && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.image}
                </p>
              )}
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Adding an image helps the owner identify their item
              </p>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Tags (Optional)
              </label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Add a tag (e.g., black, phone, case)"
                    className="flex-1 px-3 py-2 border border-border rounded-md bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-success focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    disabled={!newTag.trim()}
                    className="px-3 py-2 bg-success text-success-foreground rounded-md hover:bg-success/90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {formData.tags.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-success/10 dark:bg-success/20 text-success text-sm rounded-md"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Tags help make your listing more searchable
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 p-4 sm:p-6 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-foreground border border-border rounded-md hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-2 bg-success hover:bg-success/90 disabled:opacity-50 text-success-foreground rounded-md font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              "Report Found Item"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
