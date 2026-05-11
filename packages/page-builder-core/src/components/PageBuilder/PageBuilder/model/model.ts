import type React from "react";
import type { ComponentDefinition, PageNode } from "../../../../models/pageBuilder";
import type {
  ToolbarRenderProps,
  AddTriggerRenderProps,
  LayoutPickerRenderProps,
  ComponentPickerRenderProps,
  SectionControlsRenderProps,
  ComponentControlsRenderProps,
} from "../../../../models/pageBuilder";

export interface PageBuilderClassNames {
  root?:       string;
  toolbar?:    string;
  canvas?:     string;
  section?:    string;
  subsection?: string;
  component?:  string;
  addTrigger?: string;
  picker?:     string;
  pickerItem?: string;
}

export interface PageBuilderProps {
  components: ComponentDefinition[];

  // ── Controlled mode ────────────────────────────────────────────────────────
  value?:    readonly PageNode[];
  onChange?: (nodes: readonly PageNode[]) => void;

  // ── Uncontrolled mode ──────────────────────────────────────────────────────
  defaultValue?: readonly PageNode[];

  // ── Edit mode ──────────────────────────────────────────────────────────────
  editMode?:          boolean;
  onEditModeChange?:  (isEdit: boolean) => void;

  // ── Render-prop slots ──────────────────────────────────────────────────────
  renderToolbar?:           (props: ToolbarRenderProps)           => React.ReactNode;
  renderAddTrigger?:        (props: AddTriggerRenderProps)        => React.ReactNode;
  renderLayoutPicker?:      (props: LayoutPickerRenderProps)      => React.ReactNode;
  renderComponentPicker?:   (props: ComponentPickerRenderProps)   => React.ReactNode;
  renderSectionControls?:   (props: SectionControlsRenderProps)   => React.ReactNode;
  renderComponentControls?: (props: ComponentControlsRenderProps) => React.ReactNode;

  // ── Styling ────────────────────────────────────────────────────────────────
  classNames?: PageBuilderClassNames;
  style?:      React.CSSProperties;
}
