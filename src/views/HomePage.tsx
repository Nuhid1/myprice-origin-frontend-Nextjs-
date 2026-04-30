"use client";

import React from "react";
import Link from "next/link";
import "./style/home.css";

const HomePage: React.FC = () => {
  return (
    <div className="homepage">
      <nav className="navbar">
        <h2 className="logo">MyPrice BD</h2>
        <Link href="/">
          <button className="nav-btn">Search</button>
        </Link>
      </nav>

      <section className="hero">
        <h1 className="hero-title">
          Compare Prices Across Bangladesh Instantly
        </h1>
        <p className="hero-subtitle">
          Find the best deals from StarTech, Daraz, Gadget & Gear, Computer
          Village and more — all in one place.
        </p>

        <Link href="/">
          <button className="cta-btn">Start Searching</button>
        </Link>
      </section>

      <section className="features">
        <div className="feature-card">
          <h3>⚡ Fast Search</h3>
          <p>Get real-time product prices within seconds.</p>
        </div>

        <div className="feature-card">
          <h3>📊 Smart Comparison</h3>
          <p>Compare prices and choose the best deal instantly.</p>
        </div>

        <div className="feature-card">
          <h3>🏪 Multiple Stores</h3>
          <p>Aggregates top tech stores in Bangladesh automatically.</p>
        </div>
      </section>

      <footer className="footer">
        © {new Date().getFullYear()} MyPrice. Built in Bangladesh.
      </footer>
    </div>
  );
};

export default HomePage;
