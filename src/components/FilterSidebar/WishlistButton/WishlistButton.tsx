"use client";
import React, { useSyncExternalStore } from "react";
import "./WishlistButton.css";

interface WishlistButtonProps {
  count: number;
  onClick: () => void;
}

const subscribe = () => () => {};

function WishlistButton({ count, onClick }: WishlistButtonProps) {
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  return (
    <button className="wl-sidebar-btn" onClick={onClick}>
      <span className="wl-sidebar-icon">❤️</span>
      <span className="wl-sidebar-label">Wishlist</span>
      {mounted && count > 0 && (
        <span className="wl-sidebar-badge">{count}</span>
      )}
    </button>
  );
}

export default WishlistButton;
