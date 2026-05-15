import type React from "react";
import type {
  LayoutPickerRenderProps,
  ComponentPickerRenderProps,
  SectionControlsRenderProps,
  ComponentControlsRenderProps,
} from "../../../../models/pageBuilder";

export interface NodeRendererContext {
  isEditMode: boolean;
  activeSectionId: string | null;
  activeComponentId: string | null;
  popUpId: string | null;
  showSection: boolean;
  /** Gap in pixels between stacked components within the same column. */
  spacing: number;
  onActivateSection: (id: string | null) => void;
  onActivateComponent: (id: string | null) => void;
  onSetPopUp: (id: string | null) => void;
  onSetShowSection: (show: boolean) => void;
  // tree mutations
  onAddSection: (targetId: string, columns: readonly number[]) => void;
  onAddSectionAfter: (parentId: string, afterIndex: number, columns: readonly number[]) => void;
  onAddComponent: (targetId: string, name: string) => void;
  onDeleteNode: (id: string) => void;
  onCloneNode: (id: string) => void;
  onChangeLayout: (sectionId: string, columns: readonly number[]) => void;

  /** Viewport width (px) below which grid columns stack. Default: 768. */
  mobileBreakpoint: number;

  // ── render-prop overrides ─────────────────────────────────────────────────
  renderLayoutPicker?: (props: LayoutPickerRenderProps) => React.ReactNode;
  renderComponentPicker?: (props: ComponentPickerRenderProps) => React.ReactNode;
  renderSectionControls?: (props: SectionControlsRenderProps) => React.ReactNode;
  renderComponentControls?: (props: ComponentControlsRenderProps) => React.ReactNode;
}
