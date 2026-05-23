"use client";
import React from "react";
import { trackEvent } from "../../utils/analytics";
import "./SearchBar.css";

export const SITES = [
  "daraz",
  "startech",
  "pickaboo",
  "computervillage",
  "gadgetngear", // ← was gadgetandgear
  "selltech",
  "ultratech",
  "creatus",
  "sumashtech",
  "nexus",
  // "bdstall",        // ← removed, no live scraper
];

const POPULAR_SEARCHES = [
  "Redmi Note 15 Pro",
  "iPhone 17",
  "Gaming Laptop",
  "RTX 4060",
  "AirPods",
];

export const SITE_LABELS: Record<string, string> = {
  daraz: "Daraz",
  startech: "StarTech",
  pickaboo: "Pickaboo",
  computervillage: "Computer Village",
  gadgetngear: "Gadget & Gear", // ← was gadgetandgear
  selltech: "Sell Tech BD",
  ultratech: "Ultra Technology",
  creatus: "Creatus Computer",
  sumashtech: "Sumash Tech", // ← add
};

interface SearchBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
  onSearchWithQuery: (query: string) => void;
  onCancel?: () => void;
  isLoading: boolean;
  loadingSites: string[];
  totalCount: number;
  filteredCount: number;
  hiddenCount: number;
  storesCount: number;
}

function SearchBar({
  search,
  onSearchChange,
  onSearch,
  onSearchWithQuery,
  onCancel,
  isLoading,
  loadingSites,
  totalCount,
  filteredCount,
  hiddenCount,
  storesCount,
}: SearchBarProps) {
  const handleSearch = () => {
    if (search.trim()) {
      trackEvent("search", {
        search_term: search.trim(),
        stores_searched: SITES.length,
      });
    }
    onSearch();
  };

  // ✅ Fix: chip click sets input value then triggers search
  const handleChipClick = (term: string) => {
    onSearchChange(term); // updates input display
    onSearchWithQuery(term); // ✅ bypasses stale state entirely
    trackEvent("search", {
      search_term: term,
      stores_searched: SITES.length,
      source: "popular_chip",
    });
  };

  const handleCancel = () => {
    trackEvent("search_cancelled", {
      search_term: search.trim(),
      sites_remaining: loadingSites.length,
    });
    onCancel?.();
  };

  return (
    <div className="search-bar-container">
      <div className="search-bar-content">
        <div className="search-input-wrapper">
          <svg
            className="search-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search products across multiple stores..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />

          {/* Cancel button replaces Search button while loading */}
          {isLoading ? (
            <button className="cancel-button" onClick={handleCancel}>
              ✕ Cancel
            </button>
          ) : (
            <button
              className="search-button"
              onClick={handleSearch}
              disabled={!search.trim()}
            >
              Search
            </button>
          )}
        </div>

        {/* ✅ Fix: chips OUTSIDE the input wrapper, only show when not loading */}
        {!isLoading && (
          <div className="popular-searches">
            <span className="popular-label">Popular:</span>
            {POPULAR_SEARCHES.map((term) => (
              <button
                key={term}
                onClick={() => handleChipClick(term)}
                className="popular-chip"
              >
                {term}
              </button>
            ))}
          </div>
        )}

        {isLoading && (
          <div className="loading-sites">
            {SITES.map((site) => (
              <span
                key={site}
                className={`site-badge ${loadingSites.includes(site) ? "loading" : "done"}`}
              >
                {loadingSites.includes(site) ? "⏳" : "✅"} {SITE_LABELS[site]}
              </span>
            ))}
          </div>
        )}

        {totalCount > 0 && (
          <p className="search-results-text">
            {filteredCount} of {totalCount} results
            {storesCount > 0 ? ` across ${storesCount} stores` : ""}
            {isLoading && " — still loading more..."}
            {hiddenCount > 0 && (
              <span style={{ color: "#f59e0b", marginLeft: 6 }}>
                · {hiddenCount} hidden by price filter
              </span>
            )}
          </p>
        )}
      </div>
    </div>
  );
}

export default SearchBar;
