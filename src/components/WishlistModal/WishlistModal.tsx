"use client";
import React from "react";
import { Product } from "../types/product";
import "./WishlistModal.css";

interface WishlistModalProps {
  wishlist: Product[];
  onRemove: (productId: string) => void;
  onClear: () => void;
  onClose: () => void;
}

function WishlistModal({
  wishlist,
  onRemove,
  onClear,
  onClose,
}: WishlistModalProps) {
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
                    <button
                      className="wl-remove-btn"
                      onClick={() => onRemove(product.id)}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="wl-footer">
              <button className="wl-clear-btn" onClick={onClear}>
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
