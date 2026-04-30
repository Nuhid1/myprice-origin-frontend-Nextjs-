"use client";
import React, { useState, useMemo, useEffect } from "react";
import { useParams } from "next/navigation";

import { Product } from "../components/types/product";
import ProductCard from "../components/ProductCard/ProductCard";
import SearchBar from "../components/searchBar/SearchBar";
import FilterSidebar from "../components/FilterSidebar/FilterSidebar";
import FeaturedProducts from "../components/FeaturedProducts/FeaturedProducts";
import WishlistModal from "../components/WishlistModal/WishlistModal";
import Layout from "../components/layout/Layout";
import FeedbackButton from "../components/FeedbackButton/FeedbackButton";
import AnnouncementBanner from "../components/AnnouncementBanner/AnnouncementBanner";

import { useWishlist } from "../hooks/useWishlist";
import { useSearch, SITES } from "../hooks/useSearch";
import "./style/main.css";

function MainPage() {
  const [featuredPriceLow, setFeaturedPriceLow] = useState(0);
  const [featuredPriceHigh, setFeaturedPriceHigh] = useState(0);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); //for mobile

  const { wishlist, addToWishlist, removeFromWishlist, clearWishlist } =
    useWishlist();

  const {
    search,
    setSearch,
    submittedQuery,
    products,
    loadingSites,
    error,
    filterMin,
    setFilterMin,
    filterMax,
    setFilterMax,
    selectedSources,
    setSelectedSources,
    handleSearch,
    handleCancel,
    handleToggleSource,
  } = useSearch();

  const isLoading = loadingSites.length > 0; //boolean
  const hasSearched = submittedQuery !== ""; //boolean

  const isWishlisted = useMemo(() => {
    const ids = new Set(wishlist.map((w) => w.id));
    return (productId: string) => ids.has(productId);
  }, [wishlist]);

  //for love button in product card
  const handleWishlistToggle = (product: Product) => {
    wishlist.some((w) => w.id === product.id)
      ? removeFromWishlist(product.id)
      : addToWishlist(product);
  };

  const availableSources = useMemo(
    () =>
      Array.from(
        new Set(
          products.map((p) => p.source?.name).filter(Boolean) as string[],
        ),
      ),
    [products],
  );

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const price = Number(p.price) || 0;
      const aboveMin = filterMin === 0 || price >= filterMin;
      const belowMax = filterMax === 0 || price <= filterMax;
      const inSource =
        selectedSources.length === 0 ||
        selectedSources.includes(p.source?.name);
      return aboveMin && belowMax && inSource;
    });
  }, [products, filterMin, filterMax, selectedSources]);

  const { priceLow, priceHigh } = useMemo(() => {
    if (products.length === 0) return { priceLow: 0, priceHigh: 0 };
    const prices = products
      .map((p) => Number(p.price) || 0)
      .filter((p) => p > 0);
    return {
      priceLow: Math.floor(Math.min(...prices)),
      priceHigh: Math.ceil(Math.max(...prices)),
    };
  }, [products]);

  const hiddenCount = products.length - filteredProducts.length;
  const storesCount = new Set(filteredProducts.map((p) => p.source?.name)).size;

  const handleProductsLoaded = React.useCallback(
    (low: number, high: number) => {
      setFeaturedPriceLow(low);
      setFeaturedPriceHigh(high);
    },
    [],
  );

  // ── Search query derived from URL slug ───────────────────
  // Uses the same stripping pattern as formatQuery() in page.tsx.
  // Order matters — longest/most specific suffixes must be removed first
  // so partials like "-bd" don't leave leftover words in the search query.
  const params = useParams();
  const slug = params?.slug as string | undefined;

  const seoQuery = (slug || "")
    .replace(/-price-in-bangladesh$/, "")
    .replace(/-price-in-bd$/, "")
    .replace(/-in-bangladesh$/, "")
    .replace(/-in-bd$/, "")
    .replace(/-bd$/, "")
    .replace(/-/g, " ")
    .trim();

  // ✅ Single effect — no stale state issue
  useEffect(() => {
    if (seoQuery && !submittedQuery) {
      setSearch(seoQuery);
      handleSearch(seoQuery); // passes query directly, bypasses stale search state
    }
  }, [seoQuery, submittedQuery, setSearch, handleSearch]);

  return (
    <>
      <FeedbackButton />

      <AnnouncementBanner />

      <Layout>
        {/* ── SEO ── */}

        <SearchBar
          search={search}
          onSearchChange={setSearch}
          onSearch={handleSearch}
          onSearchWithQuery={handleSearch}
          onCancel={handleCancel}
          isLoading={isLoading}
          loadingSites={loadingSites}
          totalCount={products.length}
          filteredCount={filteredProducts.length}
          hiddenCount={hiddenCount}
          storesCount={storesCount}
        />

        <div className="page-body">
          <button
            className="mobile-filter-toggle"
            onClick={() => setSidebarOpen((prev) => !prev)}
          >
            🔧 {sidebarOpen ? "Hide Filters" : "Show Filters"}
          </button>

          <div className="page-body-inner">
            <FilterSidebar
              priceLow={hasSearched ? priceLow : featuredPriceLow}
              priceHigh={hasSearched ? priceHigh : featuredPriceHigh}
              filterMin={filterMin}
              filterMax={filterMax}
              onApplyPrice={(min, max) => {
                setFilterMin(min);
                setFilterMax(max);
              }}
              onResetPrice={() => {
                setFilterMin(0);
                setFilterMax(0);
              }}
              availableSources={hasSearched ? availableSources : SITES}
              selectedSources={selectedSources}
              onToggleSource={handleToggleSource}
              onResetSources={() => setSelectedSources([])}
              wishlistCount={wishlist.length}
              onWishlistOpen={() => setWishlistOpen(true)}
              mobileOpen={sidebarOpen}
            />

            <main className="main-content">
              {error && (
                <div className="empty-state">
                  <p className="empty-state-text" style={{ color: "#ef4444" }}>
                    {error}
                  </p>
                </div>
              )}

              {isLoading && products.length === 0 && (
                <div className="empty-state">
                  <p className="empty-state-text">Searching products...</p>
                </div>
              )}

              {!isLoading && !error && hasSearched && products.length === 0 && (
                <div className="empty-state">
                  <svg
                    className="empty-state-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <h2 className="empty-state-title">No products found</h2>
                  <p className="empty-state-text">
                    Try a different search term.
                  </p>
                </div>
              )}

              {!isLoading &&
                filteredProducts.length === 0 &&
                products.length > 0 && (
                  <div className="empty-state">
                    <h2 className="empty-state-title">
                      No products match your filters
                    </h2>
                    <p className="empty-state-text">
                      Searched products range is ৳{priceLow.toLocaleString()} to
                      ৳{priceHigh.toLocaleString()}.
                    </p>
                    <button
                      className="search-button"
                      style={{ marginTop: "1rem" }}
                      onClick={() => {
                        setFilterMin(0);
                        setFilterMax(0);
                        setSelectedSources([]);
                      }}
                    >
                      Reset Filters
                    </button>
                  </div>
                )}

              {!hasSearched && !isLoading && (
                <FeaturedProducts
                  filterMin={filterMin}
                  filterMax={filterMax}
                  selectedSources={selectedSources}
                  isWishlisted={(id) => wishlist.some((w) => w.id === id)}
                  onWishlistToggle={handleWishlistToggle}
                  onProductsLoaded={handleProductsLoaded}
                  onResetFilters={() => {
                    setFilterMin(0);
                    setFilterMax(0);
                    setSelectedSources([]);
                  }}
                />
              )}

              {filteredProducts.length > 0 && (
                <div
                  className="product-grid"
                  key={wishlist.map((w) => w.id).join(",")}
                >
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isWishlisted={isWishlisted(product.id)}
                      onWishlistToggle={handleWishlistToggle}
                    />
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>

        {wishlistOpen && (
          <WishlistModal
            wishlist={wishlist}
            onRemove={removeFromWishlist}
            onClear={clearWishlist}
            onClose={() => setWishlistOpen(false)}
          />
        )}
      </Layout>
    </>
  );
}

export default MainPage;
