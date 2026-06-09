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
  single: [12] as const,
  double: [6, 6] as const,
  triple: [4, 4, 4] as const,
  fourColumns: [3, 3, 3, 3] as const,
  leftWide: [8, 4] as const,
  rightWide: [4, 8] as const,
} as const;

export type LayoutPresetKey = keyof typeof LAYOUT_PRESETS;
export type LayoutPreset = (typeof LAYOUT_PRESETS)[LayoutPresetKey];

// ─── Grid Column Descriptor ───────────────────────────────────────────────────

export interface GridColumn {
  readonly node: PageNode;
  readonly mdSize: number;
  readonly smSize: number;
  readonly index: number;
}

// ─── Render-prop Slot Types ───────────────────────────────────────────────────

export interface ToolbarRenderProps {
  isEditMode: boolean;
  onToggleEditMode: () => void;
  onReset: () => void;
  onSave?: () => void;
}

export interface AddTriggerRenderProps {
  onClick: (e: React.MouseEvent) => void;
}

export interface LayoutPickerRenderProps {
  presets: typeof LAYOUT_PRESETS;
  onSelectLayout: (columns: readonly number[]) => void;
  onClose: () => void;
}

export interface ComponentPickerRenderProps {
  components: ComponentDefinition[];
  onSelectComponent: (name: string) => void;
  onClose: () => void;
  /**
   * Present only when the column can hold a nested section (depth 0).
   * Call with column spans to insert a nested section above the components.
   * Undefined at depth 1 — omit the section UI in that case.
   */
  onAddSection?: (cols: readonly number[]) => void;
}

export interface SectionControlsRenderProps {
  nodeId: string;
  onClone: () => void;
  onDelete: () => void;
  /** Toggle the layout picker open/closed for this section. */
  onChangeLayout: () => void;
  /** Whether the layout picker is currently open for this section. */
  isLayoutPickerOpen: boolean;
}

export interface ComponentControlsRenderProps {
  nodeId: string;
  onClone: () => void;
  onDelete: () => void;
}

export interface SectionWrapperRenderProps {
  /** The section's unique node ID — use as the sortable/draggable item ID. */
  nodeId: string;
  /** Zero-based position of this section on the canvas. */
  index: number;
  children: React.ReactNode;
}

export interface SubSectionWrapperRenderProps {
  /** The column's unique node ID — use as the droppable target ID. */
  nodeId: string;
  children: React.ReactNode;
}

// ─── ILayoutData (public data-driven grid format) ────────────────────────────

export interface ILayoutData {
  /** Unique identifier for this layout item. */
  Id: string;
  /** Groups items into a row/section. Items with the same SectionId form one row. */
  SectionId: string;
  /**
   * Sequential order of this section/row on the page (0 = first row, 1 = second, …).
   * Auto-assigned by the builder — re-numbered when sections are added, removed, or reordered.
   */
  RowIndex: number;
  /**
   * Zero-based column position within the row (0 = first column, 1 = second, …).
   * Auto-assigned by the builder — re-numbered when columns change within a section.
   */
  ColumnIndex: number;
  /** Width on a 12-col grid (e.g. 8 for 2/3). Defaults to equal distribution. */
  ColumnSpan?: number;
  /** Stack order within the column (lower renders first). Defaults to 0. */
  VerticalIndex?: number;
  /** Registry key for the component to render. Empty string = empty slot (not serialized). */
  ComponentName: string;
  /** Optional persona / variant tag. */
  CorePersona?: string;
  /** JSON-encoded extra metadata (e.g. `{ "order": 2 }`). */
  StateData?: string;
  /**
   * Static props passed directly to the rendered component (e.g. `{ fieldId: "email", label: "Email" }`).
   * Carried through the ILayoutData ↔ PageNode round-trip and included in serialized output.
   */
  componentProps?: Record<string, unknown>;
  /**
   * Runtime render override — called instead of the registry component.
   * NEVER serialized; stripped automatically by onChange / serializeLayout.
   */
  renderComponent?: () => React.ReactElement;
}

/** Serializable subset of ILayoutData — safe to JSON.stringify and send to a server. */
export type SerializableLayoutItem = Omit<ILayoutData, "renderComponent">;

export interface IGridItem {
  colIndex: number;
  items: ILayoutData[];
}
