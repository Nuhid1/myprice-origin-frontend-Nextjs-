"use client";
import React, { useState, useEffect } from "react";
import "./AnnouncementBanner.css";

export default function AnnouncementBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  const handleDismiss = () => {
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="ab-banner" role="alert">
      <div className="ab-inner">
        <span className="ab-badge">NEW</span>
        <p className="ab-text">
          MyPrice BD has moved to a new home!{" "}
          <a
            className="ab-link"
            href="https://mypricebd.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Visit us at mypricebd.com
          </a>{" "}
          for the latest prices and deals. 🎉
        </p>
        <button
          className="ab-close"
          onClick={handleDismiss}
          aria-label="Dismiss announcement"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
