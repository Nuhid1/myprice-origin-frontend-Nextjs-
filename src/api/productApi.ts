import axios from "axios";
import { Product } from "../components/types/product";
import {
  getHealthyBases,
  getNextHealthyBase,
  recordFailure,
  recordSuccess,
} from "./lb"; // ← single source of truth

// fetchPriceHistory — unchanged logic, just uses lb.ts now
export const fetchPriceHistory = async (productId: string, days = 7) => {
  const tried = new Set<string>();

  while (true) {
    const base = getNextHealthyBase();
    if (!base || tried.has(base)) break;
    tried.add(base);

    try {
      const res = await axios.get(`${base}/api/products/${productId}/history`, {
        params: { days },
        timeout: 8000,
      });
      recordSuccess(base);
      return res.data;
    } catch (err) {
      console.warn(`[LB] ${base} failed:`, err);
      recordFailure(base);
    }
  }

  throw new Error("All backends are unavailable");
};

// streamProducts — unchanged logic, just uses lb.ts now
export const streamProducts = (
  query: string,
  onSiteResult: (site: string, results: Product[]) => void,
  onDone: () => void,
  onError: () => void,
): (() => void) => {
  let cancelled = false;
  let currentEs: EventSource | null = null;
  const receivedSites = new Set<string>();

  const tryStream = (attempt: number) => {
    if (cancelled) return;

    const healthy = getHealthyBases();
    if (attempt >= healthy.length) {
      onError();
      return;
    }

    const base = healthy[attempt];
    const es = new EventSource(
      `${base}/api/products/stream?query=${encodeURIComponent(query)}`,
    );
    currentEs = es;

    const connectionTimeout = setTimeout(() => {
      if (es.readyState !== EventSource.OPEN) {
        console.warn(`[LB] SSE timeout for ${base}`);
        recordFailure(base);
        es.close();
        tryStream(attempt + 1);
      }
    }, 8000);

    es.onopen = () => clearTimeout(connectionTimeout);

    es.onmessage = (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      if (data.done) {
        clearTimeout(connectionTimeout);
        recordSuccess(base);
        es.close();
        if (!cancelled) onDone();
        return;
      }
      if (data.results?.length > 0 && data.site) {
        if (receivedSites.has(data.site)) return;
        receivedSites.add(data.site);
        onSiteResult(data.site as string, data.results as Product[]);
      }
    };

    es.onerror = () => {
      clearTimeout(connectionTimeout);
      recordFailure(base);
      es.close();
      if (!cancelled) tryStream(attempt + 1);
    };
  };

  tryStream(0);
  return () => {
    cancelled = true;
    currentEs?.close();
  };
};
