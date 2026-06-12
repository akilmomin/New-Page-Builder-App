import type React from "react";

const controlsBarBase: React.CSSProperties = {
  position: "absolute",
  top: 4,
  zIndex: 20,
  display: "flex",
  gap: 4,
  background: "#fff",
  border: "1px solid var(--pb-border, #e0e0e0)",
  borderRadius: 6,
  padding: "2px 4px",
  boxShadow: "var(--pb-shadow, 0 2px 8px rgba(0,0,0,0.1))",
};

export const sectionControlsStyle: React.CSSProperties = { ...controlsBarBase, left: 4, pointerEvents: "none" };
export const componentControlsStyle: React.CSSProperties = { ...controlsBarBase, right: 4 };

export const emptySlotStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 60,
  border: "2px dashed var(--pb-border, #e0e0e0)",
  borderRadius: "var(--pb-radius-sm, 6px)",
  cursor: "pointer",
  transition: "border-color 0.15s, background 0.15s",
};

export const addMoreButtonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "4px 0",
  marginTop: 4,
  border: "1px dashed var(--pb-border, #e0e0e0)",
  borderRadius: "var(--pb-radius-sm, 6px)",
  cursor: "pointer",
  transition: "border-color 0.15s, background 0.15s",
};

export const addPanelStyle: React.CSSProperties = {
  position: "absolute",
  top: "calc(100% + 6px)",
  left: "50%",
  transform: "translateX(-50%)",
  background: "var(--pb-surface, #fff)",
  border: "1px solid var(--pb-border, #e0e0e0)",
  borderRadius: "var(--pb-radius, 10px)",
  boxShadow: "var(--pb-shadow, 0 8px 24px rgba(0,0,0,0.14))",
  padding: 16,
  minWidth: 280,
  maxWidth: 420,
  width: "max-content",
  zIndex: 1,
  boxSizing: "border-box",
};

export const addPanelHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 12,
};

export const addPanelCloseStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  fontSize: 16,
  color: "var(--pb-text-muted, #888)",
  lineHeight: 1,
  padding: "2px 4px",
};

export const groupLabelStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  color: "var(--pb-text-subtle, #aaa)",
  marginBottom: 6,
};

export const sectionPresetsGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(5, 1fr)",
  gap: 6,
};

export const sectionTileStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "6px 4px",
  background: "var(--pb-surface, #fff)",
  border: "1px solid var(--pb-border, #e0e0e0)",
  borderRadius: "var(--pb-radius-sm, 6px)",
  cursor: "pointer",
  width: "100%",
  boxSizing: "border-box",
  transition: "border-color 0.15s, background 0.15s",
};

export const searchStyle: React.CSSProperties = {
  width: "100%",
  padding: "6px 10px",
  fontSize: 12,
  border: "1px solid var(--pb-border, #e0e0e0)",
  borderRadius: "var(--pb-radius-sm, 6px)",
  marginBottom: 8,
  outline: "none",
  boxSizing: "border-box",
};

export const categoryLabelStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  color: "var(--pb-text-subtle, #aaa)",
  marginBottom: 6,
};

export const compGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(68px, 1fr))",
  gap: 8,
};

export const compTileStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "8px 4px",
  background: "var(--pb-surface, #fff)",
  border: "1px solid var(--pb-border, #e0e0e0)",
  borderRadius: "var(--pb-radius-sm, 6px)",
  cursor: "pointer",
  minHeight: 64,
  transition: "border-color 0.15s, background 0.15s",
};

export const compTileHoverStyle: React.CSSProperties = {
  borderColor: "var(--pb-accent, #0078d4)",
  background: "var(--pb-accent-light, #e8f2fb)",
};
