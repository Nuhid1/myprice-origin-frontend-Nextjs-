import axios from "axios";
import { Product } from "../components/types/product";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const fetchPriceHistory = async (productId: string, days = 7) => {
  const res = await axios.get(
    `${API_BASE_URL}/api/products/${productId}/history`,
    { params: { days } },
  );
  return res.data;
};

export const streamProducts = (
  query: string,
  onSiteResult: (site: string, results: Product[]) => void,
  onDone: () => void,
  onError: () => void,
): EventSource => {
  const es = new EventSource(
    `${API_BASE_URL}/api/products/stream?query=${encodeURIComponent(query)}`,
  );

  es.onmessage = (e: MessageEvent) => {
    const data = JSON.parse(e.data);
    if (data.done) {
      es.close();
      onDone();
      return;
    }
    if (data.results?.length > 0) {
      onSiteResult(data.site as string, data.results as Product[]);
    }
  };

  es.onerror = () => {
    es.close();
    onError();
  };

  return es;
};
