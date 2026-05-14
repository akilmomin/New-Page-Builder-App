"use client";

import React, { useImperativeHandle, forwardRef } from "react";
import { LAYOUT_PRESETS } from "../../../models/pageBuilder";
import type { PageBuilderProps, PageBuilderHandle } from "./model/model";
import { usePageBuilder } from "./hook/usePageBuilder";
import { serializeLayout, nodesToLayoutData } from "../../../utils/layoutDataOps";
import { NodeRenderer } from "../NodeRenderer";
import { LayoutPicker } from "../LayoutPicker";

export const PageBuilder = forwardRef<PageBuilderHandle, PageBuilderProps>(
  (
    {
      components,
      value,
      onChange,
      defaultValue,
      editMode,
      onEditModeChange,
      spacing = 0,
      onSaveChange,
      renderAddTrigger,
      renderLayoutPicker,
      classNames = {},
      style,
    },
    ref,
  ) => {
    const pb = usePageBuilder({ value, onChange, defaultValue, editMode, onEditModeChange });

    const handleSave =  () => onSaveChange?.(serializeLayout(nodesToLayoutData(pb.nodes)))
    

    useImperativeHandle(ref, () => ({
      reset: pb.resetLayout,
      save: () => handleSave?.(),
    }));

    const ctx = {
      isEditMode: pb.isEditMode,
      activeSectionId: pb.activeSectionId,
      activeComponentId: pb.activeComponentId,
      popUpId: pb.popUpId,
      showSection: pb.showSection,
      spacing,
      onActivateSection: pb.setActiveSection,
      onActivateComponent: pb.setActiveComponent,
      onSetPopUp: pb.setPopUp,
      onSetShowSection: pb.setShowSection,
      onAddSection: pb.addSection,
      onAddSectionAfter: pb.addSectionAfter,
      onAddComponent: pb.addComponent,
      onChangeLayout: pb.changeLayout,
      onDeleteNode: pb.deleteNode,
      onCloneNode: pb.cloneNode,
    };

    const handleAddRootClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      pb.setPopUp("__root__");
    };

    return (
      <div data-pb-root className={classNames.root} style={style}>
        <div
          data-pb-canvas
          className={classNames.canvas}
          onClick={() => {
            if (pb.isEditMode) pb.setActiveComponent(null);
          }}
        >
          {pb.nodes.length === 0 && pb.isEditMode && (
            <div
              data-pb-empty
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 200,
                gap: 12,
              }}
            >
              <p style={{ color: "var(--pb-text-muted, #888)", fontSize: 14 }}>
                Your page is empty. Add a section to get started.
              </p>
            </div>
          )}

          {pb.nodes.length > 0 && (
            <NodeRenderer nodes={pb.nodes} components={components} ctx={ctx} parentId="__root__" />
          )}

          {pb.isEditMode && (
            <div
              style={{
                position: "relative",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 8,
                padding: "12px 0",
              }}
            >
              {renderAddTrigger ? (
                renderAddTrigger({ onClick: handleAddRootClick })
              ) : (
                <button
                  onClick={handleAddRootClick}
                  data-pb-add-root
                  style={{ padding: "6px 16px", cursor: "pointer" }}
                >
                  + Add Section
                </button>
              )}

              {onSaveChange && (
                <button
                  onClick={handleSave}
                  data-pb-save
                  style={{ padding: "6px 16px", cursor: "pointer" }}
                >
                  Save
                </button>
              )}

              {pb.popUpId === "__root__" &&
                (renderLayoutPicker ? (
                  renderLayoutPicker({
                    presets: LAYOUT_PRESETS,
                    onSelectLayout: (cols) => {
                      pb.addSection("__root__", cols);
                      pb.setPopUp(null);
                    },
                    onClose: () => pb.setPopUp(null),
                  })
                ) : (
                  <LayoutPicker
                    presets={LAYOUT_PRESETS}
                    onSelectLayout={(cols) => {
                      pb.addSection("__root__", cols);
                      pb.setPopUp(null);
                    }}
                    onClose={() => pb.setPopUp(null)}
                  />
                ))}
            </div>
          )}
        </div>
      </div>
    );
  },
);

PageBuilder.displayName = "PageBuilder";
