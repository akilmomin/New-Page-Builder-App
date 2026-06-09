"use client";

import React, { useState } from "react";
import type { ComponentDefinition, ILayoutData, PageNode } from "../../../models/pageBuilder";
import { LAYOUT_PRESETS } from "../../../models/pageBuilder";
import type { NodeRendererContext } from "./model/model";
import { LayoutPicker } from "../LayoutPicker";
import { GridLayout } from "../../GridLayout";
import { useComponentPicker } from "../ComponentPicker/hook/useComponentPicker";

export type { NodeRendererContext };

// ─── Section preset options shown inside AddItemPanel ─────────────────────────

const SECTION_PRESETS: { key: string; label: string; spans: readonly number[] }[] = [
  { key: "single",     label: "Full",         spans: LAYOUT_PRESETS.single },
  { key: "double",     label: "Half / Half",  spans: LAYOUT_PRESETS.double },
  { key: "leftWide",   label: "Left Wide",    spans: LAYOUT_PRESETS.leftWide },
  { key: "rightWide",  label: "Right Wide",   spans: LAYOUT_PRESETS.rightWide },
  { key: "triple",     label: "Thirds",       spans: LAYOUT_PRESETS.triple },
];

// ─── Unified "Add to Column" panel ───────────────────────────────────────────

