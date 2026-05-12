import { useMemo } from "react";
import type { GridColumn, PageNode } from "../../../models/pageBuilder";

const MAX_COLS = 4;

const computeSizes = (total: number): { mdSize: number; smSize: number } => {
  const cols = Math.min(total, MAX_COLS);
  return {
    mdSize: cols > 1 ? Math.ceil(12 / cols) : 12,
    smSize: cols > 1 ? 6 : 12,
  };
};

export const useGridLayout = (children: readonly PageNode[] | undefined): readonly GridColumn[] =>
  useMemo(() => {
    if (!children || children.length === 0) return [];
    return children.map((node, index) => {
      const { mdSize, smSize } = computeSizes(children.length);
      return { node, mdSize, smSize, index } satisfies GridColumn;
    });
  }, [children]);
