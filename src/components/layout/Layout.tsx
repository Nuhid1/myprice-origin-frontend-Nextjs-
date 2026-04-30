import React from "react";
import "./Layout.css";

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <div className="header-title-wrapper">
            <svg
              className="header-icon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <h1 className="header-title">MyPrice BD</h1>
          </div>
          <p className="header-subtitle">
            Search products across multiple stores in BD
          </p>
        </div>
      </header>

      {children}

      <footer className="app-footer">
        <div className="footer-content">
          <div style={{ marginBottom: "1rem" }}>
            <span className="footer-brand">Chetaa</span>
          </div>
          <p className="footer-text">
            © {new Date().getFullYear()} Chetaa. All rights reserved.
          </p>
          <p className="footer-tagline">
            Helping you find the best prices across Bangladesh.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
