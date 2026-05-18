import type React from "react";
import type { ILayoutData } from "../../../models/pageBuilder";

export interface GridLayoutProps {
  /** Data-driven layout items. Grouped by ColumnIndex, sorted by VerticalIndex. */
  attributes: ILayoutData[];
  /**
   * Optional explicit 12-col spans per column index.
   * e.g. [8, 4] → col 0 is 8/12 wide, col 1 is 4/12 wide.
   * Defaults to equal distribution within each row.
   */
  columnSpans?: readonly number[];
  /**
   * Maximum number of columns rendered per row at desktop width.
   * Default: 4. Raise to 6 for icon grids, product cards, etc.
   */
  maxColumnsPerRow?: number;
  /** Horizontal gap between columns in pixels. Default: 16. */
  gapPx?: number;
  /** Vertical gap between rows (when columns wrap) in pixels. Default: same as gapPx. */
  rowGapPx?: number;
  /** Vertical gap between stacked items within a column in pixels. Default: 0. */
  componentGapPx?: number;
  /**
   * Viewport width (px) below which all columns collapse to full width (stack vertically).
   * Default: 768. Set to 0 to disable responsive stacking.
   */
  mobileBreakpoint?: number;
  /**
   * Viewport width (px) above `mobileBreakpoint` and below this value where columns are
   * limited to `tabletMaxColumnsPerRow` per row. Default: 0 (disabled).
   * Example: mobileBreakpoint=640, tabletBreakpoint=1024 → three ranges:
   *   < 640px = single column, 640–1023px = tablet layout, ≥ 1024px = full layout.
   */
  tabletBreakpoint?: number;
  /**
   * Maximum columns per row when the viewport is in the tablet range.
   * Default: 2. Only applies when `tabletBreakpoint` is set.
   */
  tabletMaxColumnsPerRow?: number;
  className?: string;
  style?: React.CSSProperties;
}
