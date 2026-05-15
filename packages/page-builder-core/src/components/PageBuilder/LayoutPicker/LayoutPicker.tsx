import React, { useState } from "react";
import { LAYOUT_PRESETS } from "../../../models/pageBuilder";
import type { LayoutPickerRenderProps } from "../../../models/pageBuilder";

const PRESET_OPTIONS: {
  key: keyof typeof LAYOUT_PRESETS;
  label: string;
}[] = [
  { key: "single", label: "Full Width" },
  { key: "double", label: "Two Columns" },
  { key: "triple", label: "Three Columns" },
  { key: "fourColumns", label: "Four Columns" },
  { key: "leftWide", label: "Left 2/3" },
  { key: "rightWide", label: "Right 2/3" },
];

export interface LayoutPickerProps extends LayoutPickerRenderProps {
  className?: string;
  /**
   * Number of columns in the preset grid.
   * Defaults to auto-fill (responsive: 4 on wide, 3 on narrow).
   */
  columns?: number;
}

const parseCustomCols = (input: string): readonly number[] | null => {
  const parts = input
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n));
  if (parts.length < 1 || parts.some((p) => p < 1 || p > 12)) return null;
  if (parts.reduce((a, b) => a + b, 0) !== 12) return null;
  return parts;
};

export const LayoutPicker: React.FC<LayoutPickerProps> = ({
  onSelectLayout,
  onClose,
  className = "",
  columns,
}) => {
  const [customMode, setCustomMode] = useState(false);
  const [customInput, setCustomInput] = useState("6,6");

  const customCols = parseCustomCols(customInput);
  const customColsVisual = customInput
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n) && n > 0);

  const presetsGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: columns
      ? `repeat(${columns}, 1fr)`
      : "repeat(auto-fill, minmax(68px, 1fr))",
    gap: 8,
  };

  return (
    <div
      role="dialog"
      aria-label="Select section layout"
      className={className}
      style={wrapStyle}
      data-pb-picker="layout"
    >
      {/*
       * Backdrop: fixed full-screen overlay.
       * Also acts as the flex centering container for the panel —
       * no transform math needed, works at every viewport size.
       */}
      <div style={backdropStyle} onClick={onClose} aria-hidden="true">
        <div style={panelStyle} onClick={(e) => e.stopPropagation()}>
          <div style={panelHeaderStyle}>
            <span style={{ fontWeight: 600, fontSize: 13 }}>Select Layout</span>
            <button style={closeButtonStyle} onClick={onClose} aria-label="Close">
              ✕
            </button>
          </div>

          <div style={presetsGridStyle}>
            {PRESET_OPTIONS.map(({ key, label }) => {
              const spans = LAYOUT_PRESETS[key];
              return (
                <button
                  key={key}
                  style={presetButtonStyle}
                  onClick={() => {
                    onSelectLayout(spans);
                    onClose();
                  }}
                  title={label}
                  data-pb-preset={key}
                >
                  <div style={{ display: "flex", gap: 3, height: 28, marginBottom: 6, width: "100%" }}>
                    {spans.map((span, i) => (
                      <div
                        key={i}
                        style={{
                          flex: span,
                          background: "var(--pb-accent, #0078d4)",
                          opacity: 0.35,
                          borderRadius: 3,
                        }}
                      />
                    ))}
                  </div>
                  <span style={presetLabelStyle}>{label}</span>
                </button>
              );
            })}

            <button
              style={{
                ...presetButtonStyle,
                ...(customMode ? { borderColor: "var(--pb-accent, #0078d4)" } : {}),
              }}
              onClick={() => setCustomMode((m) => !m)}
              title="Custom layout"
              data-pb-preset="custom"
            >
              <div
                style={{
                  display: "flex",
                  height: 28,
                  marginBottom: 6,
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                }}
              >
                <span style={{ fontSize: 18, opacity: 0.4, lineHeight: 1 }}>⊞</span>
              </div>
              <span style={presetLabelStyle}>Custom</span>
            </button>
          </div>

          {customMode && (
            <div style={customPanelStyle}>
              <p style={customHintStyle}>
                Enter column widths separated by commas — must sum to 12.
                <br />
                <em>e.g. 3,6,3 · 4,8 · 2,2,4,4</em>
              </p>

              <div style={{ display: "flex", gap: 3, height: 22, marginBottom: 8 }}>
                {customColsVisual.map((w, i) => (
                  <div
                    key={i}
                    style={{
                      flex: w,
                      background: customCols
                        ? "var(--pb-accent, #0078d4)"
                        : "var(--pb-border, #e0e0e0)",
                      opacity: customCols ? 0.3 : 0.5,
                      borderRadius: 3,
                      transition: "background 0.15s",
                    }}
                  />
                ))}
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="e.g. 3,6,3"
                  style={customInputStyle}
                  aria-label="Custom column widths"
                />
                <button
                  disabled={!customCols}
                  onClick={() => {
                    if (customCols) {
                      onSelectLayout(customCols);
                      onClose();
                    }
                  }}
                  style={{
                    ...applyButtonStyle,
                    opacity: customCols ? 1 : 0.4,
                    cursor: customCols ? "pointer" : "not-allowed",
                  }}
                >
                  Apply
                </button>
              </div>
              {!customCols && customInput.trim() && (
                <p style={{ fontSize: 10, color: "#dc2626", marginTop: 4 }}>
                  Values must be positive integers summing to 12.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const wrapStyle: React.CSSProperties = { position: "relative" };

/**
 * Fixed full-screen overlay.
 * `display:flex` + `alignItems/justifyContent:center` handles all centering —
 * no transform math, safe against CSS-transform ancestors.
 * `padding` keeps the panel away from viewport edges on small screens.
 */
const backdropStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 9998,
  background: "rgba(0, 0, 0, 0.18)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 12,
  boxSizing: "border-box",
};

/**
 * Panel is a normal flex child of the backdrop — no positioning props needed.
 * `width:100%` fills the backdrop's padded area; `maxWidth` caps it at 380 px.
 * Result: 380 px on desktop, full-width-minus-24 px on narrow screens.
 */
const panelStyle: React.CSSProperties = {
  background: "var(--pb-surface, #fff)",
  border: "1px solid var(--pb-border, #e0e0e0)",
  borderRadius: "var(--pb-radius, 10px)",
  boxShadow: "var(--pb-shadow, 0 8px 24px rgba(0,0,0,0.18))",
  padding: 16,
  width: "100%",
  maxWidth: 380,
  maxHeight: "calc(100vh - 48px)",
  overflowY: "auto",
  boxSizing: "border-box",
};

const panelHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 12,
};

const closeButtonStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  fontSize: 16,
  color: "var(--pb-text-muted, #888)",
  lineHeight: 1,
  padding: "2px 4px",
};

const presetButtonStyle: React.CSSProperties = {
  background: "var(--pb-surface, #fff)",
  border: "1px solid var(--pb-border, #e0e0e0)",
  borderRadius: "var(--pb-radius-sm, 6px)",
  padding: "8px 6px",
  cursor: "pointer",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  width: "100%",
  boxSizing: "border-box",
  transition: "border-color 0.15s, background 0.15s",
};

const presetLabelStyle: React.CSSProperties = {
  fontSize: 10,
  color: "var(--pb-text-muted, #666)",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  maxWidth: "100%",
};

const customPanelStyle: React.CSSProperties = {
  marginTop: 12,
  paddingTop: 12,
  borderTop: "1px solid var(--pb-border, #e0e0e0)",
};

const customHintStyle: React.CSSProperties = {
  fontSize: 11,
  color: "var(--pb-text-muted, #888)",
  marginBottom: 8,
  lineHeight: 1.5,
};

const customInputStyle: React.CSSProperties = {
  flex: 1,
  padding: "5px 8px",
  fontSize: 12,
  border: "1px solid var(--pb-border, #e0e0e0)",
  borderRadius: "var(--pb-radius-sm, 6px)",
  outline: "none",
};

const applyButtonStyle: React.CSSProperties = {
  padding: "5px 12px",
  fontSize: 12,
  background: "var(--pb-accent, #0078d4)",
  color: "#fff",
  border: "none",
  borderRadius: "var(--pb-radius-sm, 6px)",
  transition: "opacity 0.15s",
};
