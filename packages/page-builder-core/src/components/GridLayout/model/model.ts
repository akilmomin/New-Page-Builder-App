import type React from "react";
import type { ILayoutData } from "../../../models/pageBuilder";

export interface GridLayoutProps {
  /** Data-driven layout items. Grouped by ColumnIndex, sorted by VerticalIndex. */
  attributes:    ILayoutData[];
  /**
   * Optional explicit 12-col spans per column index.
   * e.g. [8, 4] → col 0 is 8/12 wide, col 1 is 4/12 wide.
   * Defaults to equal distribution.
   */
  columnSpans?:  readonly number[];
  gapPx?:        number;
  className?:    string;
  style?:        React.CSSProperties;
}
