import type { ILayoutData } from "page-builder-core";

/**
 * Initial page layout in the flat ILayoutData[] format.
 *
 * Visual structure:
 *   Row 1 (s-banner)  : Banner — full width
 *   Row 2 (s-split)   : TilesQuickLink (8/12) | Event (4/12)
 *   Row 3 (s-news)    : BusinessPaper (6/12)  | News  (6/12)
 */
export const initialLayout: ILayoutData[] = [
  // ── Row 1: Banner full-width ──────────────────────────────────────────────
  {
    Id: "MG99ER",
    SectionId: "s-banner",
    ColumnIndex: 0,
    ColumnSpan: 12,
    VerticalIndex: 0,
    ComponentName: "Banner",
  },

  // ── Row 2: TilesQuickLink (8) + Event (4) ────────────────────────────────
  {
    Id: "FpvqNQ",
    SectionId: "s-split",
    ColumnIndex: 0,
    ColumnSpan: 8,
    VerticalIndex: 0,
    ComponentName: "TilesQuickLink",
  },
  {
    Id: "TIjC6D",
    SectionId: "s-split",
    ColumnIndex: 1,
    ColumnSpan: 4,
    VerticalIndex: 0,
    ComponentName: "Event",
  },

  // ── Row 3: BusinessPaper (6) + News (6) ──────────────────────────────────
  {
    Id: "GTluMY",
    SectionId: "s-news",
    ColumnIndex: 0,
    ColumnSpan: 6,
    VerticalIndex: 0,
    ComponentName: "BusinessPaper",
  },
  {
    Id: "om16Xd",
    SectionId: "s-news",
    ColumnIndex: 1,
    ColumnSpan: 6,
    VerticalIndex: 0,
    ComponentName: "News",
  },
];
