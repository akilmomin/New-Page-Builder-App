"use client";

import React, { useState } from "react";
import type { ComponentDefinition, ILayoutData, PageNode } from "../../../models/pageBuilder";
import { LAYOUT_PRESETS } from "../../../models/pageBuilder";
import type { NodeRendererContext } from "./model/model";
import { LayoutPicker } from "../LayoutPicker";
import { ComponentPicker } from "../ComponentPicker";
import { GridLayout } from "../../GridLayout";

export type { NodeRendererContext };

interface NodeRendererProps {
  nodes: readonly PageNode[];
  components: ComponentDefinition[];
  ctx: NodeRendererContext;
  parentId?: string;
}

export const NodeRenderer: React.FC<NodeRendererProps> = ({ nodes, components, ctx, parentId }) => (
  <>
    {nodes.map((node, index) => (
      <NodeItem
        key={node.uniqueId}
        node={node}
        index={index}
        components={components}
        ctx={ctx}
        parentId={parentId}
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
}

const NodeItem: React.FC<NodeItemProps> = ({ node, index, components, ctx, parentId }) => {
  if (node.type === "Section")
    return (
      <SectionItem
        node={node}
        index={index}
        components={components}
        ctx={ctx}
        parentId={parentId}
      />
    );
  if (node.type === "SubSection")
    return <SubSectionItem node={node} index={index} components={components} ctx={ctx} />;
  if (node.type === "Component")
    return <ComponentItem node={node} components={components} ctx={ctx} />;
  return null;
};

// ─── Section ─────────────────────────────────────────────────────────────────

const SectionItem: React.FC<NodeItemProps> = ({ node, index, components, ctx, parentId }) => {
  const isActive = ctx.activeSectionId === node.uniqueId;
  const showAddAfter = ctx.popUpId === `after:${node.uniqueId}`;

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

  // Map each SubSection child to an ILayoutData entry for GridLayout
  const attributes: ILayoutData[] = (node.children ?? []).map((child, colIndex) => ({
    Id: child.uniqueId,
    SectionId: node.uniqueId,
    ColumnIndex: colIndex,
    ComponentName: "",
    renderComponent: () => (
      <SubSectionItem
        node={child}
        index={colIndex}
        components={components}
        ctx={ctx}
        parentId={node.uniqueId}
      />
    ),
  }));

  // Derive column spans from each SubSection's gridValue (12-col grid)
  const columnSpans = (node.children ?? []).map((child) => Number(child.gridValue) || 12);

  return (
    // Outer wrapper owns the hover — controls are inside it so mouse stays "in bounds"
    <div
      style={{ position: "relative", marginBottom: 8 }}
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
        <GridLayout attributes={attributes} columnSpans={columnSpans} gapPx={16} />

        {/* Controls overlaid inside the section so hover stays active */}
        {ctx.isEditMode && isActive && (
          <div style={sectionControlsStyle}>
            <CtrlButton
              title="Change layout"
              onClick={(e) => {
                e.stopPropagation();
                ctx.onSetPopUp(
                  ctx.popUpId === `layout:${node.uniqueId}` ? null : `layout:${node.uniqueId}`,
                );
              }}
            >
              ⊞
            </CtrlButton>
            <CtrlButton
              title="Clone section"
              onClick={(e) => {
                e.stopPropagation();
                ctx.onCloneNode(node.uniqueId);
              }}
            >
              ⧉
            </CtrlButton>
            <CtrlButton
              title="Delete section"
              danger
              onClick={(e) => {
                e.stopPropagation();
                ctx.onDeleteNode(node.uniqueId);
              }}
            >
              ✕
            </CtrlButton>
          </div>
        )}

        {/* Layout picker — opens when ⊞ is clicked */}
        {ctx.popUpId === `layout:${node.uniqueId}` && (
          <div style={{ position: "absolute", top: 36, right: 4, zIndex: 200 }}>
            <LayoutPicker
              presets={LAYOUT_PRESETS}
              onSelectLayout={(cols) => {
                ctx.onChangeLayout(node.uniqueId, cols);
                ctx.onSetPopUp(null);
              }}
              onClose={() => ctx.onSetPopUp(null)}
            />
          </div>
        )}
      </div>

      {/* Add section after divider */}
      {ctx.isEditMode && parentId && (
        <div style={{ position: "relative" }}>
          <AddAfterBar onClick={openAddAfter} />
          {showAddAfter && (
            <div style={{ position: "relative", zIndex: 100 }}>
              <LayoutPicker
                presets={LAYOUT_PRESETS}
                onSelectLayout={(cols) => {
                  ctx.onAddSectionAfter(parentId, index, cols);
                  ctx.onSetPopUp(null);
                }}
                onClose={() => ctx.onSetPopUp(null)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── SubSection ──────────────────────────────────────────────────────────────

const SubSectionItem: React.FC<NodeItemProps> = ({ node, components, ctx }) => {
  const isEmpty = !node.children || node.children.length === 0;
  const showPicker = ctx.popUpId === `add:${node.uniqueId}`;

  const openPicker = (e: React.MouseEvent) => {
    e.stopPropagation();
    ctx.onSetPopUp(`add:${node.uniqueId}`);
  };

  return (
    <div
      data-pb-subsection={node.uniqueId}
      style={{ minHeight: ctx.isEditMode ? 60 : undefined, boxSizing: "border-box" }}
    >
      {node.children?.map((child, i) => (
        <NodeItem
          key={child.uniqueId}
          node={child}
          index={i}
          components={components}
          ctx={ctx}
          parentId={node.uniqueId}
        />
      ))}

      {/* Empty slot: add component button */}
      {ctx.isEditMode && isEmpty && (
        <div style={{ position: "relative" }}>
          <div style={emptySlotStyle} onClick={openPicker}>
            <span style={{ fontSize: 20, opacity: 0.4 }}>+</span>
          </div>
          {showPicker && (
            <ComponentPicker
              components={components}
              onSelectComponent={(name) => {
                ctx.onAddComponent(node.uniqueId, name);
                ctx.onSetPopUp(null);
              }}
              onClose={() => ctx.onSetPopUp(null)}
            />
          )}
        </div>
      )}
    </div>
  );
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
      {ctx.isEditMode && isActive && (
        <div style={componentControlsStyle}>
          <CtrlButton
            title="Clone"
            onClick={(e) => {
              e.stopPropagation();
              ctx.onCloneNode(node.uniqueId);
            }}
          >
            ⧉
          </CtrlButton>
          <CtrlButton
            title="Delete"
            danger
            onClick={(e) => {
              e.stopPropagation();
              ctx.onDeleteNode(node.uniqueId);
            }}
          >
            ✕
          </CtrlButton>
        </div>
      )}
      <Component {...(node.componentProps as object)} editMode={ctx.isEditMode} />
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

// Section controls: top-LEFT corner
const sectionControlsStyle: React.CSSProperties = { ...controlsBarBase, left: 4 };

// Component controls: top-RIGHT corner
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
