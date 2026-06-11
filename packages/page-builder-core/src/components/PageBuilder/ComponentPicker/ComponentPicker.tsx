import React from "react";
import type { ComponentDefinition, ComponentPickerRenderProps } from "../../../models/pageBuilder";
import { useComponentPicker } from "./hook/useComponentPicker";

interface ComponentPickerProps extends ComponentPickerRenderProps {
  className?: string;
}

export const ComponentPicker: React.FC<ComponentPickerProps> = ({
  components,
  onSelectComponent,
  onClose,
  className = "",
}) => {
  const { query, setQuery, grouped, hoveredTile, setHoveredTile } = useComponentPicker(components);

  return (
    <div
      role="dialog"
      aria-label="Select component"
      className={className}
      style={pickerWrapStyle}
      data-pb-picker="component"
    >
      <div style={backdropStyle} onClick={onClose} aria-hidden="true" />
      <div style={panelStyle}>
        <div style={headerStyle}>
          <span style={{ fontWeight: 600, fontSize: 13 }}>Add Component</span>
          <button style={closeButtonStyle} onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {components.length > 5 && (
          <input
            type="text"
            placeholder="Search components…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={searchStyle}
            autoFocus
            aria-label="Search components"
          />
        )}

        <div style={{ overflowY: "auto", maxHeight: 360 }}>
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category} style={{ marginBottom: 12 }}>
              {Object.keys(grouped).length > 1 && <p style={categoryLabelStyle}>{category}</p>}
              <div style={gridStyle}>
                {items.map((def) => (
                  <ComponentTile
                    key={def.name}
                    def={def}
                    hovered={hoveredTile === def.name}
                    onHover={setHoveredTile}
                    onSelect={() => {
                      onSelectComponent(def.name, def.defaultProps as Record<string, unknown> | undefined);
                      onClose();
                    }}
                  />
                ))}
              </div>
            </div>
          ))}

          {Object.keys(grouped).length === 0 && (
            <p
              style={{
                fontSize: 12,
                color: "var(--pb-text-muted, #888)",
                textAlign: "center",
                padding: "20px 0",
              }}
            >
              No components match your search.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── ComponentTile ────────────────────────────────────────────────────────────

interface ComponentTileProps {
  readonly def: ComponentDefinition;
  readonly hovered: boolean;
  readonly onHover: (name: string | null) => void;
  readonly onSelect: () => void;
}

const ComponentTile: React.FC<ComponentTileProps> = ({ def, hovered, onHover, onSelect }) => (
  <button
    style={{ ...tileStyle, ...(hovered ? tileHoverStyle : {}) }}
    onClick={onSelect}
    onMouseEnter={() => onHover(def.name)}
    onMouseLeave={() => onHover(null)}
    title={def.description}
    data-pb-component-tile={def.name}
  >
    {def.icon && (
      <span style={{ fontSize: 22, lineHeight: 1, marginBottom: 6, display: "block" }}>
        {def.icon}
      </span>
    )}
    <span
      style={{
        fontSize: 11,
        fontWeight: 500,
        color: "var(--pb-text, #333)",
        textAlign: "center",
        lineHeight: 1.3,
      }}
    >
      {def.label}
    </span>
  </button>
);

// ─── Styles ───────────────────────────────────────────────────────────────────

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
  minWidth: 280,
  maxWidth: 400,
  width: "max-content",
  zIndex: 1,
};
const headerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 10,
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
const searchStyle: React.CSSProperties = {
  width: "100%",
  padding: "6px 10px",
  fontSize: 12,
  border: "1px solid var(--pb-border, #e0e0e0)",
  borderRadius: "var(--pb-radius-sm, 6px)",
  marginBottom: 10,
  outline: "none",
  boxSizing: "border-box",
};
const categoryLabelStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  color: "var(--pb-text-subtle, #aaa)",
  marginBottom: 6,
};
const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))",
  gap: 8,
};
const tileStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "10px 6px",
  background: "var(--pb-surface, #fff)",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "var(--pb-border, #e0e0e0)",
  borderRadius: "var(--pb-radius-sm, 6px)",
  cursor: "pointer",
  transition: "border-color 0.15s, background 0.15s",
  minHeight: 72,
};
const tileHoverStyle: React.CSSProperties = {
  borderColor: "var(--pb-accent, #0078d4)",
  background: "var(--pb-accent-light, #e8f2fb)",
};
