"use client";
import React from "react";
import { featuredProducts } from "../../data/featuredProducts";
import ProductCard from "../ProductCard/ProductCard";
import { Product } from "../types/product";

interface FeaturedProductsProps {
  filterMin: number;
  filterMax: number;
  selectedSources: string[];
  onProductsLoaded: (priceLow: number, priceHigh: number) => void;
  isWishlisted: (id: string) => boolean;
  onWishlistToggle: (product: Product) => void;
  onResetFilters: () => void;
}

const prices = featuredProducts
  .map((p) => Number(p.price) || 0)
  .filter((p) => p > 0);

const featuredPriceLow =
  prices.length > 0 ? Math.floor(Math.min(...prices)) : 0;

const featuredPriceHigh =
  prices.length > 0 ? Math.ceil(Math.max(...prices)) : 0;

function FeaturedProducts({
  filterMin,
  filterMax,
  selectedSources,
  onProductsLoaded,
  isWishlisted,
  onResetFilters,
  onWishlistToggle,
}: FeaturedProductsProps) {
  const hasNotified = React.useRef(false);

  React.useEffect(() => {
    if (!hasNotified.current) {
      hasNotified.current = true;
      onProductsLoaded(featuredPriceLow, featuredPriceHigh);
    }
  }, [onProductsLoaded]);

  const SOURCE_NAME_TO_KEY: Record<string, string> = {
    "Sumash Tech": "sumashtech",
    "Ultra Technology": "ultratech",
    "Sell Tech BD": "selltech",
    "Computer Village": "computervillage",
    "Gadget & Gear": "gadgetngear",
    "Creatus Computer": "creatus",
    StarTech: "startech",
    Daraz: "daraz",
    Pickaboo: "pickaboo",
    BDStall: "bdstall",
  };

  const filtered = featuredProducts.filter((p) => {
    const price = Number(p.price) || 0;
    const aboveMin = filterMin === 0 || price >= filterMin;
    const belowMax = filterMax === 0 || price <= filterMax;
    const sourceKey =
      SOURCE_NAME_TO_KEY[p.source?.name ?? ""] ?? p.source?.name;
    const inSource =
      selectedSources.length === 0 || selectedSources.includes(sourceKey);
    return aboveMin && belowMax && inSource;
  });

  return (
    <div>
      <h2 style={{ padding: "1rem 0", color: "#374151", fontWeight: 600 }}>
        🔥 Trending Products
      </h2>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <h2 className="empty-state-title">No products match your filters</h2>
          <p className="empty-state-text">
            Trending products range is ৳{featuredPriceLow.toLocaleString()} to ৳
            {featuredPriceHigh.toLocaleString()}.
          </p>
          <button
            className="search-button"
            style={{ marginTop: "1rem" }}
            onClick={onResetFilters} // ← add this
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="product-grid">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isWishlisted={isWishlisted(product.id)}
              onWishlistToggle={onWishlistToggle}
              showPriceHistory={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default FeaturedProducts;
