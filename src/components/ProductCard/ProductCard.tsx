"use client";
import { useState } from "react";
import { Product } from "../types/product";
import PriceHistoryModal from "../PriceHistoryModal/PriceHistoryModal";
import { trackEvent } from "../../utils/analytics";
import { timeAgo } from "../../utils/timeAgo";
import ShareModal from "../ShareModal/ShareModal";
import "./ProductCard.css";

interface ProductCardProps {
  product: Product;
  isWishlisted: boolean;
  onWishlistToggle: (product: Product) => void;
  showPriceHistory?: boolean;
}

const ProductCard = ({
  product,
  isWishlisted,
  onWishlistToggle,
  showPriceHistory = true,
}: ProductCardProps) => {
  const [showModal, setShowModal] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const discount = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100,
      )
    : 0;

  const StarIcon = () => <span className="star-icon">⭐</span>;
  const ExternalLinkIcon = () => <span className="link-icon">🔗</span>;
  const TrendingDownIcon = () => <span className="discount-icon">⬇️</span>;

  // Add this utility at the top of ProductCard.tsx (or in a utils file)
  const BROKEN_DOMAINS = ["media.gadgetandgear.com"];

  function getSafeImageSrc(url: string): string {
    try {
      const { hostname } = new URL(url);
      if (BROKEN_DOMAINS.some((d) => hostname.includes(d))) {
        return "/placeholder.png"; // never hits the network
      }
      return url;
    } catch {
      return "/placeholder.png";
    }
  }

  return (
    <div className="product-card">
      <div className="product-image-wrapper">
        <img
          src={getSafeImageSrc(product.image)} // ← sanitized before render
          alt={product.name}
          className="product-image"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/placeholder.png";
          }}
        />

        {discount > 0 && (
          <div className="product-discount-badge">
            <TrendingDownIcon />
            {discount}% OFF
          </div>
        )}

        {!product.inStock && (
          <div className="product-out-of-stock-overlay">
            <div className="out-of-stock-badge">Out of Stock</div>
          </div>
        )}

        <div
          className="product-source-badge"
          style={{ backgroundColor: product.source.color }}
        >
          {product.source.logo} {product.source.name}
        </div>

        <button
          className={`product-wish-btn ${isWishlisted ? "wishlisted" : ""}`}
          onClick={(e) => {
            e.preventDefault();
            trackEvent("wishlist_toggle", {
              product_id: product.id,
              product_name: product.name,
              action: isWishlisted ? "remove" : "add",
            });
            onWishlistToggle(product);
          }}
          title={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
        >
          {isWishlisted ? "❤️" : "🤍"}
        </button>
      </div>

      <div className="product-content">
        <h3 className="product-name">{product.name}</h3>

        <div className="product-rating-wrapper">
          <div className="product-rating">
            <StarIcon />
            <span className="rating-value">{product.rating}</span>
          </div>
          <span className="rating-reviews">
            ({product.reviews.toLocaleString()})
          </span>
        </div>

        {product.seller && (
          <p className="product-seller">by {product.seller}</p>
        )}
        <div className="product-price-wrapper">
          <span className="product-price">
            {product.currency}
            {product.price.toLocaleString()}
          </span>

          {product.originalPrice && (
            <span className="product-original-price">
              {product.currency}
              {product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>
        <p className="product-shipping">{product.shipping}</p>
        <a
          href={product.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`product-link-button ${!product.inStock ? "disabled" : ""}`}
          onClick={() =>
            trackEvent("view_store_click", {
              product_id: product.id,
              product_name: product.name,
              source: product.source.name,
              value: product.price,
              currency: product.currency,
            })
          }
        >
          <ExternalLinkIcon />
          View on {product.source.name}
        </a>

        {/* suppressHydrationWarning fixes timeAgo mismatch between server and client */}
        {product.scrapedAt && (
          <p className="product-last-checked" suppressHydrationWarning>
            🕐 Price checked {timeAgo(product.scrapedAt)}
          </p>
        )}

        {/* ── Price History ── */}
        {/* Only show if the prop is true AND the product is NOT static */}
        {showPriceHistory && product.isStatic !== true && (
          <>
            <button
              className="ph-toggle-btn"
              onClick={() => setShowModal(true)}
            >
              📈 Price History
            </button>

            {showModal && (
              <PriceHistoryModal
                productId={product.id}
                productName={product.name}
                onClose={() => setShowModal(false)}
              />
            )}
          </>
        )}

        {/* ── Share ── */}
        {product.isStatic !== true && (
          <>
            <button
              className="ph-toggle-btn"
              onClick={() => {
                trackEvent("share_open", {
                  product_id: product.id,
                  product_name: product.name,
                });
                setShowShare(true);
              }}
            >
              🔗 Share product
            </button>

            {showShare && (
              <ShareModal
                product={product}
                onClose={() => setShowShare(false)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
