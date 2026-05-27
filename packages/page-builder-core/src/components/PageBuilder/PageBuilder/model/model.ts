import type React from "react";
import type {
  ComponentDefinition,
  ILayoutData,
  SerializableLayoutItem,
} from "../../../../models/pageBuilder";
import type {
  AddTriggerRenderProps,
  LayoutPickerRenderProps,
  ComponentPickerRenderProps,
  SectionControlsRenderProps,
  ComponentControlsRenderProps,
  SectionWrapperRenderProps,
  SubSectionWrapperRenderProps,
} from "../../../../models/pageBuilder";

export interface PageBuilderClassNames {
  root?: string;
  canvas?: string;
  section?: string;
  subsection?: string;
  component?: string;
  addTrigger?: string;
  picker?: string;
  pickerItem?: string;
}

/**
 * Imperative handle exposed via `ref` on `<PageBuilder>`.
 * Only needed for actions that can't be expressed as props (e.g. reset in uncontrolled mode).
 * For save, use the `onSaveChange` prop instead.
 *
 * @example
 * const ref = useRef<PageBuilderHandle>(null);
 * <button onClick={() => ref.current?.reset()}>Reset</button>
 * <PageBuilder ref={ref} ... />
 */
export interface PageBuilderHandle {
  /** Clear all sections and components from the canvas. */
  reset: () => void;
  /** Append a new section inside `targetId`. Pass `"__root__"` to append at the canvas level. */
  addSection: (targetId: string, columns: readonly number[]) => void;
  /** Insert a new section after `afterIndex` inside `parentId`. Pass `"__root__"` for canvas level. Use `afterIndex: -1` to insert before the first section. */
  addSectionAfter: (parentId: string, afterIndex: number, columns: readonly number[]) => void;
  /** Add a component into the column identified by `targetId`. */
  addComponent: (targetId: string, componentName: string, componentProps?: Record<string, unknown>) => void;
  /**
   * Programmatically trigger `onSaveChange` with the current layout.
   * Use this when your Save button lives outside the PageBuilder (e.g. in an external toolbar).
   * No-op when `onSaveChange` is not provided.
   */
  save: () => void;
  /** Step back one action in the history stack. No-op when nothing to undo. */
  undo: () => void;
  /** Step forward one action in the history stack. No-op when nothing to redo. */
  redo: () => void;
  /**
   * Merge `patch` into the `componentProps` of the component identified by `nodeId`.
   * Use this from an external settings panel to update the selected component's props.
   */
  updateComponentProps: (nodeId: string, patch: Record<string, unknown>) => void;
  /**
   * Replace the entire layout from a serializable ILayoutData array.
   * Use this after an external drag-and-drop reorder — the builder applies it
   * as a single history entry so Ctrl+Z undoes the move.
   *
   * @example
   * // dnd-kit drag end handler — no DnD code lives in this package
   * const handleDragEnd = ({ active, over }) => {
   *   const next = reorderSections(currentLayout, active.id, over.id);
   *   ref.current?.setLayout(next);
   * };
   */
  setLayout: (items: SerializableLayoutItem[]) => void;
}

export interface PageBuilderProps {
  components: ComponentDefinition[];

  // ── Controlled mode ────────────────────────────────────────────────────────
  /** Controlled layout value. */
  value?: ILayoutData[];
  /** Called with serializable ILayoutData[] (renderComponent stripped) on every change. */
  onChange?: (items: SerializableLayoutItem[]) => void;

  // ── Uncontrolled mode ──────────────────────────────────────────────────────
  /** Initial layout for uncontrolled mode. */
  defaultValue?: ILayoutData[];

  // ── Edit mode ──────────────────────────────────────────────────────────────
  /**
   * Controlled edit-mode flag.
   * When provided, PageBuilder will not manage this state internally — the
   * caller's toolbar is responsible for toggling it.
   */
  editMode?: boolean;
  onEditModeChange?: (isEdit: boolean) => void;

  // ── Spacing ────────────────────────────────────────────────────────────────
  /** Gap in pixels between sections (rows) and between stacked components within a column. Default: 8. */
  spacing?: number;

  // ── Save ───────────────────────────────────────────────────────────────────
  /**
   * Called when the user clicks the Save button rendered inside the builder canvas.
   * Receives the full serializable layout — safe to JSON.stringify and send to a server.
   * When omitted the Save button is not shown.
   *
   * @example
   * <PageBuilder onSaveChange={(layout) => fetch('/api/save', { body: JSON.stringify(layout) })} />
   */
  onSaveChange?: (items: SerializableLayoutItem[]) => void;

  // ── Render-prop slots (internal builder UI, not the toolbar) ───────────────
  renderAddTrigger?: (props: AddTriggerRenderProps) => React.ReactNode;
  renderLayoutPicker?: (props: LayoutPickerRenderProps) => React.ReactNode;
  renderComponentPicker?: (props: ComponentPickerRenderProps) => React.ReactNode;
  renderSectionControls?: (props: SectionControlsRenderProps) => React.ReactNode;
  renderComponentControls?: (props: ComponentControlsRenderProps) => React.ReactNode;
  renderSectionWrapper?: (props: SectionWrapperRenderProps) => React.ReactNode;
  renderSubSectionWrapper?: (props: SubSectionWrapperRenderProps) => React.ReactNode;

  // ── Responsive ────────────────────────────────────────────────────────────
  /**
   * Viewport width (px) below which grid columns collapse to full width (single column).
   * Default: 768. Set to 0 to disable responsive stacking.
   */
  mobileBreakpoint?: number;
  /**
   * Viewport width (px) above `mobileBreakpoint` and below this value where columns are
   * limited to a max of 2 per row. Default: 0 (disabled).
   * Example: `mobileBreakpoint={640} tabletBreakpoint={1024}` →
   *   < 640: single column, 640–1023: 2-column, ≥ 1024: full layout.
   */
  tabletBreakpoint?: number;
  /**
   * Maximum columns per row when the viewport is in the tablet range.
   * Default: 2. Only applies when `tabletBreakpoint` is set.
   * Set to 3 to allow 3-column layouts at tablet width instead of always collapsing to 2.
   */
  tabletMaxColumnsPerRow?: number;
  /**
   * Maximum number of columns rendered per row at desktop width. Default: 4.
   * Raise to 6 for icon grids, product cards, or any layout needing more columns.
   */
  maxColumnsPerRow?: number;

  // ── Component selection ────────────────────────────────────────────────────
  /**
   * Called whenever the active component changes.
   * `nodeId` and `componentName` are null when the selection is cleared.
   * Use this to drive an external settings panel — read `props` to populate
   * your fields, then call `ref.current.updateComponentProps(nodeId, patch)`
   * to write changes back.
   *
   * @example
   * onComponentSelect={(nodeId, componentName, props) =>
   *   setSelected(nodeId ? { nodeId, componentName, props } : null)
   * }
   */
  onComponentSelect?: (
    nodeId: string | null,
    componentName: string | null,
    props: Record<string, unknown>,
  ) => void;

  // ── History ───────────────────────────────────────────────────────────────
  /**
   * Maximum number of undo steps to retain. Older entries are dropped first.
   * Default: 50.
   */
  maxHistorySize?: number;
  /**
   * Called whenever the undo/redo availability changes (after any mutation, undo, or redo).
   * Use this to enable/disable undo/redo buttons in an external toolbar.
   */
  onHistoryChange?: (state: { canUndo: boolean; canRedo: boolean }) => void;

  // ── Styling ────────────────────────────────────────────────────────────────
  classNames?: PageBuilderClassNames;
  style?: React.CSSProperties;
}
