"use client";
import { useNotify, NotifyState } from "../../hooks/useNotify";
import "./NotifyButton.css";

interface NotifyButtonProps {
  productId: string;
  productName: string;
  currentPrice: number;
  site: string;
  url: string;
  variant?: "card" | "wishlist";
}

const LABELS: Record<NotifyState, string> = {
  idle: "🔔 Notify on price drop",
  loading: "⏳ Setting up…",
  active: "🔕 Cancel price alert",
  unsupported: "🔔 Alerts not supported",
};

const SHORT_LABELS: Record<NotifyState, string> = {
  idle: "🔔 Notify",
  loading: "⏳…",
  active: "🔕 Alert on",
  unsupported: "🔔 N/A",
};

export default function NotifyButton({
  productId,
  productName,
  currentPrice,
  site,
  url,
  variant = "card",
}: NotifyButtonProps) {
  const { state, toggle } = useNotify(
    productId,
    productName,
    currentPrice,
    site,
    url,
  );

  const label = variant === "wishlist" ? SHORT_LABELS[state] : LABELS[state];

  return (
    <button
      className={`notify-btn notify-btn--${variant} notify-btn--${state}`}
      onClick={toggle}
      disabled={state === "loading" || state === "unsupported"}
      title={
        state === "active"
          ? `Alert set at ৳${currentPrice.toLocaleString()} — click to cancel`
          : `Notify me when price drops below ৳${currentPrice.toLocaleString()}`
      }
    >
      {state === "loading" && <span className="notify-spinner" />}
      {label}
    </button>
  );
}
