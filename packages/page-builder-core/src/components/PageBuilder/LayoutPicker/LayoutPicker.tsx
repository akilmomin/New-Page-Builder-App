import React, { useState } from "react";
import { LAYOUT_PRESETS } from "../../../models/pageBuilder";
import type { LayoutPickerRenderProps } from "../../../models/pageBuilder";

const PRESET_OPTIONS: {
  key: keyof typeof LAYOUT_PRESETS;
  label: string;
  visual: string[];
}[] = [
  { key: "single", label: "Full Width", visual: ["100%"] },
  { key: "double", label: "Two Columns", visual: ["50%", "50%"] },
  { key: "triple", label: "Three Columns", visual: ["33%", "33%", "33%"] },
  { key: "fourColumns", label: "Four Columns", visual: ["25%", "25%", "25%", "25%"] },
  { key: "leftWide", label: "Left 2/3", visual: ["66%", "33%"] },
  { key: "rightWide", label: "Right 2/3", visual: ["33%", "66%"] },
];

interface LayoutPickerProps extends LayoutPickerRenderProps {
  className?: string;
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
}) => {
  const [customMode, setCustomMode] = useState(false);
  const [customInput, setCustomInput] = useState("6,6");

  const customCols = parseCustomCols(customInput);
  const customColsVisual = customInput
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n) && n > 0);

  return (
    <div
      role="dialog"
      aria-label="Select section layout"
      className={className}
      style={pickerWrapStyle}
      data-pb-picker="layout"
    >
      <div style={backdropStyle} onClick={onClose} aria-hidden="true" />
      <div style={panelStyle}>
        <div style={panelHeaderStyle}>
          <span style={{ fontWeight: 600, fontSize: 13 }}>Select Layout</span>
          <button style={closeButtonStyle} onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div style={presetsGridStyle}>
          {PRESET_OPTIONS.map(({ key, label, visual }) => (
            <button
              key={key}
              style={presetButtonStyle}
              onClick={() => {
                onSelectLayout(LAYOUT_PRESETS[key]);
                onClose();
              }}
              title={label}
              data-pb-preset={key}
            >
              <div style={{ display: "flex", gap: 3, height: 28, marginBottom: 6 }}>
                {visual.map((w, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      background: "var(--pb-accent, #0078d4)",
                      opacity: 0.25,
                      borderRadius: 3,
                      width: w,
                    }}
                  />
                ))}
              </div>
              <span
                style={{ fontSize: 10, color: "var(--pb-text-muted, #666)", whiteSpace: "nowrap" }}
              >
                {label}
              </span>
            </button>
          ))}

          {/* Custom / Advanced button */}
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
                gap: 2,
                height: 28,
                marginBottom: 6,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontSize: 18, opacity: 0.4, lineHeight: 1 }}>⊞</span>
            </div>
            <span
              style={{ fontSize: 10, color: "var(--pb-text-muted, #666)", whiteSpace: "nowrap" }}
            >
              Custom
            </span>
          </button>
        </div>

        {/* Custom grid input panel */}
        {customMode && (
          <div style={customPanelStyle}>
            <p style={customHintStyle}>
              Enter column widths separated by commas — must sum to 12.
              <br />
              <em>e.g. 3,6,3 · 4,8 · 2,2,4,4</em>
            </p>

            {/* Live preview */}
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
  );
};

const pickerWrapStyle: React.CSSProperties = { position: "relative", zIndex: 9999 };
const backdropStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "transparent",
};
const panelStyle: React.CSSProperties = {
  position: "absolute",
  top: "calc(100% + 6px)",
  left: "50%",
  transform: "translateX(-50%)",
  background: "var(--pb-surface, #fff)",
  border: "1px solid var(--pb-border, #e0e0e0)",
  borderRadius: "var(--pb-radius, 10px)",
  boxShadow: "var(--pb-shadow, 0 8px 24px rgba(0,0,0,0.14))",
  padding: 16,
  minWidth: 340,
  zIndex: 1,
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
const presetsGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: 8,
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
  transition: "border-color 0.15s, background 0.15s",
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