const AddItemPanel: React.FC<{
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

        {/* ── Section presets (depth 0 only) ──────────────────────────────── */}
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

        {/* ── Components ───────────────────────────────────────────────────── */}
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

// ─── NodeRenderer ─────────────────────────────────────────────────────────────

interface NodeRendererProps {
  nodes: readonly PageNode[];
  components: ComponentDefinition[];
  ctx: NodeRendererContext;
  parentId?: string;
  /** Section nesting depth — 0 = root level, 1 = inside a column. Default: 0. */
  depth?: number;
}

export const NodeRenderer: React.FC<NodeRendererProps> = ({
  nodes,
  components,
  ctx,
  parentId,
  depth = 0,
}) => (
  <>
    {nodes.map((node, index) => (
      <NodeItem
        key={node.uniqueId}
        node={node}
        index={index}
        components={components}
        ctx={ctx}
        parentId={parentId}
        depth={depth}
      />
    ))}
  </>
);

// ─── Internal recursive node ──────────────────────────────────────────────────

interface NodeItemProps {
  node: PageNode;
  index: number;
  components: ComponentDefinition[];
  ctx: NodeRendererContext;
  parentId?: string;
  depth?: number;
}

const NodeItem: React.FC<NodeItemProps> = ({ node, index, components, ctx, parentId, depth = 0 }) => {
  if (node.type === "Section")
    return (
      <SectionItem
        node={node}
        index={index}
        components={components}
        ctx={ctx}
        parentId={parentId}
        depth={depth}
      />
    );
  if (node.type === "SubSection")
    return (
      <SubSectionItem node={node} index={index} components={components} ctx={ctx} depth={depth} />
    );
  if (node.type === "Component")
    return <ComponentItem node={node} components={components} ctx={ctx} />;
  return null;
};

// ─── Section ─────────────────────────────────────────────────────────────────

const SectionItem: React.FC<NodeItemProps> = ({ node, index, components, ctx, parentId, depth = 0 }) => {
  const isActive = ctx.activeSectionId === node.uniqueId;
  const showAddAfter = ctx.popUpId === `after:${node.uniqueId}`;
  const isLayoutPickerOpen = ctx.popUpId === `layout:${node.uniqueId}`;

  const handleMouseEnter = () => {
    if (ctx.isEditMode) ctx.onActivateSection(node.uniqueId);
  };
  const handleMouseLeave = () => {
    if (ctx.isEditMode) ctx.onActivateSection(null);
  };

  const openAddAfter = (e: React.MouseEvent) => {
    e.stopPropagation();
    ctx.onSetPopUp(`after:${node.uniqueId}`);
  };

  const toggleLayoutPicker = (e: React.MouseEvent) => {
    e.stopPropagation();
    ctx.onSetPopUp(isLayoutPickerOpen ? null : `layout:${node.uniqueId}`);
  };

  // Map each SubSection child to an ILayoutData entry for GridLayout
  const attributes: ILayoutData[] = (node.children ?? []).map((child, colIndex) => ({
    Id: child.uniqueId,
    SectionId: node.uniqueId,
    RowIndex: 0,
    ColumnIndex: colIndex,
    ComponentName: "",
    renderComponent: () => (
      <SubSectionItem
        node={child}
        index={colIndex}
        components={components}
        ctx={ctx}
        parentId={node.uniqueId}
        depth={depth}
      />
    ),
  }));

  const columnSpans = (node.children ?? []).map((child) => Number(child.gridValue) || 12);

  const renderLayoutPickerNode = (
    onSelectLayout: (cols: readonly number[]) => void,
  ): React.ReactNode => {
    const pickerProps = {
      presets: LAYOUT_PRESETS,
      onSelectLayout: (cols: readonly number[]) => {
        onSelectLayout(cols);
        ctx.onSetPopUp(null);
      },
      onClose: () => ctx.onSetPopUp(null),
    };
    return ctx.renderLayoutPicker ? (
      ctx.renderLayoutPicker(pickerProps)
    ) : (
      <LayoutPicker {...pickerProps} />
    );
  };

  const sectionContent = (
    <div
      style={{ position: "relative", marginBottom: ctx.spacing }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        data-pb-section={node.uniqueId}
        style={{
          position: "relative",
          outline:
            ctx.isEditMode && isActive
              ? "2px solid var(--pb-accent, #0078d4)"
              : "2px solid transparent",
          outlineOffset: 4,
          borderRadius: "var(--pb-radius, 8px)",
          transition: "outline-color 0.15s",
          minHeight: 40,
        }}
      >
        <GridLayout
          attributes={attributes}
          columnSpans={columnSpans}
          gapPx={ctx.spacing}
          componentGapPx={ctx.spacing}
          mobileBreakpoint={ctx.mobileBreakpoint}
          tabletBreakpoint={ctx.tabletBreakpoint}
          tabletMaxColumnsPerRow={ctx.tabletMaxColumnsPerRow}
          maxColumnsPerRow={ctx.maxColumnsPerRow}
        />

        {ctx.isEditMode && isActive && (
          ctx.renderSectionControls ? (
            ctx.renderSectionControls({
              nodeId: node.uniqueId,
              onClone: () => ctx.onCloneNode(node.uniqueId),
              onDelete: () => ctx.onDeleteNode(node.uniqueId),
              onChangeLayout: () => ctx.onSetPopUp(isLayoutPickerOpen ? null : `layout:${node.uniqueId}`),
              isLayoutPickerOpen,
            })
          ) : (
            <div style={sectionControlsStyle}>
              <CtrlButton title="Change layout" onClick={toggleLayoutPicker}>⊞</CtrlButton>
              <CtrlButton
                title="Clone section"
                onClick={(e) => { e.stopPropagation(); ctx.onCloneNode(node.uniqueId); }}
              >⧉</CtrlButton>
              <CtrlButton
                title="Delete section"
                danger
                onClick={(e) => { e.stopPropagation(); ctx.onDeleteNode(node.uniqueId); }}
              >✕</CtrlButton>
            </div>
          )
        )}

        {ctx.isEditMode && isLayoutPickerOpen &&
          renderLayoutPickerNode((cols) => ctx.onChangeLayout(node.uniqueId, cols))
        }
      </div>

      {/* Add section after — works for root sections (parentId="__root__") and nested (parentId=subsectionId) */}
      {ctx.isEditMode && parentId && (
        <div style={{ position: "relative" }}>
          <AddAfterBar onClick={openAddAfter} />
          {showAddAfter && (
            <div style={{ position: "relative", zIndex: 100 }}>
              {renderLayoutPickerNode((cols) => ctx.onAddSectionAfter(parentId, index, cols))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  return ctx.renderSectionWrapper
    ? <>{ctx.renderSectionWrapper({ nodeId: node.uniqueId, index, children: sectionContent })}</>
    : sectionContent;
};

// ─── SubSection ──────────────────────────────────────────────────────────────

const SubSectionItem: React.FC<NodeItemProps> = ({ node, components, ctx, depth = 0 }) => {
  const isEmpty = !node.children || node.children.length === 0;
  const showAddPanel = ctx.popUpId === `add:${node.uniqueId}`;
  // Root-level subsections (depth 0) can hold nested sections — one level max.
  const canNestSection = depth === 0;

  const openAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    ctx.onSetPopUp(`add:${node.uniqueId}`);
  };

  const subSectionContent = (
    <div
      data-pb-subsection={node.uniqueId}
      style={{ minHeight: ctx.isEditMode ? 60 : undefined, boxSizing: "border-box" }}
    >
      {/* Children — nested sections and components, stacked vertically */}
      <div style={{ display: "flex", flexDirection: "column", gap: ctx.spacing }}>
        {node.children?.map((child, i) => (
          <NodeItem
            key={child.uniqueId}
            node={child}
            index={i}
            components={components}
            ctx={ctx}
            parentId={node.uniqueId}
            depth={depth + 1}
          />
        ))}
      </div>

      {ctx.isEditMode && (
        <div style={{ position: "relative" }}>
          {/* Single "+ Add" entry point — opens unified or component-only panel */}
          {isEmpty ? (
            <div style={emptySlotStyle} onClick={openAdd}>
              <span style={{ fontSize: 20, opacity: 0.4 }}>+</span>
            </div>
          ) : (
            <div style={addMoreButtonStyle} onClick={openAdd}>
              <span style={{ fontSize: 12, opacity: 0.5 }}>+ Add</span>
            </div>
          )}

          {showAddPanel && (
            // When caller provides renderComponentPicker, forward onAddSection so their UI
            // can also offer section layout options (optional — callers may ignore it).
            // Otherwise use the built-in unified AddItemPanel.
            ctx.renderComponentPicker ? (
              ctx.renderComponentPicker({
                components,
                onSelectComponent: (name) => { ctx.onAddComponent(node.uniqueId, name); ctx.onSetPopUp(null); },
                onClose: () => ctx.onSetPopUp(null),
                ...(canNestSection && {
                  onAddSection: (cols) => { ctx.onAddSection(node.uniqueId, cols); ctx.onSetPopUp(null); },
                }),
              })
            ) : (
              <AddItemPanel
                components={components}
                canNestSection={canNestSection}
                onAddComponent={(name) => { ctx.onAddComponent(node.uniqueId, name); ctx.onSetPopUp(null); }}
                onAddSection={(cols) => { ctx.onAddSection(node.uniqueId, cols); ctx.onSetPopUp(null); }}
                onClose={() => ctx.onSetPopUp(null)}
              />
            )
          )}
        </div>
      )}
    </div>
  );

  return ctx.renderSubSectionWrapper
    ? <>{ctx.renderSubSectionWrapper({ nodeId: node.uniqueId, children: subSectionContent })}</>
    : subSectionContent;
};

// ─── Component ───────────────────────────────────────────────────────────────

const ComponentItem: React.FC<{
  node: PageNode;
  components: ComponentDefinition[];
  ctx: NodeRendererContext;
}> = ({ node, components, ctx }) => {
  const isActive = ctx.activeComponentId === node.uniqueId;
  const def = components.find((c) => c.name === node.componentName);
  if (!def) return null;

  const Component = def.component;
  return (
    <div
      data-pb-component={node.uniqueId}
      onClick={(e) => {
        if (ctx.isEditMode) {
          e.stopPropagation();
          ctx.onActivateComponent(node.uniqueId);
        }
      }}
      style={{
        position: "relative",
        outline:
          ctx.isEditMode && isActive
            ? "2px solid var(--pb-accent, #0078d4)"
            : "2px solid transparent",
        outlineOffset: 2,
        borderRadius: "var(--pb-radius-sm, 6px)",
        transition: "outline-color 0.15s",
        cursor: ctx.isEditMode ? "pointer" : "default",
      }}
    >
      <Component
        {...(node.componentProps as object)}
        editMode={ctx.isEditMode}
        onPropsChange={(patch: Record<string, unknown>) =>
          ctx.onUpdateComponentProps(node.uniqueId, patch)
        }
      />
      {ctx.isEditMode && isActive && (
        ctx.renderComponentControls ? (
          ctx.renderComponentControls({
            nodeId: node.uniqueId,
            onClone: () => ctx.onCloneNode(node.uniqueId),
            onDelete: () => ctx.onDeleteNode(node.uniqueId),
          })
        ) : (
          <div style={componentControlsStyle}>
            <CtrlButton
              title="Clone"
              onClick={(e) => { e.stopPropagation(); ctx.onCloneNode(node.uniqueId); }}
            >⧉</CtrlButton>
            <CtrlButton
              title="Delete"
              danger
              onClick={(e) => { e.stopPropagation(); ctx.onDeleteNode(node.uniqueId); }}
            >✕</CtrlButton>
          </div>
        )
      )}
    </div>
  );
};

// ─── Small helpers ────────────────────────────────────────────────────────────

const CtrlButton: React.FC<{
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

const AddAfterBar: React.FC<{ onClick: (e: React.MouseEvent) => void }> = ({ onClick }) => {
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

// ─── Styles ──────────────────────────────────────────────────────────────────

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

const sectionControlsStyle: React.CSSProperties = { ...controlsBarBase, left: 4, pointerEvents: "none" };
const componentControlsStyle: React.CSSProperties = { ...controlsBarBase, right: 4 };

const emptySlotStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 60,
  border: "2px dashed var(--pb-border, #e0e0e0)",
  borderRadius: "var(--pb-radius-sm, 6px)",
  cursor: "pointer",
  transition: "border-color 0.15s, background 0.15s",
};

const addMoreButtonStyle: React.CSSProperties = {
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

// AddItemPanel styles
const addPanelStyle: React.CSSProperties = {
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

const addPanelHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 12,
};

const addPanelCloseStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  fontSize: 16,
  color: "var(--pb-text-muted, #888)",
  lineHeight: 1,
  padding: "2px 4px",
};

const groupLabelStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  color: "var(--pb-text-subtle, #aaa)",
  marginBottom: 6,
};

const sectionPresetsGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(5, 1fr)",
  gap: 6,
};

const sectionTileStyle: React.CSSProperties = {
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

const searchStyle: React.CSSProperties = {
  width: "100%",
  padding: "6px 10px",
  fontSize: 12,
  border: "1px solid var(--pb-border, #e0e0e0)",
  borderRadius: "var(--pb-radius-sm, 6px)",
  marginBottom: 8,
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

const compGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(68px, 1fr))",
  gap: 8,
};

const compTileStyle: React.CSSProperties = {
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

const compTileHoverStyle: React.CSSProperties = {
  borderColor: "var(--pb-accent, #0078d4)",
  background: "var(--pb-accent-light, #e8f2fb)",
};
