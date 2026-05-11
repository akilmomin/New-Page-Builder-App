import type React from "react";

// ─── Tree Node Types ──────────────────────────────────────────────────────────

export type NodeType = "Section" | "SubSection" | "Component";

export interface PageNode {
  readonly type: NodeType;
  readonly uniqueId: string;
  readonly isGrid?: boolean;
  readonly gridValue?: number | string;
  readonly children?: readonly PageNode[];
  readonly componentName?: string;
  readonly componentProps?: Record<string, unknown>;
}

// ─── Component Registry ───────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ComponentDefinition<P = any> {
  name: string;
  label: string;
  icon?: React.ReactNode;
  component: React.ComponentType<P & { editMode?: boolean }>;
  defaultProps?: Partial<P>;
  category?: string;
  description?: string;
}

// ─── Layout Presets ───────────────────────────────────────────────────────────

export const LAYOUT_PRESETS = {
  single:    [12]       as const,
  double:    [6, 6]     as const,
  triple:    [4, 4, 4]  as const,
  leftWide:  [8, 4]     as const,
  rightWide: [4, 8]     as const,
} as const;

export type LayoutPresetKey = keyof typeof LAYOUT_PRESETS;
export type LayoutPreset    = (typeof LAYOUT_PRESETS)[LayoutPresetKey];

// ─── Grid Column Descriptor ───────────────────────────────────────────────────

export interface GridColumn {
  readonly node:   PageNode;
  readonly mdSize: number;
  readonly smSize: number;
  readonly index:  number;
}

// ─── Render-prop Slot Types ───────────────────────────────────────────────────

export interface ToolbarRenderProps {
  isEditMode:       boolean;
  onToggleEditMode: () => void;
  onReset:          () => void;
}

export interface AddTriggerRenderProps {
  onClick: (e: React.MouseEvent) => void;
}

export interface LayoutPickerRenderProps {
  presets:        typeof LAYOUT_PRESETS;
  onSelectLayout: (columns: readonly number[]) => void;
  onClose:        () => void;
}

export interface ComponentPickerRenderProps {
  components:        ComponentDefinition[];
  onSelectComponent: (name: string) => void;
  onClose:           () => void;
}

export interface SectionControlsRenderProps {
  nodeId:   string;
  onClone:  () => void;
  onDelete: () => void;
}

export interface ComponentControlsRenderProps {
  nodeId:   string;
  onClone:  () => void;
  onDelete: () => void;
}

// ─── ILayoutData (Cosine-style data-driven grid) ──────────────────────────────

export interface ILayoutData {
  /** Zero-based column index determining which column this item belongs to. */
  ColumnIndex:      number;
  /** Sort order within the column (lower = higher). Defaults to 0. */
  VerticalIndex?:   number;
  /** Unique identifier for this layout item. */
  Id:               string;
  /** Optional persona / variant tag. */
  CorePersona?:     string;
  /** JSON-encoded extra metadata (e.g. `{ "order": 2 }`). */
  StateData?:       string;
  /** Renders the actual content for this slot. */
  renderAttribute?: () => React.ReactElement;
}

export interface IGridItem {
  colIndex: number;
  items:    ILayoutData[];
}
