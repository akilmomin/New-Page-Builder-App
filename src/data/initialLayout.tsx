import type { ILayoutData } from "react-page-and-form-builder";

/**
 * Initial page layout in the flat ILayoutData[] format.
 *
 * RowIndex    = sequential position of the section/row on the page (0 = first row, 1 = second, …).
 *               Auto-updated by the builder when sections are added, removed, or reordered.
 * ColumnIndex = column position within that row (0 = first column, 1 = second, …).
 * VerticalIndex = stack order within the column (0 = top).
 *
 * Visual structure:
 *   Row 0 (s-banner) : Banner — full width
 *   Row 1 (s-split)  : TilesQuickLink (8/12) | Event (4/12) + Banner stacked below TilesQuickLink
 *   Row 2 (ump10u)   : News (3/12) | BusinessPaper (4/12) | Event (5/12)
 *   Row 3 (s-news)   : BusinessPaper (6/12) | News (6/12)
 */
export const initialLayout: ILayoutData[] = [
  // ── Row 0: Banner full-width ──────────────────────────────────────────────
  {
    Id: "MG99ER",
    SectionId: "s-banner",
    RowIndex: 0,
    ColumnIndex: 0,
    ColumnSpan: 12,
    VerticalIndex: 0,
    ComponentName: "Banner",
  },

  // ── Row 1: TilesQuickLink (8) + stacked Banner | Event (4) ───────────────
  {
    Id: "FpvqNQ",
    SectionId: "s-split",
    RowIndex: 1,
    ColumnIndex: 0,
    ColumnSpan: 8,
    VerticalIndex: 0,
    ComponentName: "TilesQuickLink",
  },
  {
    Id: "Qt5cuu",
    SectionId: "s-split",
    RowIndex: 1,
    ColumnIndex: 0,
    ColumnSpan: 8,
    VerticalIndex: 1,
    ComponentName: "Banner",
  },
  {
    Id: "TIjC6D",
    SectionId: "s-split",
    RowIndex: 1,
    ColumnIndex: 1,
    ColumnSpan: 4,
    VerticalIndex: 0,
    ComponentName: "Event",
  },

  // ── Row 2: Three-column row ───────────────────────────────────────────────
  {
    Id: "LpHmd5",
    SectionId: "ump10u",
    RowIndex: 2,
    ColumnIndex: 0,
    ColumnSpan: 3,
    VerticalIndex: 0,
    ComponentName: "News",
  },
  {
    Id: "sBdPsA",
    SectionId: "ump10u",
    RowIndex: 2,
    ColumnIndex: 1,
    ColumnSpan: 4,
    VerticalIndex: 0,
    ComponentName: "BusinessPaper",
  },
  {
    Id: "tzOkn2",
    SectionId: "ump10u",
    RowIndex: 2,
    ColumnIndex: 2,
    ColumnSpan: 5,
    VerticalIndex: 0,
    ComponentName: "Event",
  },

  // ── Row 3: Two-column row ─────────────────────────────────────────────────
  {
    Id: "GTluMY",
    SectionId: "s-news",
    RowIndex: 3,
    ColumnIndex: 0,
    ColumnSpan: 6,
    VerticalIndex: 0,
    ComponentName: "BusinessPaper",
  },
  {
    Id: "om16Xd",
    SectionId: "s-news",
    RowIndex: 3,
    ColumnIndex: 1,
    ColumnSpan: 6,
    VerticalIndex: 0,
    ComponentName: "News",
  },
];
