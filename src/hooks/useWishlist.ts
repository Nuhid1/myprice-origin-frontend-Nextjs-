"use client";
import { useState, useEffect, useCallback } from "react";
import { Product } from "../components/types/product";

const STORAGE_KEY = "myprice_wishlist";

function loadWishlist(): Product[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function useWishlist() {
  const [wishlist, setWishlist] = useState<Product[]>(loadWishlist);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  const addToWishlist = useCallback((product: Product) => {
    setWishlist((prev) =>
      prev.find((p) => p.id === product.id) ? prev : [...prev, product],
    );
  }, []);

  const removeFromWishlist = useCallback((productId: string) => {
    setWishlist((prev) => prev.filter((p) => p.id !== productId));
  }, []);

  const clearWishlist = useCallback(() => setWishlist([]), []);

  const wishlistedIds = new Set(wishlist.map((p) => p.id));
  const isWishlisted = (productId: string) => wishlistedIds.has(productId);

  return {
    wishlist,
    addToWishlist,
    removeFromWishlist,
    isWishlisted,
    clearWishlist,
  };
}
