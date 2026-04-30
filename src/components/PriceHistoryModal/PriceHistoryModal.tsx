"use client";
import { useEffect, useState } from "react";
import PriceHistoryGraph from "../PriceHistoryGraph/PriceHistoryGraph";
import "./PriceHistoryModal.css";

const PERIODS = [
  { label: "7D", days: 7 },
  { label: "14D", days: 14 },
  { label: "21D", days: 21 },
  { label: "28D", days: 28 },
];

interface Props {
  productId: string;
  productName: string;
  onClose: () => void;
}

export default function PriceHistoryModal({
  productId,
  productName,
  onClose,
}: Props) {
  const [activeDays, setActiveDays] = useState(7);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="ph-modal-backdrop" onClick={onClose}>
      <div className="ph-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ph-modal-header">
          <h2 className="ph-modal-title">📈 Price History</h2>
          <button className="ph-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Period tabs */}
        <div className="ph-tabs">
          {PERIODS.map(({ label, days }) => (
            <button
              key={days}
              className={`ph-tab ${activeDays === days ? "ph-tab--active" : ""}`}
              onClick={() => setActiveDays(days)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="ph-modal-body">
          <PriceHistoryGraph
            productId={productId}
            productName={productName}
            days={activeDays}
          />
        </div>
      </div>
    </div>
  );
}
