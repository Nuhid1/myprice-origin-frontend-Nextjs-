import { useState, useEffect } from "react";
import { Product } from "../types/product";
import "./ShareModal.css";

interface ShareModalProps {
  product: Product;
  onClose: () => void;
}

const ShareModal = ({ product, onClose }: ShareModalProps) => {
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState("");

  const shareUrl = `${window.location.origin}/product/${product.id}`;
  const shareTitle = `Check out ${product.name}!`;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  // Save to sessionStorage so ProductPage can read it instantly
  // when opened in a new tab on the same device
  useEffect(() => {
    try {
      sessionStorage.setItem(`product_${product.id}`, JSON.stringify(product));
    } catch {
      // private mode or storage full — silently ignore
    }
  }, [product]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      // Fallback for older browsers / HTTP
      const el = document.createElement("textarea");
      el.value = shareUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const platforms = [
    {
      name: "WhatsApp",
      bg: "#25D366",
      emoji: "💬",
      action: () =>
        window.open(
          `https://wa.me/?text=${encodeURIComponent(shareTitle + " " + shareUrl)}`,
        ),
    },
    {
      name: "Messenger",
      bg: "#0084FF",
      emoji: "✉️",
      action: () =>
        window.open(
          `https://www.facebook.com/dialog/send?link=${encodeURIComponent(shareUrl)}&app_id=YOUR_FB_APP_ID&redirect_uri=${encodeURIComponent(shareUrl)}`,
        ),
    },
    {
      name: "Instagram",
      bg: "#E1306C",
      emoji: "📷",
      action: () => {
        copyLink();
        showToast("Link copied — paste it in your Instagram story or DM 📸");
      },
    },
    {
      name: "Telegram",
      bg: "#29B6F6",
      emoji: "📨",
      action: () =>
        window.open(
          `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
        ),
    },
    {
      name: "Facebook",
      bg: "#1877F2",
      emoji: "👍",
      action: () =>
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
        ),
    },
    {
      name: "X / Twitter",
      bg: "#000000",
      emoji: "🐦",
      action: () =>
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`,
        ),
    },
    {
      name: "Email",
      bg: "#EA4335",
      emoji: "📧",
      action: () =>
        window.open(
          `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareUrl)}`,
        ),
    },
    {
      name: "More",
      bg: "#e5e7eb",
      emoji: "⋯",
      isMore: true,
      action: () => {
        if (navigator.share) {
          navigator.share({ title: shareTitle, url: shareUrl });
        } else {
          copyLink();
        }
      },
    },
  ];

  return (
    <div className="sm-overlay" onClick={onClose}>
      <div className="sm-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sm-header">
          <span className="sm-title">Share product</span>
          <button className="sm-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <p className="sm-product-name">{product.name}</p>

        <div className="sm-grid">
          {platforms.map((p) => (
            <button key={p.name} className="sm-platform-btn" onClick={p.action}>
              <span
                className="sm-icon"
                style={{
                  background: p.bg,
                  color: p.isMore ? "#374151" : "white",
                }}
              >
                {p.emoji}
              </span>
              <span className="sm-label">{p.name}</span>
            </button>
          ))}
        </div>

        <div className="sm-divider">or copy link</div>

        <div className="sm-copy-row">
          <span className="sm-url">{shareUrl}</span>
          <button
            className={`sm-copy-btn ${copied ? "sm-copy-btn--done" : ""}`}
            onClick={copyLink}
          >
            {copied ? "✓ Copied" : "Copy"}
          </button>
        </div>
      </div>
      {toast && <div className="sm-toast">{toast}</div>}
    </div>
  );
};

export default ShareModal;
