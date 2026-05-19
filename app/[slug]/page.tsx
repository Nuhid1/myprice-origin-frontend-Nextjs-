import type { Metadata } from "next";
import MainPage from "@/src/views/MainPage";
import { Product } from "@/src/components/types/product";
import ProductGrid from "@/src/components/ProductGrid/ProductGrid";

// ── Types ────────────────────────────────────────────────────────────────────
// Next.js 15+ passes params as a Promise, so we type it accordingly
interface Props {
  params: Promise<{ slug: string }>;
}

// ── Brand Overrides ──────────────────────────────────────────────────────────
// Normal capitalize logic (word[0].toUpperCase()) can't handle acronyms or
// camelCase brands. This lookup table fixes them for slugs in our sitemap.
// e.g. "iphone" → "iPhone", "dji" → "DJI", "oneplus" → "OnePlus"
// Add more here if you add new brand slugs to the sitemap.
const BRAND_OVERRIDES: Record<string, string> = {
  // existing
  dji: "DJI",
  rtx: "RTX",
  oneplus: "OnePlus",
  macbook: "MacBook",
  airpods: "AirPods",
  playstation: "PlayStation",
  iphone: "iPhone",
  // new
  hp: "HP",
  dell: "Dell",
  asus: "ASUS",
};

// ── Slug → Human Readable Query ──────────────────────────────────────────────
// Strips URL suffixes and converts the slug into a clean display string.
// Order of replace() calls matters — longest/most specific patterns first
// to avoid partial matches leaving leftover words.
//
// Examples:
//   "iphone-price-in-bangladesh"   → "iPhone"
//   "best-phone-under-10000-bd"    → "Best Phone Under 10000"
//   "dji-drone-price-in-bangladesh"→ "DJI Drone"
//   "rtx-gpu-price-in-bangladesh"  → "RTX Gpu"
function formatQuery(slug: string): string {
  const query = slug
    .replace(/-price-in-bangladesh$/, "") // e.g. "iphone-price-in-bangladesh"
    .replace(/-price-in-bd$/, "") // e.g. "samsung-mobile-price-in-bd"
    .replace(/-in-bangladesh$/, "") // e.g. "starlink-in-bangladesh"
    .replace(/-in-bd$/, "") // e.g. "router-in-bd"
    .replace(/-bd$/, "") // e.g. "best-phone-under-10000-bd"
    .replace(/-/g, " ") // convert remaining hyphens to spaces
    .trim();

  // Capitalize each word — use brand override if available, otherwise
  // just uppercase the first letter (e.g. "samsung" → "Samsung")
  return query
    .split(" ")
    .map(
      (word) =>
        BRAND_OVERRIDES[word.toLowerCase()] ??
        word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(" ");
}

// ── Server-side product fetch ─────────────────────────────────────────────
async function fetchInitialProducts(query: string): Promise<Product[]> {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  const url = `${base}/api/products/stream?query=${encodeURIComponent(query)}`;

  return new Promise((resolve) => {
    const allProducts: any[] = [];
    let buffer = "";
    let resolved = false;

    // ✅ Resolve with whatever we have after 5s — don't block page load longer
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        console.log(
          `[SSR] Timeout — returning ${allProducts.length} products early`,
        );
        resolve(allProducts);
      }
    }, 5000);

    fetch(url)
      .then((res) => {
        if (!res.ok || !res.body) {
          clearTimeout(timeout);
          resolve([]);
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        function read() {
          reader
            .read()
            .then(({ done, value }) => {
              if (resolved) return; // already resolved by timeout

              if (done) {
                clearTimeout(timeout);
                resolved = true;
                console.log(
                  `[SSR] Stream done — ${allProducts.length} products`,
                );
                resolve(allProducts);
                return;
              }

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split("\n");
              buffer = lines.pop() || "";

              for (const line of lines) {
                if (!line.startsWith("data:")) continue;
                try {
                  const data = JSON.parse(line.slice(5).trim());
                  if (data.done) {
                    clearTimeout(timeout);
                    resolved = true;
                    console.log(
                      `[SSR] Done signal — ${allProducts.length} products`,
                    );
                    resolve(allProducts);
                    return;
                  }
                  if (data.results?.length > 0) {
                    allProducts.push(...data.results);
                  }
                } catch {}
              }

              read(); // continue reading
            })
            .catch(() => {
              if (!resolved) {
                resolved = true;
                resolve(allProducts);
              }
            });
        }

        read();
      })
      .catch((e) => {
        console.log(`[SSR] Error:`, e);
        if (!resolved) {
          resolved = true;
          resolve([]);
        }
      });
  });
}

// ── Server-side Metadata ─────────────────────────────────────────────────────
// Runs on the server at request time (or build time with generateStaticParams).
// Generates unique <title>, <meta description>, canonical URL, OG and Twitter
// tags for each slug page — critical for SEO and social sharing.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Await params — required in Next.js 15+ since params is now a Promise
  const { slug } = await params;

  // Convert slug to a clean display name for use in titles and descriptions
  const formattedQuery = formatQuery(slug);

  // Page title — shown in browser tab and Google search results
  const title = formattedQuery
    ? `${formattedQuery} Price in Bangladesh - Compare 9 Stores | MyPrice BD`
    : "Compare Tech Prices in Bangladesh | MyPrice BD"; // fallback for root

  // Meta description — shown in Google search snippets (~155 chars ideal)
  const description = `Find and compare the best ${formattedQuery} prices in Bangladesh across 9 stores — Daraz, StarTech, Pickaboo, and more. Updated daily.`;

  return {
    title,
    description,

    // Canonical URL — prevents duplicate content issues if the page is
    // accessible via multiple URLs (e.g. with/without trailing slash)
    alternates: {
      canonical: `https://mypricebd.com/${slug}`,
    },

    // Tell search engines to index and follow links on this page
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },

    // Open Graph — controls how the page appears when shared on
    // Facebook, WhatsApp, LinkedIn, Telegram etc.
    openGraph: {
      title,
      description,
      url: `https://mypricebd.com/${slug}`,
      type: "website",
      siteName: "MyPrice BD",
      images: [
        {
          url: "https://mypricebd.com/og-image.png", // 1200×630 recommended
          width: 1200,
          height: 630,
          alt: `${formattedQuery} Price in Bangladesh`,
        },
      ],
    },

    // Twitter Card — controls how the page appears when shared on Twitter/X
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://mypricebd.com/og-image.png"],
    },
  };
}

// ── Page ──────────────────────────────────────────────────────────────────

// REPLACE only the SlugPage function — keep everything else (formatQuery, fetchInitialProducts, generateMetadata) exactly the same
export default async function SlugPage({ params }: Props) {
  const { slug } = await params;
  const formattedQuery = formatQuery(slug);
  const initialProducts = await fetchInitialProducts(formattedQuery);

  return (
    <>
      {/* Google reads this — users cannot see it */}
      <div className="seo-grid" aria-hidden="true">
        <ProductGrid products={initialProducts} />
      </div>

      {/* Users see and interact with this */}
      <MainPage
        initialProducts={initialProducts}
        initialQuery={formattedQuery}
      />
    </>
  );
}
