"use client";
import React, { useState, useEffect } from "react";
import "./AnnouncementBanner.css";

type IOSState = "standalone" | "safari" | "chrome" | "other-browser" | null;

function getIOSBrowserState(): IOSState {
  if (typeof navigator === "undefined") return null;
  const ua = navigator.userAgent;
  const isIOS = /iphone|ipad|ipod/i.test(ua);
  if (!isIOS) return null;

  const isStandalone =
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  if (isStandalone) return "standalone";

  const isChrome = /CriOS/i.test(ua);
  if (isChrome) return "chrome";

  const isSafari = /safari/i.test(ua) && !/CriOS|FxiOS|OPiOS|EdgiOS/i.test(ua);
  if (isSafari) return "safari";

  return "other-browser";
}

export default function AnnouncementBanner() {
  const [visible, setVisible] = useState(false);
  const [iosState, setIosState] = useState<IOSState>(null);

  useEffect(() => {
    setVisible(true);
    setIosState(getIOSBrowserState());
  }, []);

  const handleDismiss = () => {
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="ab-banner" role="alert">
      <div className="ab-inner">
        <span className="ab-badge">NEW</span>

        {iosState === "safari" && (
          <p className="ab-text">
            📱 <strong>iPhone users:</strong> Tap <strong>Share →</strong>{" "}
            <strong>Add to Home Screen</strong>, open the app from your home
            screen, then hit 🔔 <strong>Notify</strong> for price drop alerts.
            🎉
          </p>
        )}

        {iosState === "chrome" && (
          <p className="ab-text">
            📱 <strong>iPhone + Chrome users:</strong> Price alerts aren't
            supported in Chrome on iOS. Open this page in{" "}
            <strong>Safari</strong>, then tap <strong>Share →</strong>{" "}
            <strong>Add to Home Screen</strong> to enable 🔔 alerts. 🎉
          </p>
        )}

        {iosState === "other-browser" && (
          <p className="ab-text">
            📱 <strong>iPhone users:</strong> For price drop alerts, please open
            this page in <strong>Safari</strong> and add it to your home screen.
            🎉
          </p>
        )}

        {(iosState === "standalone" || iosState === null) && (
          <p className="ab-text">
            🔔 Price Drop Alerts are here! Add products to your{" "}
            <strong>Wishlist</strong> and hit <strong>Notify</strong> to get
            alerted when the price drops. Use{" "}
            <strong>Filter → Wishlisted</strong> to see all your saved products.
            🎉
          </p>
        )}

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
