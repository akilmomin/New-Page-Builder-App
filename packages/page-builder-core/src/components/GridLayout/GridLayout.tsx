"use client";

import React, { useState, useEffect } from "react";
import type { GridLayoutProps } from "./model/model";
import type { IGridItem } from "../../models/pageBuilder";
import { useLayout } from "./hook/useLayout";

const DEFAULT_MAX_COLS_PER_ROW = 4;

const spanToPercent = (span: number): string => `${((span / 12) * 100).toFixed(4)}%`;

const useMediaQuery = (query: string, enabled: boolean): boolean => {
  // Always initialise to false so server and client agree on the first render.
  // useEffect (client-only) then syncs the real match state after hydration.
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query, enabled]);
  return matches;
};

export const GridLayout: React.FC<GridLayoutProps> = ({
  attributes,
  columnSpans,
  gapPx = 16,
  rowGapPx,
  componentGapPx = 0,
  mobileBreakpoint = 768,
  tabletBreakpoint = 0,
  tabletMaxColumnsPerRow = 2,
  maxColumnsPerRow = DEFAULT_MAX_COLS_PER_ROW,
  className,
  style,
}) => {
  const allColumns = useLayout(attributes);
  const rowGap = rowGapPx ?? gapPx;

  const isMobile = useMediaQuery(
    `(max-width: ${mobileBreakpoint - 1}px)`,
    mobileBreakpoint > 0,
  );
  const isTablet = useMediaQuery(
    `(min-width: ${mobileBreakpoint}px) and (max-width: ${tabletBreakpoint - 1}px)`,
    tabletBreakpoint > 0 && tabletBreakpoint > mobileBreakpoint,
  );

  // ── Mobile: all columns stack full-width ─────────────────────────────────────
  if (isMobile) {
    return (
      <div className={className} style={style} data-pb-grid-layout>
        {allColumns.map((col, colIdx) => (
          <div
            key={col.colIndex}
            data-pb-col={col.colIndex}
            style={{ width: "100%", marginTop: colIdx > 0 ? rowGap : 0, boxSizing: "border-box" }}
          >
            {col.items.map((item, itemIdx) => (
              <div
                key={item.Id}
                data-pb-grid-item={item.Id}
                style={{ width: "100%", marginTop: itemIdx > 0 ? componentGapPx : 0 }}
              >
                {item.renderComponent?.()}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  // ── Tablet: max tabletMaxColumnsPerRow columns per row ───────────────────────
  if (isTablet) {
    const colPct = `${(100 / tabletMaxColumnsPerRow).toFixed(4)}%`;
    const chunks: (typeof allColumns)[] = [];
    for (let i = 0; i < allColumns.length; i += tabletMaxColumnsPerRow) {
      chunks.push(allColumns.slice(i, i + tabletMaxColumnsPerRow));
    }
    return (
      <div className={className} style={style} data-pb-grid-layout>
        {chunks.map((chunk, chunkIdx) => (
          <div
            key={chunkIdx}
            style={{
              display: "flex",
              margin: `${chunkIdx > 0 ? rowGap : 0}px -${gapPx / 2}px 0`,
            }}
          >
            {chunk.map((col) => (
              <div
                key={col.colIndex}
                data-pb-col={col.colIndex}
                style={{ flex: `0 0 ${colPct}`, maxWidth: colPct, padding: `0 ${gapPx / 2}px`, boxSizing: "border-box" }}
              >
                {col.items.map((item, itemIdx) => (
                  <div
                    key={item.Id}
                    data-pb-grid-item={item.Id}
                    style={{ width: "100%", marginTop: itemIdx > 0 ? componentGapPx : 0 }}
                  >
                    {item.renderComponent?.()}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  // ── Desktop: flex rows with proportional percentage widths ──────────────────
  const rows = allColumns.reduce<IGridItem[][]>((acc, col, i) => {
    const rowIdx = Math.floor(i / maxColumnsPerRow);
    if (!acc[rowIdx]) acc[rowIdx] = [];
    acc[rowIdx].push(col);
    return acc;
  }, []);

  return (
    <div className={className} style={style} data-pb-grid-layout>
      {rows.map((rowCols, rowIndex) => (
        <div
          key={rowIndex}
          style={{
            display: "flex",
            margin: `${rowIndex > 0 ? rowGap : 0}px -${gapPx / 2}px 0`,
          }}
        >
          {rowCols.map((col, posInRow) => {
            const overallIndex = rowIndex * maxColumnsPerRow + posInRow;
            const span = columnSpans?.[overallIndex] ?? Math.ceil(12 / rowCols.length);
            const pct = spanToPercent(span);

            return (
              <div
                key={col.colIndex}
                data-pb-col={col.colIndex}
                style={{
                  flex: `0 0 ${pct}`,
                  maxWidth: pct,
                  padding: `0 ${gapPx / 2}px`,
                  boxSizing: "border-box",
                }}
              >
                {col.items.map((item, itemIdx) => (
                  <div
                    key={item.Id}
                    data-pb-grid-item={item.Id}
                    style={{
                      width: "100%",
                      marginTop: itemIdx > 0 ? componentGapPx : 0,
                    }}
                  >
                    {item.renderComponent?.()}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};
