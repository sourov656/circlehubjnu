"use client";

import { Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterBarProps {
  selectedCategory: string;
  selectedCondition: string;
  selectedOfferType: string;
  onCategoryChange: (category: string) => void;
  onConditionChange: (condition: string) => void;
  onOfferTypeChange: (offerType: string) => void;
}

const categories = [
  "All Categories",
  "Books",
  "Electronics",
  "Clothing",
  "Furniture",
  "Kitchen",
  "Sports",
  "Art",
  "Other",
];

const conditions = [
  { value: "all", label: "Any Condition" },
  { value: "new", label: "New" },
  { value: "like-new", label: "Like New" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "poor", label: "Poor" },
];

const offerTypes = [
  { value: "all", label: "All Offers" },
  { value: "free", label: "Free" },
  { value: "exchange", label: "Exchange" },
  { value: "rent", label: "Rent" },
  { value: "sale", label: "For Sale" },
];

export default function FilterBar({
  selectedCategory,
  selectedCondition,
  selectedOfferType,
  onCategoryChange,
  onConditionChange,
  onOfferTypeChange,
}: FilterBarProps) {
  return (
    <div className="bg-card rounded-lg shadow-sm border border-border p-3 sm:p-4">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
        <span className="text-sm sm:text-base font-medium text-slate-700 dark:text-slate-300">
          Filters
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Category Filter */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 sm:mb-2">
            Category
          </label>
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Condition Filter */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 sm:mb-2">
            Condition
          </label>
          <Select value={selectedCondition} onValueChange={onConditionChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent>
              {conditions.map((condition) => (
                <SelectItem key={condition.value} value={condition.value}>
                  {condition.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Offer Type Filter */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 sm:mb-2">
            Offer Type
          </label>
          <Select value={selectedOfferType} onValueChange={onOfferTypeChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select offer type" />
            </SelectTrigger>
            <SelectContent>
              {offerTypes.map((offer) => (
                <SelectItem key={offer.value} value={offer.value}>
                  {offer.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
