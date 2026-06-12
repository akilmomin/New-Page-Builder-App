"use client";

import React from "react";
import type { ComponentDefinition, PageNode } from "../../../models/pageBuilder";
import type { NodeRendererContext } from "./model/model";
import { evaluateConditions } from "./evaluateConditions";
import { CtrlButton } from "./CtrlButton";
import { componentControlsStyle } from "./styles";

export const ComponentItem: React.FC<{
  node: PageNode;
  components: ComponentDefinition[];
  ctx: NodeRendererContext;
}> = ({ node, components, ctx }) => {
  const isActive = ctx.activeComponentId === node.uniqueId;
  const def = components.find((c) => c.name === node.componentName);
  if (!def) return null;

  const { isReadonly, isHidden } = evaluateConditions(node.conditions, ctx.fieldValues);
  if (isHidden && !ctx.isEditMode) return null;

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
        ...(isHidden && ctx.isEditMode ? { opacity: 0.35 } : {}),
      }}
    >
      <Component
        {...(node.componentProps as object)}
        editMode={ctx.isEditMode}
        isReadonly={isReadonly}
        fieldValues={ctx.fieldValues}
        onFieldChange={ctx.onFieldChange}
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
