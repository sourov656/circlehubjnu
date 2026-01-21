"use client";

import { useState } from "react";
import { Filter, ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterBarProps {
  categories: string[];
  locations: string[];
  onCategoryChange: (category: string) => void;
  onLocationChange: (location: string) => void;
  onDateRangeChange: (days: number) => void;
  onSortChange: (sort: string) => void;
  selectedCategory: string;
  selectedLocation: string;
  selectedDateRange: number;
  selectedSort: string;
}

export default function FilterBar({
  categories,
  locations,
  onCategoryChange,
  onLocationChange,
  onDateRangeChange,
  onSortChange,
  selectedCategory,
  selectedLocation,
  selectedDateRange,
  selectedSort,
}: FilterBarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const dateRangeOptions = [
    { label: "All time", value: "0" },
    { label: "Last 7 days", value: "7" },
    { label: "Last 14 days", value: "14" },
    { label: "Last 30 days", value: "30" },
  ];

  const sortOptions = [
    { label: "Newest first", value: "newest" },
    { label: "Oldest first", value: "oldest" },
    { label: "Highest reward", value: "reward-high" },
    { label: "Lowest reward", value: "reward-low" },
    { label: "Most viewed", value: "views" },
    { label: "Title A-Z", value: "title" },
  ];

  const hasActiveFilters =
    selectedCategory !== "all" ||
    selectedLocation !== "all" ||
    selectedDateRange !== 0;

  const clearFilters = () => {
    onCategoryChange("all");
    onLocationChange("all");
    onDateRangeChange(0);
    onSortChange("newest");
  };

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border p-4">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg text-foreground hover:bg-muted/80 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        {/* Filter Content */}
        <div className={`${isOpen ? "block" : "hidden"} lg:block flex-1`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Category
              </label>
              <Select value={selectedCategory} onValueChange={onCategoryChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Location
              </label>
              <Select value={selectedLocation} onValueChange={onLocationChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Date Range
              </label>
              <Select
                value={selectedDateRange.toString()}
                onValueChange={(value) => onDateRangeChange(Number(value))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All time" />
                </SelectTrigger>
                <SelectContent>
                  {dateRangeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Sort By
              </label>
              <Select value={selectedSort} onValueChange={onSortChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Newest first" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <div className="flex items-end lg:items-center">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
