import React, { useState, useEffect } from "react";
import "./PriceFilter.css";

const PRESETS = [
  { label: "Under ৳500", min: 0, max: 500 },
  { label: "৳500–2K", min: 500, max: 2000 },
  { label: "৳2K–5K", min: 2000, max: 5000 },
  { label: "৳5K–15K", min: 5000, max: 15000 },
  { label: "Over ৳15K", min: 15000, max: 0 },
];

interface PriceFilterProps {
  priceLow: number;
  priceHigh: number;
  filterMin: number;
  filterMax: number;
  onApply: (min: number, max: number) => void;
  onReset: () => void;
}

function PriceFilter({
  priceLow,
  priceHigh,
  filterMin,
  filterMax,
  onApply,
  onReset,
}: PriceFilterProps) {
  const [inputMin, setInputMin] = useState(
    filterMin > 0 ? String(filterMin) : "",
  );
  const [inputMax, setInputMax] = useState(
    filterMax > 0 ? String(filterMax) : "",
  );

  const isActive = filterMin > 0 || filterMax > 0;

  useEffect(() => {
    if (!isActive) {
      setInputMin("");
      setInputMax("");
    }
  }, [isActive]);

  const handlePreset = (min: number, max: number) => {
    setInputMin(min > 0 ? String(min) : "");
    setInputMax(max > 0 ? String(max) : "");
    onApply(min, max);
  };

  const handleApply = () => {
    onApply(inputMin ? Number(inputMin) : 0, inputMax ? Number(inputMax) : 0);
  };

  const handleReset = () => {
    setInputMin("");
    setInputMax("");
    onReset();
  };

  const isPresetActive = (min: number, max: number) =>
    filterMin === min && filterMax === max && isActive;

  return (
    <div className="filter-section">
      <div className="filter-section-header">
        <span className="filter-section-title">💰 Price</span>
        {isActive && (
          <button className="filter-reset-link" onClick={handleReset}>
            Reset
          </button>
        )}
      </div>

      <div className="price-filter-presets">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            className={`price-preset-btn ${isPresetActive(p.min, p.max) ? "active" : ""}`}
            onClick={() => handlePreset(p.min, p.max)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="price-filter-inputs">
        <input
          type="number"
          className="price-filter-input"
          placeholder={priceLow ? `Min ৳${priceLow}` : "Min ৳"}
          value={inputMin}
          min={0}
          onChange={(e) => setInputMin(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleApply()}
        />
        <span className="price-filter-dash">—</span>
        <input
          type="number"
          className="price-filter-input"
          placeholder={priceHigh ? `Max ৳${priceHigh}` : "Max ৳"}
          value={inputMax}
          min={0}
          onChange={(e) => setInputMax(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleApply()}
        />
      </div>
      <button className="price-apply-btn" onClick={handleApply}>
        Apply
      </button>
    </div>
  );
}

export default PriceFilter;
