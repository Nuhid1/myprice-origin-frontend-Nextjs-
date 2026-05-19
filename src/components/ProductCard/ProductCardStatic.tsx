// ✅ NO "use client" — server rendered, Google indexes this

import { Product } from "../types/product";

const BROKEN_DOMAINS = ["media.gadgetandgear.com"];

function getSafeImageSrc(url: string): string {
  try {
    const { hostname } = new URL(url);
    if (BROKEN_DOMAINS.some((d) => hostname.includes(d))) {
      return "/placeholder.png";
    }
    return url;
  } catch {
    return "/placeholder.png";
  }
}

export default function ProductCardStatic({ product }: { product: Product }) {
  const price = Number(product.price);
  const discount = product.originalPrice
    ? Math.round(
        ((product.originalPrice - price) / product.originalPrice) * 100,
      )
    : 0;

  return (
    <div className="product-card">
      <div className="product-image-wrapper">
        <img
          src={getSafeImageSrc(product.image)}
          alt={product.name}
          className="product-image"
        />

        {discount > 0 && (
          <div className="product-discount-badge">
            <span className="discount-icon">⬇️</span>
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
          style={{ backgroundColor: product.source?.color }}
        >
          {product.source?.logo} {product.source?.name}
        </div>

        {/* Static wishlist placeholder — keeps card height same as ProductCard */}
        <div className="product-wish-btn" aria-hidden="true">
          🤍
        </div>
      </div>

      <div className="product-content">
        <h3 className="product-name">{product.name}</h3>

        <div className="product-rating-wrapper">
          <div className="product-rating">
            <span className="star-icon">⭐</span>
            <span className="rating-value">{product.rating}</span>
          </div>
          <span className="rating-reviews">
            ({product.reviews?.toLocaleString()})
          </span>
        </div>

        {product.seller && (
          <p className="product-seller">by {product.seller}</p>
        )}

        <div className="product-price-wrapper">
          <span className="product-price">
            {product.currency}
            {price > 0 ? price.toLocaleString() : "N/A"}
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
        >
          <span className="link-icon">🔗</span>
          View on {product.source?.name}
        </a>

        {/* Hidden placeholders so card height matches ProductCard exactly */}
        <div
          className="ph-toggle-btn"
          aria-hidden="true"
          style={{ visibility: "hidden" }}
        >
          📈 Price History
        </div>
        <div
          className="ph-toggle-btn"
          aria-hidden="true"
          style={{ visibility: "hidden" }}
        >
          🔗 Share product
        </div>
      </div>
    </div>
  );
}
