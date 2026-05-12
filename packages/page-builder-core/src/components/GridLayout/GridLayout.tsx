"use client";

import React from "react";
import type { GridLayoutProps } from "./model/model";
import { useLayout } from "./hook/useLayout";

const spanToPercent = (span: number): string => `${((span / 12) * 100).toFixed(4)}%`;

export const GridLayout: React.FC<GridLayoutProps> = ({
  attributes,
  columnSpans,
  gapPx = 16,
  className,
  style,
}) => {
  const columns = useLayout(attributes);

  return (
    <div
      className={className}
      style={{ display: "flex", flexWrap: "wrap", margin: `0 -${gapPx / 2}px`, ...style }}
      data-pb-grid-layout
    >
      {columns.map(({ colIndex, items }) => {
        const span = columnSpans?.[colIndex] ?? Math.floor(12 / Math.max(columns.length, 1));
        const pct = spanToPercent(span);

        return (
          <div
            key={colIndex}
            data-pb-col={colIndex}
            style={{
              flex: `0 0 ${pct}`,
              maxWidth: pct,
              padding: `0 ${gapPx / 2}px`,
              boxSizing: "border-box",
            }}
          >
            {items.map((item) => (
              <div key={item.Id} data-pb-grid-item={item.Id} style={{ width: "100%" }}>
                {item.renderComponent?.()}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};
