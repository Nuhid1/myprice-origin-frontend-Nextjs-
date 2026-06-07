"use client";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { getNextHealthyBase, recordFailure, recordSuccess } from "../api/lb";
import { trackEvent } from "../utils/analytics"; // adjust path

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

async function lbPost(path: string, data: unknown): Promise<void> {
  const tried = new Set<string>();

  while (true) {
    const base = getNextHealthyBase();
    if (!base || tried.has(base)) break;
    tried.add(base);

    try {
      await axios.post(`${base}${path}`, data, { timeout: 8000 });
      recordSuccess(base);
      return;
    } catch (err) {
      console.warn(`[LB] ${base} failed:`, err);
      recordFailure(base);
    }
  }

  throw new Error("All backends are unavailable");
}

async function lbDelete(path: string, data: unknown): Promise<void> {
  const tried = new Set<string>();

  while (true) {
    const base = getNextHealthyBase();
    if (!base || tried.has(base)) break;
    tried.add(base);

    try {
      await axios.delete(`${base}${path}`, { data, timeout: 8000 });
      recordSuccess(base);
      return;
    } catch (err) {
      console.warn(`[LB] ${base} failed:`, err);
      recordFailure(base);
    }
  }

  throw new Error("All backends are unavailable");
}

async function getOrCreateSubscription(): Promise<PushSubscription | null> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window))
    return null;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  const reg = await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();

  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
    await lbPost("/api/push/subscribe", { subscription: sub });
  }

  return sub;
}

export type NotifyState = "idle" | "loading" | "active" | "unsupported";

export function useNotify(
  productId: string,
  productName: string,
  currentPrice: number,
  site: string,
  url: string,
) {
  const [state, setState] = useState<NotifyState>("idle");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(`notify:${productId}`);
    if (saved === "active") setState("active");
    if (!("serviceWorker" in navigator) || !("PushManager" in window))
      setState("unsupported");
  }, [productId]);

  const toggle = useCallback(async () => {
    if (state === "loading" || state === "unsupported") return;

    setState("loading");

    try {
      const sub = await getOrCreateSubscription();
      if (!sub) {
        setState("idle");
        return;
      }

      if (state === "active") {
        await lbDelete("/api/push/alert", {
          endpoint: sub.endpoint,
          productId,
        });
        localStorage.removeItem(`notify:${productId}`);
        setState("idle");

        //event track on google ananlytics when user cancels price alert
        trackEvent("price_alert_cancelled", {
          product_id: productId,
          product_name: productName,
          price: currentPrice,
          site,
        });
      } else {
        await lbPost("/api/push/alert", {
          endpoint: sub.endpoint,
          productId,
          productName,
          currentPrice,
          site,
          url,
        });
        localStorage.setItem(`notify:${productId}`, "active");
        setState("active");

        //event track on google ananlytics when user sets price alert
        trackEvent("price_alert_set", {
          product_id: productId,
          product_name: productName,
          price: currentPrice,
          site,
        });
      }
    } catch (err) {
      console.error("Notify toggle failed:", err);
      setState("idle");
    }
  }, [state, productId, productName, currentPrice, site, url]);

  return { state, toggle };
}
