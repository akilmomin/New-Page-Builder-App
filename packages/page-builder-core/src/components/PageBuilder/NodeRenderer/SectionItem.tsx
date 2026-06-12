"use client";

import React from "react";
import type { ILayoutData } from "../../../models/pageBuilder";
import { LAYOUT_PRESETS } from "../../../models/pageBuilder";
import type { NodeItemProps } from "./NodeRenderer";
import { SubSectionItem } from "./SubSectionItem";
import { CtrlButton, AddAfterBar } from "./CtrlButton";
import { sectionControlsStyle } from "./styles";
import { GridLayout } from "../../GridLayout";
import { LayoutPicker } from "../LayoutPicker";

export const SectionItem: React.FC<NodeItemProps> = ({ node, index, components, ctx, parentId, depth = 0 }) => {
  const isActive = ctx.activeSectionId === node.uniqueId;
  const showAddAfter = ctx.popUpId === `after:${node.uniqueId}`;
  const isLayoutPickerOpen = ctx.popUpId === `layout:${node.uniqueId}`;

  const handleMouseEnter = () => { if (ctx.isEditMode) ctx.onActivateSection(node.uniqueId); };
  const handleMouseLeave = () => { if (ctx.isEditMode) ctx.onActivateSection(null); };

  const openAddAfter = (e: React.MouseEvent) => {
    e.stopPropagation();
    ctx.onSetPopUp(`after:${node.uniqueId}`);
  };

  const toggleLayoutPicker = (e: React.MouseEvent) => {
    e.stopPropagation();
    ctx.onSetPopUp(isLayoutPickerOpen ? null : `layout:${node.uniqueId}`);
  };

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

  const renderLayoutPickerNode = (onSelectLayout: (cols: readonly number[]) => void): React.ReactNode => {
    const pickerProps = {
      presets: LAYOUT_PRESETS,
      onSelectLayout: (cols: readonly number[]) => { onSelectLayout(cols); ctx.onSetPopUp(null); },
      onClose: () => ctx.onSetPopUp(null),
    };
    return ctx.renderLayoutPicker ? ctx.renderLayoutPicker(pickerProps) : <LayoutPicker {...pickerProps} />;
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
          outline: ctx.isEditMode && isActive ? "2px solid var(--pb-accent, #0078d4)" : "2px solid transparent",
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
              <CtrlButton title="Clone section" onClick={(e) => { e.stopPropagation(); ctx.onCloneNode(node.uniqueId); }}>⧉</CtrlButton>
              <CtrlButton title="Delete section" danger onClick={(e) => { e.stopPropagation(); ctx.onDeleteNode(node.uniqueId); }}>✕</CtrlButton>
            </div>
          )
        )}

        {ctx.isEditMode && isLayoutPickerOpen &&
          renderLayoutPickerNode((cols) => ctx.onChangeLayout(node.uniqueId, cols))
        }
      </div>

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
