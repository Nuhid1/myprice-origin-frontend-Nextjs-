"use client";
import React from "react";
import PriceFilter from "./filters/PriceFilter";
import StoreFilter from "./filters/StoreFilter";
import WishlistButton from "./WishlistButton/WishlistButton";
import "./FilterSidebar.css";

interface FilterSidebarProps {
  priceLow: number;
  priceHigh: number;
  filterMin: number;
  filterMax: number;
  onApplyPrice: (min: number, max: number) => void;
  onResetPrice: () => void;
  availableSources: string[];
  selectedSources: string[];
  onToggleSource: (source: string) => void;
  onResetSources: () => void;
  wishlistCount: number;
  onWishlistOpen: () => void;
  mobileOpen?: boolean;
}

function FilterSidebar({
  priceLow,
  priceHigh,
  filterMin,
  filterMax,
  onApplyPrice,
  onResetPrice,
  availableSources,
  selectedSources,
  onToggleSource,
  onResetSources,
  wishlistCount,
  onWishlistOpen,
  mobileOpen,
}: FilterSidebarProps) {
  return (
    <aside className={`filter-sidebar ${mobileOpen ? "mobile-open" : ""}`}>
      <div className="filter-sidebar-inner">
        <WishlistButton count={wishlistCount} onClick={onWishlistOpen} />

        <StoreFilter
          availableSources={availableSources}
          selectedSources={selectedSources}
          onToggle={onToggleSource}
          onReset={onResetSources}
        />

        <PriceFilter
          priceLow={priceLow}
          priceHigh={priceHigh}
          filterMin={filterMin}
          filterMax={filterMax}
          onApply={onApplyPrice}
          onReset={onResetPrice}
        />
      </div>
    </aside>
  );
}

export default FilterSidebar;
