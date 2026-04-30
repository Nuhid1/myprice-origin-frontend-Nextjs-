import type { Metadata } from "next";
import ProductPage from "@/src/views/ProductPage";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products/${params.id}`,
    );
    const product = await res.json();
    return {
      title: `${product.name} — MyPrice BD`,
      description: `${product.name} for ৳${product.price?.toLocaleString()} on ${product.source?.name}. Compare prices in Bangladesh.`,
      openGraph: {
        title: product.name,
        images: [product.image],
        url: `https://mypricebd.com/product/${params.id}`,
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: product.name,
        images: [product.image],
      },
      alternates: {
        canonical: `https://mypricebd.com/product/${params.id}`,
      },
    };
  } catch {
    return { title: "Product — MyPrice BD" };
  }
}

export default function Product() {
  return <ProductPage />;
}
