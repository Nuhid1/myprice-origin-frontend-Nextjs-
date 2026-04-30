"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Product } from "../components/types/product";
import ProductCard from "../components/ProductCard/ProductCard";
import Layout from "../components/layout/Layout";
import { useWishlist } from "../hooks/useWishlist";
import "./style/ProductPage.css";

const SITE_URL = "https://mypricebd.com";

function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const handleWishlistToggle = (p: Product) => {
    wishlist.some((w) => w.id === p.id)
      ? removeFromWishlist(p.id)
      : addToWishlist(p);
  };

  const isWishlisted = wishlist.some((w) => w.id === id);

  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();
    setLoading(true);
    setError("");
    setProduct(null);

    const load = async () => {
      // ── sessionStorage check ──
      try {
        const cached = sessionStorage.getItem(`product_${id}`);
        if (cached) {
          setProduct(JSON.parse(cached));
          setLoading(false);
          return;
        }
      } catch (e) {}

      // ── API call ──
      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products/${id}`;

      try {
        const res = await fetch(url, { signal: controller.signal });
        const text = await res.text();
        if (!res.ok) throw new Error("Not found");
        const data = JSON.parse(text);
        data.id = data._id;
        setProduct(data);
      } catch (err: any) {
        if (err.name === "AbortError") return;
        setError("not-found");
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="pp-state">
          <div className="pp-spinner" />
          <p>Loading product...</p>
        </div>
      </Layout>
    );
  }

  if (error === "not-found" || !product) {
    return (
      <Layout>
        <div className="pp-state">
          <div className="pp-not-found-icon">🔍</div>
          <h2 className="pp-not-found-title">Product preview unavailable</h2>
          <p className="pp-not-found-text">
            This product may have expired or been removed. Search for it below
            to see live prices.
          </p>
          <button className="pp-search-btn" onClick={() => router.push("/")}>
            Search on MyPrice BD →
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="pp-wrapper">
        <button className="pp-back-btn" onClick={() => router.push("/")}>
          ← Back to Search
        </button>

        <div className="pp-card-wrap">
          <ProductCard
            product={product}
            isWishlisted={isWishlisted}
            onWishlistToggle={handleWishlistToggle}
            showPriceHistory={true}
          />
        </div>

        <p className="pp-hint">
          Shared via{" "}
          <a href={SITE_URL} className="pp-hint-link">
            MyPrice BD
          </a>{" "}
          — compare prices from 9 stores in Bangladesh
        </p>
      </div>
    </Layout>
  );
}

export default ProductPage;
