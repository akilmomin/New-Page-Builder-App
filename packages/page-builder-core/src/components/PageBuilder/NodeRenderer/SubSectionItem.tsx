"use client";

import React from "react";
import { NodeItem } from "./NodeRenderer";
import type { NodeItemProps } from "./NodeRenderer";
import { AddItemPanel } from "./AddItemPanel";
import { emptySlotStyle, addMoreButtonStyle } from "./styles";

export type { NodeItemProps };

export const SubSectionItem: React.FC<NodeItemProps> = ({ node, components, ctx, depth = 0 }) => {
  const isEmpty = !node.children || node.children.length === 0;
  const showAddPanel = ctx.popUpId === `add:${node.uniqueId}`;
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
