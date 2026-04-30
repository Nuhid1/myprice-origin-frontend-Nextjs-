"use client";
import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { fetchPriceHistory } from "../../api/productApi";
import "./PriceHistoryGraph.css";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Filler,
);

interface PricePoint {
  price: number;
  recordedAt: string;
}

interface Props {
  productId: string;
  productName?: string;
  days: number;
}

export default function PriceHistoryGraph({
  productId,
  productName,
  days,
}: Props) {
  const [history, setHistory] = useState<PricePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    setError(null);

    fetchPriceHistory(productId, days)
      .then((data) => {
        setHistory(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(
          "Price history error:",
          err.response?.status,
          err.message,
        );
        setError("Failed to load price history");
        setLoading(false);
      });
  }, [productId, days]);

  if (loading)
    return <div className="ph-loading">Loading price history...</div>;
  if (error) return <div className="ph-error">{error}</div>;
  if (history.length === 0)
    return <div className="ph-empty">No price history available yet.</div>;

  const prices = history.map((h) => h.price);
  const lowest = Math.min(...prices);
  const highest = Math.max(...prices);
  const current = prices[prices.length - 1];
  const diff = current - prices[0];
  const diffPercent = ((diff / prices[0]) * 100).toFixed(1);
  const isDown = diff <= 0;

  // ── Partial data detection ─────────────────────────────
  const oldestDate = new Date(history[0].recordedAt);
  const newestDate = new Date(history[history.length - 1].recordedAt);
  const recordedDays =
    Math.round(
      (newestDate.getTime() - oldestDate.getTime()) / (1000 * 60 * 60 * 24),
    ) + 1;
  const isPartial = recordedDays < days - 1; // ← use recordedDays not daysCovered

  const data = {
    labels: history.map((h) =>
      new Date(h.recordedAt).toLocaleDateString("en-BD", {
        month: "short",
        day: "numeric",
      }),
    ),
    datasets: [
      {
        label: "Price",
        data: prices,
        borderColor: "#2563eb",
        backgroundColor: "rgba(37,99,235,0.07)",
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: "#2563eb",
        pointHoverRadius: 6,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) => `৳${ctx.raw.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 }, color: "#9ca3af" },
      },
      y: {
        grid: { color: "rgba(0,0,0,0.05)" },
        min: Math.floor(lowest * 0.98),
        ticks: {
          callback: (v: any) => "৳" + Number(v).toLocaleString(),
          font: { size: 11 },
          color: "#9ca3af",
        },
      },
    },
  };

  return (
    <div className="ph-wrapper">
      {productName && <p className="ph-product-name">{productName}</p>}

      <div className="ph-stats">
        <div className="ph-stat">
          <span className="ph-stat-label">Current</span>
          <span className="ph-stat-value">৳{current.toLocaleString()}</span>
        </div>
        <div className="ph-stat">
          <span className="ph-stat-label">{days}d Low</span>
          <span className="ph-stat-value ph-green">
            ৳{lowest.toLocaleString()}
          </span>
        </div>
        <div className="ph-stat">
          <span className="ph-stat-label">{days}d High</span>
          <span className="ph-stat-value ph-red">
            ৳{highest.toLocaleString()}
          </span>
        </div>
        <div className="ph-stat">
          <span className="ph-stat-label">{days}d Change</span>
          <span className={`ph-stat-value ${isDown ? "ph-green" : "ph-red"}`}>
            {isDown ? "▼" : "▲"} {Math.abs(Number(diffPercent))}%
          </span>
        </div>
      </div>

      {isPartial && (
        <div className="ph-partial-notice">
          ⚠️ Only {recordedDays} day{recordedDays !== 1 ? "s" : ""} of data
          available — more will appear as we track prices daily.
        </div>
      )}

      <div className="ph-chart-wrapper">
        <Line data={data} options={options as any} />
      </div>

      <div
        className={`ph-insight ${diff === 0 ? "ph-insight-neutral" : isDown ? "ph-insight-good" : "ph-insight-bad"}`}
      >
        {diff === 0
          ? `Price stable at ৳${current.toLocaleString()} — no changes in ${isPartial ? recordedDays : days} days.`
          : isDown
            ? `Price dropped ৳${Math.abs(diff).toLocaleString()} in ${isPartial ? recordedDays : days} days — good time to buy!`
            : `Price increased ৳${diff.toLocaleString()} in ${isPartial ? recordedDays : days} days — wait for a drop.`}
      </div>
    </div>
  );
}
