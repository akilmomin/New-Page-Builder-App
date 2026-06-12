"use client";

import React, { useState } from "react";

export const CtrlButton: React.FC<{
  title: string;
  danger?: boolean;
  onClick: (e: React.MouseEvent) => void;
  children: React.ReactNode;
}> = ({ title, danger, onClick, children }) => {
  const [hov, setHov] = useState(false);
  return (
    <button
      title={title}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? (danger ? "#fee2e2" : "#e8f2fb") : "#fff",
        border: "1px solid var(--pb-border, #e0e0e0)",
        borderRadius: 4,
        padding: "2px 6px",
        cursor: "pointer",
        fontSize: 12,
        color: hov && danger ? "#dc2626" : "var(--pb-text-muted, #666)",
        lineHeight: 1.5,
        transition: "background 0.1s, color 0.1s",
        pointerEvents: "auto",
      }}
    >
      {children}
    </button>
  );
};

export const AddAfterBar: React.FC<{ onClick: (e: React.MouseEvent) => void }> = ({ onClick }) => {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "4px 0",
        cursor: "pointer",
        opacity: hov ? 1 : 0.3,
        transition: "opacity 0.15s",
      }}
    >
      <div style={{ flex: 1, height: 1, background: "var(--pb-accent, #0078d4)" }} />
      <span style={{ fontSize: 14, color: "var(--pb-accent, #0078d4)", fontWeight: 600 }}>+</span>
      <div style={{ flex: 1, height: 1, background: "var(--pb-accent, #0078d4)" }} />
    </div>
  );
};
