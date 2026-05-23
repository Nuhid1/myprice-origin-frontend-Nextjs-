"use client";
import { useState, useRef, useCallback } from "react";
import { streamProducts } from "../api/productApi";
import { Product } from "../components/types/product";

export const SITES = [
  "daraz",
  "startech",
  "pickaboo",
  "computervillage",
  "gadgetngear",
  "selltech",
  "ultratech",
  "creatus",
  "sumashtech",
  "bdstall",
  "nexus",
];

// Module-level cache — survives re-renders, cleared on page refresh
const resultCache = new Map<string, { products: Product[]; ts: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export const useSearch = (
  initialProducts: Product[] = [],
  initialQuery: string = "",
) => {
  const [products, setProducts] = useState<Product[]>(() => initialProducts); // ✅ lazy init
  const [search, setSearch] = useState(() => initialQuery);
  const [submittedQuery, setSubmittedQuery] = useState(() => initialQuery);
  const [loadingSites, setLoadingSites] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [filterMin, setFilterMin] = useState(0);
  const [filterMax, setFilterMax] = useState(0);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [fromCache, setFromCache] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  const scoreProducts = (rawProducts: Product[], query: string) => {
    const q = query.toLowerCase();
    return rawProducts.map((p) => {
      const name = p.name?.toLowerCase() || "";
      let score = 0;
      if (name.includes(q)) score += 100;
      q.split(" ")
        .filter((w) => w.length > 2)
        .forEach((w) => {
          if (name.includes(w)) score += 10;
          if (name.startsWith(w)) score += 20;
        });
      if (p.inStock) score += 5;
      return { ...p, _score: score };
    });
  };

  const handleSearch = useCallback(
    (overrideQuery?: string) => {
      const query = (overrideQuery ?? search).trim();
      if (!query) return;

      esRef.current?.close();
      setProducts([]);
      setError("");
      setSubmittedQuery(query);
      setLoadingSites([...SITES]);
      setFilterMin(0);
      setFilterMax(0);
      setSelectedSources([]);
      setFromCache(false); // ✅ always clear — was missing from original

      // ── Cache HIT ────────────────────────────────────────────
      const cached = resultCache.get(query);
      if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
        setProducts(cached.products);
        setLoadingSites([]);
        setFromCache(true);
        return;
      }

      // ── Cache MISS → stream ───────────────────────────────────
      setProducts([]);
      setLoadingSites([...SITES]);
      const allProducts: Product[] = [];

      esRef.current = streamProducts(
        query,
        (site, newResults) => {
          const scored = scoreProducts(newResults, query).map((p) => ({
            ...p,
            id:
              p.id ||
              (p as any)._id ||
              `${site}-${Date.now()}-${Math.random()}`,
          }));

          allProducts.push(...scored);

          setProducts(
            [...allProducts].sort(
              (a, b) => ((b as any)._score || 0) - ((a as any)._score || 0),
            ),
          );
          setLoadingSites((prev) => prev.filter((s) => s !== site));
        },
        () => {
          // Stream done — cache the final sorted list
          const sorted = [...allProducts].sort(
            (a, b) => ((b as any)._score || 0) - ((a as any)._score || 0),
          );
          resultCache.set(query, { products: sorted, ts: Date.now() });
          setLoadingSites([]);
        },
        () => {
          setError("Failed to fetch products. Try again.");
          setLoadingSites([]);
        },
      );
    },
    [search],
  );

  const handleCancel = useCallback(() => {
    esRef.current?.close();
    esRef.current = null;
    setLoadingSites([]);
  }, []);

  const handleToggleSource = useCallback((source: string) => {
    setSelectedSources((prev) =>
      prev.includes(source)
        ? prev.filter((s) => s !== source)
        : [...prev, source],
    );
  }, []);

  return {
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
    fromCache,
  };
};
