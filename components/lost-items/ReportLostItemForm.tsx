"use client";

import { useState } from "react";
import { Plus, X, Image as ImageIcon, Upload } from "lucide-react";
import { CATEGORIES, LOCATIONS } from "@/lib/mock-data/lost-items";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";

interface LostItemFormData {
  title: string;
  description: string;
  category: string;
  location: string;
  dateLost: string;
  imageUrl?: string;
  imageBase64?: string;
  tags?: string[];
}

interface ReportLostItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: LostItemFormData) => void;
}

export default function ReportLostItemForm({
  isOpen,
  onClose,
  onSubmit,
}: ReportLostItemFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    dateLost: undefined as Date | undefined,
    imageUrl: "",
    tags: [] as string[],
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [currentTag, setCurrentTag] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleInputChange = (
    field: string,
    value: string | Date | undefined | null
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const addTag = () => {
    if (
      currentTag.trim() &&
      !formData.tags.includes(currentTag.trim().toLowerCase())
    ) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim().toLowerCase()],
      }));
      setCurrentTag("");
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

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({
        ...prev,
        image: "Please select a valid image file",
      }));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        image: "Image size should be less than 5MB",
      }));
      return;
    }

    setImageFile(file);
    setErrors((prev) => ({ ...prev, image: "" }));

    // Create preview
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.location) newErrors.location = "Location is required";
    if (!formData.dateLost) newErrors.dateLost = "Date lost is required";

    // Validate date is not in the future
    if (formData.dateLost && formData.dateLost > new Date()) {
      newErrors.dateLost = "Date lost cannot be in the future";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Convert image to base64 if present
      let imageBase64 = "";
      if (imageFile) {
        const reader = new FileReader();
        imageBase64 = await new Promise<string>((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(imageFile);
        });
      }

      const submitData = {
        ...formData,
        dateLost: formData.dateLost
          ? formData.dateLost.toISOString().split("T")[0]
          : "",
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        imageBase64: imageBase64 || undefined,
      };

      await onSubmit(submitData);

      // Reset form
      setFormData({
        title: "",
        description: "",
        category: "",
        location: "",
        dateLost: undefined,

        imageUrl: "",
        tags: [],
      });
      setImageFile(null);
      setImagePreview("");
      setCurrentTag("");
      setErrors({});
      onClose();
    } catch {
      // Error handled silently
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && currentTag.trim()) {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-2 sm:p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 backdrop-blur-lg bg-black/20 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative w-full max-w-2xl bg-card rounded-lg shadow-xl border border-border">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-destructive/10 dark:bg-destructive/20 rounded-full flex items-center justify-center">
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-destructive" />
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-foreground">
                Report Lost Item
              </h2>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Form Container */}
          <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
            <form
              onSubmit={handleSubmit}
              className="p-4 sm:p-6 space-y-4 sm:space-y-6"
            >
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Item Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="e.g., iPhone 14 Pro Max - Space Black"
                  className={`w-full px-4 py-3 border rounded-lg bg-card text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.title ? "border-red-500" : "border-border"
                  }`}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Category and Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Category *
                  </label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      handleInputChange("category", value)
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
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Location Lost *
                  </label>
                  <Select
                    value={formData.location}
                    onValueChange={(value) =>
                      handleInputChange("location", value)
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

              {/* Date Lost */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Date Lost *
                </label>
                <DatePicker
                  date={formData.dateLost}
                  onDateChange={(date) => handleInputChange("dateLost", date)}
                  placeholder="Select date lost"
                  maxDate={new Date()}
                  error={!!errors.dateLost}
                  className={errors.dateLost ? "border-destructive" : ""}
                />
                {errors.dateLost && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.dateLost}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  rows={4}
                  placeholder="Provide detailed description of the item, where you think you lost it, distinctive features, etc."
                  className={`w-full px-4 py-3 border rounded-lg bg-card text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent resize-none ${
                    errors.description ? "border-destructive" : "border-border"
                  }`}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Contact Information */}
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
                      <span className="text-sm text-muted-foreground">
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
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
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
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="e.g., black, phone, leather-case"
                      className="flex-1 px-4 py-2 border border-border rounded-lg bg-card text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      disabled={!currentTag.trim()}
                      className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Add
                    </button>
                  </div>

                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-destructive/10 dark:bg-destructive/20 text-destructive rounded-full text-sm"
                        >
                          #{tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="hover:text-blue-900 dark:hover:text-blue-200"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Tags help people find your item more easily
                </p>
              </div>
            </form>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 p-4 sm:p-6 border-t border-border bg-card">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 border border-border text-foreground rounded-lg hover:bg-muted font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Reporting...
                </>
              ) : (
                "Report Lost Item"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
