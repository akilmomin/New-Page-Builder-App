"use client";

import React from "react";
import type { ComponentDefinition } from "../../../models/pageBuilder";
import { LAYOUT_PRESETS } from "../../../models/pageBuilder";
import { useComponentPicker } from "../ComponentPicker/hook/useComponentPicker";
import {
  addPanelStyle,
  addPanelHeaderStyle,
  addPanelCloseStyle,
  groupLabelStyle,
  sectionPresetsGridStyle,
  sectionTileStyle,
  searchStyle,
  categoryLabelStyle,
  compGridStyle,
  compTileStyle,
  compTileHoverStyle,
} from "./styles";

const SECTION_PRESETS: { key: string; label: string; spans: readonly number[] }[] = [
  { key: "single",    label: "Full",        spans: LAYOUT_PRESETS.single },
  { key: "double",    label: "Half / Half", spans: LAYOUT_PRESETS.double },
  { key: "leftWide",  label: "Left Wide",   spans: LAYOUT_PRESETS.leftWide },
  { key: "rightWide", label: "Right Wide",  spans: LAYOUT_PRESETS.rightWide },
  { key: "triple",    label: "Thirds",      spans: LAYOUT_PRESETS.triple },
];

export const AddItemPanel: React.FC<{
  components: ComponentDefinition[];
  canNestSection: boolean;
  onAddComponent: (name: string) => void;
  onAddSection: (cols: readonly number[]) => void;
  onClose: () => void;
}> = ({ components, canNestSection, onAddComponent, onAddSection, onClose }) => {
  const { query, setQuery, grouped, hoveredTile, setHoveredTile } = useComponentPicker(components);

  return (
    <div style={{ position: "relative", zIndex: 9999 }}>
      {/* Transparent backdrop — closes panel on outside click */}
      <div
        style={{ position: "fixed", inset: 0, background: "transparent" }}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        style={addPanelStyle}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Add to column"
        data-pb-picker="add-item"
      >
        {/* Header */}
        <div style={addPanelHeaderStyle}>
          <span style={{ fontWeight: 600, fontSize: 13 }}>Add to Column</span>
          <button style={addPanelCloseStyle} onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Section presets (depth 0 only) */}
        {canNestSection && (
          <>
            <p style={groupLabelStyle}>Sections</p>
            <div style={sectionPresetsGridStyle}>
              {SECTION_PRESETS.map(({ key, label, spans }) => (
                <button
                  key={key}
                  style={sectionTileStyle}
                  onClick={() => { onAddSection(spans); onClose(); }}
                  title={label}
                  data-pb-section-preset={key}
                >
                  <div style={{ display: "flex", gap: 2, height: 20, marginBottom: 4, width: "100%" }}>
                    {spans.map((span, i) => (
                      <div
                        key={i}
                        style={{ flex: span, background: "var(--pb-accent, #0078d4)", opacity: 0.35, borderRadius: 2 }}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: 10, color: "var(--pb-text-muted, #666)", whiteSpace: "nowrap" }}>
                    {label}
                  </span>
                </button>
              ))}
            </div>
            <div style={{ borderTop: "1px solid var(--pb-border, #e0e0e0)", margin: "12px 0" }} />
          </>
        )}

        {/* Components */}
        <p style={groupLabelStyle}>Components</p>
        {components.length > 5 && (
          <input
            type="text"
            placeholder="Search…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={searchStyle}
            autoFocus={!canNestSection}
            aria-label="Search components"
          />
        )}

        <div style={{ overflowY: "auto", maxHeight: 260 }}>
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category} style={{ marginBottom: 10 }}>
              {Object.keys(grouped).length > 1 && (
                <p style={categoryLabelStyle}>{category}</p>
              )}
              <div style={compGridStyle}>
                {items.map((def) => (
                  <button
                    key={def.name}
                    style={{
                      ...compTileStyle,
                      ...(hoveredTile === def.name ? compTileHoverStyle : {}),
                    }}
                    onClick={() => { onAddComponent(def.name); onClose(); }}
                    onMouseEnter={() => setHoveredTile(def.name)}
                    onMouseLeave={() => setHoveredTile(null)}
                    title={def.description}
                    data-pb-component-tile={def.name}
                  >
                    {def.icon && (
                      <span style={{ fontSize: 20, lineHeight: 1, marginBottom: 4, display: "block" }}>
                        {def.icon}
                      </span>
                    )}
                    <span style={{ fontSize: 10, fontWeight: 500, color: "var(--pb-text, #333)", textAlign: "center", lineHeight: 1.3 }}>
                      {def.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}

          {Object.keys(grouped).length === 0 && (
            <p style={{ fontSize: 12, color: "var(--pb-text-muted, #888)", textAlign: "center", padding: "16px 0" }}>
              No components match.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
