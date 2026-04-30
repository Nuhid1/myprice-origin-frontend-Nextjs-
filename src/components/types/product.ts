export interface Product {
  id: string;
  _id?: string;
  name: string;
  price: number;
  originalPrice?: number;
  currency: string;
  image: string;
  rating: number;
  reviews: number;
  source: EcommerceSite;
  url: string;
  inStock: boolean;
  shipping: string;
  seller?: string;
  isStatic?: boolean;
  scrapedAt?: string;
}

export interface EcommerceSite {
  name: string;
  logo: string;
  color: string;
}

export interface FilterOptions {
  priceRange: [number, number];
  sources: string[];
  inStock: boolean;
  minRating: number;
  sortBy: "relevance" | "price-low" | "price-high" | "rating";
}
