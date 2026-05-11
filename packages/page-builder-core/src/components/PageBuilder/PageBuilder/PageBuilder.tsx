"use client";

import React from "react";
import { LAYOUT_PRESETS } from "../../../models/pageBuilder";
import type { PageBuilderProps } from "./model/model";
import { usePageBuilder } from "./hook/usePageBuilder";
import { NodeRenderer } from "../NodeRenderer";
import { LayoutPicker } from "../LayoutPicker";

export const PageBuilder: React.FC<PageBuilderProps> = ({
  components,
  value,
  onChange,
  defaultValue,
  editMode,
  onEditModeChange,
  renderToolbar,
  renderAddTrigger,
  renderLayoutPicker,
  classNames = {},
  style,
}) => {
  const pb = usePageBuilder({ value, onChange, defaultValue, editMode, onEditModeChange });

  const ctx = {
    isEditMode:          pb.isEditMode,
    activeSectionId:     pb.activeSectionId,
    activeComponentId:   pb.activeComponentId,
    popUpId:             pb.popUpId,
    showSection:         pb.showSection,
    onActivateSection:   pb.setActiveSection,
    onActivateComponent: pb.setActiveComponent,
    onSetPopUp:          pb.setPopUp,
    onSetShowSection:    pb.setShowSection,
    onAddSection:        pb.addSection,
    onAddSectionAfter:   pb.addSectionAfter,
    onAddComponent:      pb.addComponent,
    onDeleteNode:        pb.deleteNode,
    onCloneNode:         pb.cloneNode,
  };

  const toolbar = renderToolbar
    ? renderToolbar({ isEditMode: pb.isEditMode, onToggleEditMode: pb.toggleEditMode, onReset: pb.resetLayout })
    : (
      <div
        data-pb-toolbar
        className={classNames.toolbar}
        style={{ display: "flex", gap: 8, padding: "8px 12px", borderBottom: "1px solid var(--pb-border, #e0e0e0)" }}
      >
        <button data-pb-reset onClick={pb.resetLayout}>Reset</button>
        <button data-pb-toggle-edit onClick={pb.toggleEditMode}>
          {pb.isEditMode ? "Done Editing" : "Edit"}
        </button>
      </div>
    );

  const handleAddRootClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    pb.setPopUp("__root__");
  };

  return (
    <div data-pb-root className={classNames.root} style={style}>
      {toolbar}

      <div data-pb-canvas className={classNames.canvas}>
        {pb.nodes.length === 0 && pb.isEditMode && (
          <div
            data-pb-empty
            style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 200, gap: 12 }}
          >
            <p style={{ color: "var(--pb-text-muted, #888)", fontSize: 14 }}>Your page is empty. Add a section to get started.</p>
          </div>
        )}

        {pb.nodes.length > 0 && (
          <NodeRenderer nodes={pb.nodes} components={components} ctx={ctx} />
        )}

        {pb.isEditMode && (
          <div style={{ position: "relative", display: "flex", justifyContent: "center", padding: "12px 0" }}>
            {renderAddTrigger
              ? renderAddTrigger({ onClick: handleAddRootClick })
              : <button onClick={handleAddRootClick} data-pb-add-root style={{ padding: "6px 16px", cursor: "pointer" }}>+ Add Section</button>
            }

            {pb.popUpId === "__root__" && (
              renderLayoutPicker
                ? renderLayoutPicker({ presets: LAYOUT_PRESETS, onSelectLayout: (cols) => { pb.addSection("__root__", cols); pb.setPopUp(null); }, onClose: () => pb.setPopUp(null) })
                : <LayoutPicker presets={LAYOUT_PRESETS} onSelectLayout={(cols) => { pb.addSection("__root__", cols); pb.setPopUp(null); }} onClose={() => pb.setPopUp(null)} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
