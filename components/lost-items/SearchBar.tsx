"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchBar({
  onSearch,
  placeholder = "Search lost items...",
  className = "",
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearch(value);
  };

  const clearSearch = () => {
    setQuery("");
    onSearch("");
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className={`relative transition-all duration-200 ${
          isFocused ? "ring-2 ring-blue-500" : "ring-1 ring-border"
        } rounded-lg bg-card`}
      >
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 bg-transparent text-foreground placeholder-muted-foreground focus:outline-none rounded-lg"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {query && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card rounded-lg shadow-lg border border-border z-10">
          <div className="p-3 text-sm text-muted-foreground">
            Searching for:{" "}
            <span className="font-medium text-foreground">
              &ldquo;{query}&rdquo;
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
