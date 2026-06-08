"use client";
import React from "react";
import { Product } from "../types/product";
import "./WishlistModal.css";
import NotifyButton from "../NotifyButton/NotifyButton";
import { getNextHealthyBase, recordFailure, recordSuccess } from "../../api/lb";

interface WishlistModalProps {
  wishlist: Product[];
  onRemove: (productId: string) => void;
  onClear: () => void;
  onClose: () => void;
}

async function cancelAlert(productId: string) {
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (!sub) return;
    localStorage.removeItem(`notify:${productId}`);
    const tried = new Set<string>();
    while (true) {
      const base = getNextHealthyBase();
      if (!base || tried.has(base)) break;
      tried.add(base);
      try {
        await fetch(`${base}/api/push/alert`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint, productId }),
        });
        recordSuccess(base);
        return;
      } catch (err) {
        recordFailure(base);
      }
    }
  } catch (err) {
    console.error("Failed to cancel alert for", productId, err);
  }
}

function WishlistModal({
  wishlist,
  onRemove,
  onClear,
  onClose,
}: WishlistModalProps) {
  const handleRemove = async (productId: string) => {
    const hasAlert = localStorage.getItem(`notify:${productId}`) === "active";
    if (hasAlert) await cancelAlert(productId);
    onRemove(productId);
  };

  const handleClear = async () => {
    const activeAlerts = wishlist.filter(
      (p) => localStorage.getItem(`notify:${p.id}`) === "active",
    );
    await Promise.allSettled(activeAlerts.map((p) => cancelAlert(p.id)));
    onClear();
  };

  return (
    <div className="wl-overlay" onClick={onClose}>
      <div className="wl-modal" onClick={(e) => e.stopPropagation()}>
        <div className="wl-header">
          <h2 className="wl-title">❤️ Wishlist ({wishlist.length})</h2>
          <button className="wl-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>
        {wishlist.length === 0 ? (
          <div className="wl-empty">
            <p className="wl-empty-icon">🤍</p>
            <p className="wl-empty-text">No saved products yet.</p>
            <p className="wl-empty-sub">
              Hit the ♡ on any product to save it here.
            </p>
          </div>
        ) : (
          <>
            <div className="wl-list">
              {wishlist.map((product) => (
                <div key={product.id} className="wl-item">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="wl-item-image"
                  />
                  <div className="wl-item-info">
                    <p className="wl-item-name">{product.name}</p>
                    <p className="wl-item-price">
                      {product.currency}
                      {product.price.toLocaleString()}
                    </p>
                    <p className="wl-item-source">{product.source.name}</p>
                  </div>
                  <div className="wl-item-actions">
                    <a
                      href={product.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="wl-view-btn"
                    >
                      View
                    </a>
                    {product.isStatic !== true && (
                      <NotifyButton
                        productId={product.id}
                        productName={product.name}
                        currentPrice={product.price}
                        site={product.source.name}
                        url={product.url}
                        variant="wishlist"
                      />
                    )}
                    <button
                      className="wl-remove-btn"
                      onClick={() => handleRemove(product.id)}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="wl-footer">
              <button className="wl-clear-btn" onClick={handleClear}>
                🗑 Clear All
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default WishlistModal;
