import React from "react";
import { LAYOUT_PRESETS } from "../../../models/pageBuilder";
import type { LayoutPickerRenderProps } from "../../../models/pageBuilder";

const PRESET_OPTIONS: {
  key: keyof typeof LAYOUT_PRESETS;
  label: string;
  visual: string[];
}[] = [
  { key: "single",    label: "Full Width",    visual: ["100%"] },
  { key: "double",    label: "Two Columns",   visual: ["50%", "50%"] },
  { key: "triple",    label: "Three Columns", visual: ["33%", "33%", "33%"] },
  { key: "leftWide",  label: "Left 2/3",      visual: ["66%", "33%"] },
  { key: "rightWide", label: "Right 2/3",     visual: ["33%", "66%"] },
];

interface LayoutPickerProps extends LayoutPickerRenderProps {
  className?: string;
}

export const LayoutPicker: React.FC<LayoutPickerProps> = ({
  onSelectLayout,
  onClose,
  className = "",
}) => (
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
        <button style={closeButtonStyle} onClick={onClose} aria-label="Close">✕</button>
      </div>
      <div style={presetsGridStyle}>
        {PRESET_OPTIONS.map(({ key, label, visual }) => (
          <button
            key={key}
            style={presetButtonStyle}
            onClick={() => { onSelectLayout(LAYOUT_PRESETS[key]); onClose(); }}
            title={label}
            data-pb-preset={key}
          >
            <div style={{ display: "flex", gap: 3, height: 28, marginBottom: 6 }}>
              {visual.map((w, i) => (
                <div key={i} style={{ flex: 1, background: "var(--pb-accent, #0078d4)", opacity: 0.25, borderRadius: 3, width: w }} />
              ))}
            </div>
            <span style={{ fontSize: 10, color: "var(--pb-text-muted, #666)", whiteSpace: "nowrap" }}>
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  </div>
);

const pickerWrapStyle: React.CSSProperties  = { position: "relative", zIndex: 9999 };
const backdropStyle: React.CSSProperties    = { position: "fixed", inset: 0, background: "transparent" };
const panelStyle: React.CSSProperties = {
  position: "absolute", top: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)",
  background: "var(--pb-surface, #fff)", border: "1px solid var(--pb-border, #e0e0e0)",
  borderRadius: "var(--pb-radius, 10px)", boxShadow: "var(--pb-shadow, 0 8px 24px rgba(0,0,0,0.14))",
  padding: 16, minWidth: 300, zIndex: 1,
};
const panelHeaderStyle: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 };
const closeButtonStyle: React.CSSProperties = { background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "var(--pb-text-muted, #888)", lineHeight: 1, padding: "2px 4px" };
const presetsGridStyle: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 };
const presetButtonStyle: React.CSSProperties = {
  background: "var(--pb-surface, #fff)", border: "1px solid var(--pb-border, #e0e0e0)",
  borderRadius: "var(--pb-radius-sm, 6px)", padding: "8px 6px", cursor: "pointer",
  display: "flex", flexDirection: "column", alignItems: "center", transition: "border-color 0.15s, background 0.15s",
};
