"use client";

import React, { useState, useEffect } from "react";
import type { GridLayoutProps } from "./model/model";
import type { IGridItem } from "../../models/pageBuilder";
import { useLayout } from "./hook/useLayout";

const MAX_COLS_PER_ROW = 4;

const spanToPercent = (span: number): string => `${((span / 12) * 100).toFixed(4)}%`;

/** Returns true when the viewport is narrower than `breakpoint` px. SSR-safe. */
const useIsMobile = (breakpoint: number): boolean => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (!breakpoint) return;
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    setIsMobile(mql.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [breakpoint]);
  return isMobile;
};

export const GridLayout: React.FC<GridLayoutProps> = ({
  attributes,
  columnSpans,
  gapPx = 16,
  rowGapPx,
  componentGapPx = 0,
  mobileBreakpoint = 768,
  className,
  style,
}) => {
  const allColumns = useLayout(attributes);
  const rowGap = rowGapPx ?? gapPx;
  const isMobile = useIsMobile(mobileBreakpoint);

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

  // ── Desktop: flex rows with proportional percentage widths ──────────────────
  const rows = allColumns.reduce<IGridItem[][]>((acc, col, i) => {
    const rowIdx = Math.floor(i / MAX_COLS_PER_ROW);
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
            const overallIndex = rowIndex * MAX_COLS_PER_ROW + posInRow;
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
