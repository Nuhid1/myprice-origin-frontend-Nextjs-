import React from "react";
import "./StoreFilter.css";

interface StoreFilterProps {
  availableSources: string[];
  selectedSources: string[];
  onToggle: (source: string) => void;
  onReset: () => void;
}

const STORE_LABELS: Record<string, string> = {
  daraz: "Daraz",
  pickaboo: "Pickaboo",
  startech: "StarTech",
  computervillage: "Computer Village",
  gadgetngear: "Gadget & Gear",
  selltech: "Sell Tech BD",
  ultratech: "Ultra Technology",
  creatus: "Creatus Computer",
  sumashtech: "Sumash Tech",
  bdstall: "BDStall",
};

function StoreFilter({
  availableSources,
  selectedSources,
  onToggle,
  onReset,
}: StoreFilterProps) {
  const isActive = selectedSources.length > 0;

  return (
    <div className="filter-section">
      <div className="filter-section-header">
        <span className="filter-section-title">🏪 Store</span>
        {isActive && (
          <button className="filter-reset-link" onClick={onReset}>
            Reset
          </button>
        )}
      </div>
      <div className="store-filter-list">
        {availableSources.map((source) => (
          <label key={source} className="store-filter-item">
            <input
              type="checkbox"
              className="store-filter-checkbox"
              checked={selectedSources.includes(source)}
              onChange={() => onToggle(source)}
            />
            <span className="store-filter-name">
              {STORE_LABELS[source] ?? source}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default StoreFilter;
