import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import ServiceWorkerRegister from "../src/components/ServiceWorkerRegister/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "MyPrice BD - Best Price Comparison in Bangladesh",
  description:
    "Compare electronics prices from Daraz, StarTech, Pickaboo, BDStall and 5 more stores in Bangladesh.",
  metadataBase: new URL("https://mypricebd.com"),
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/logo192.png",
  },
  openGraph: {
    siteName: "MyPrice BD",
    images: ["/og-image.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@mypricebd",
  },
  keywords: [
    "price comparison bangladesh",
    "daraz",
    "startech",
    "pickaboo",
    "best price bd",
    "electronics bangladesh",
  ],
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#000000" />
      </head>
      <body>
        <ServiceWorkerRegister />
        {children}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-C950VVBQEL"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          if (window.location.hostname !== 'localhost') {
            gtag('config', 'G-C950VVBQEL');
          }
        `}</Script>
      </body>
    </html>
  );
}
