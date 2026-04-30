import type { Metadata } from "next";
import MainPage from "@/src/views/MainPage";

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

// ── Page Component ───────────────────────────────────────────────────────────
// This is a server component — it just renders the client component (MainPage).
// We do NOT pass slug as a prop because MainPage is "use client" and already
// reads the slug itself via useParams() from next/navigation.
// All SEO logic lives above in generateMetadata — not inside MainPage.
export default async function SlugPage() {
  return <MainPage />;
}
