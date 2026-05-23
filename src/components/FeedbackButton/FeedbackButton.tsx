"use client";
import React, { useState } from "react";
import emailjs from "@emailjs/browser";
import "./FeedbackButton.css";

// ── EmailJS config ── Fill these in after creating your EmailJS account ──
const EMAILJS_SERVICE_ID = "service_intwg5i"; // e.g. "service_abc123"
const EMAILJS_TEMPLATE_ID = "template_wzwwhnm"; // e.g. "template_xyz789"
const EMAILJS_PUBLIC_KEY = "3zonGkECFlcII6d32"; // e.g. "abcDEF123..."
// ────────────────────────────────────────────────────────────────────────

type Step = "closed" | "form" | "success";

export default function FeedbackButton() {
  const [step, setStep] = useState<Step>("closed");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSubmitting(true);
    setError("");

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name: name.trim() || "Anonymous",
          from_email: email.trim() || "Not provided",
          message: message.trim(),
          to_email: "nuhid96@gmail.com",
        },
        EMAILJS_PUBLIC_KEY,
      );
      setStep("success");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep("closed");
    setName("");
    setEmail("");
    setMessage("");
    setError("");
  };

  return (
    <>
      {/* Floating trigger button */}
      {step === "closed" && (
        <button
          className="fb-trigger"
          onClick={() => setStep("form")}
          aria-label="Give feedback"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      )}

      {/* Feedback panel */}
      {(step === "form" || step === "success") && (
        <div
          className="fb-panel"
          role="dialog"
          aria-modal="true"
          aria-label="Feedback form"
        >
          <div className="fb-panel-header">
            <span className="fb-panel-title">
              {step === "success" ? "Thank you!" : "Share your feedback"}
            </span>
            <button
              className="fb-close"
              onClick={handleClose}
              aria-label="Close"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {step === "form" && (
            <form className="fb-form" onSubmit={handleSubmit} noValidate>
              <div className="fb-field">
                <label className="fb-label" htmlFor="fb-name">
                  Name <span className="fb-optional">(optional)</span>
                </label>
                <input
                  id="fb-name"
                  className="fb-input"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />
              </div>

              <div className="fb-field">
                <label className="fb-label" htmlFor="fb-email">
                  Email <span className="fb-optional">(optional)</span>
                </label>
                <input
                  id="fb-email"
                  className="fb-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>

              <div className="fb-field">
                <label className="fb-label" htmlFor="fb-message">
                  Message <span className="fb-required">*</span>
                </label>
                <textarea
                  id="fb-message"
                  className="fb-textarea"
                  placeholder="Tell us what you think, report an issue, or suggest an improvement…"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>

              {error && <p className="fb-error">{error}</p>}

              <button
                className="fb-submit"
                type="submit"
                disabled={submitting || !message.trim()}
              >
                {submitting ? "Sending…" : "Send feedback"}
              </button>
            </form>
          )}

          {step === "success" && (
            <div className="fb-success">
              <div className="fb-success-icon">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <p className="fb-success-title">Thanks for your feedback!</p>
              <p className="fb-success-sub">
                We read every message and use it to improve MyPrice BD.
              </p>
              <button className="fb-submit" onClick={handleClose}>
                Done
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
