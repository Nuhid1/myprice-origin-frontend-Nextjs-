// ✅ NO "use client" — server component

import { Product } from "../types/product";
import ProductCardStatic from "../ProductCard/ProductCardStatic";

export default function ProductGrid({ products }: { products: Product[] }) {
  if (!products?.length) return null;

  return (
    <div className="product-grid">
      {products.map((product, i) => (
        <ProductCardStatic
          key={product.id || `${product.name}-${i}`}
          product={product}
        />
      ))}
    </div>
  );
}
