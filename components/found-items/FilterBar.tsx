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
  const dateRangeOptions = [
    { label: "All time", value: "0" },
    { label: "Last 7 days", value: "7" },
    { label: "Last 30 days", value: "30" },
    { label: "Last 90 days", value: "90" },
  ];

  const sortOptions = [
    { label: "Newest first", value: "newest" },
    { label: "Oldest first", value: "oldest" },
    { label: "Most viewed", value: "most-viewed" },
    { label: "Least viewed", value: "least-viewed" },
    { label: "Title A-Z", value: "title-a-z" },
    { label: "Title Z-A", value: "title-z-a" },
  ];

  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-muted-foreground" />
        <h3 className="font-medium text-foreground">Filters</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            Date Found
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

        {/* Sort */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Sort by
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
  );
}
