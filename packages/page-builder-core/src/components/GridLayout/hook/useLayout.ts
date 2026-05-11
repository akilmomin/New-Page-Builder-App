import { useMemo } from "react";
import type { IGridItem, ILayoutData } from "../../../models/pageBuilder";

const groupBy = <T>(arr: T[], key: (item: T) => number): Record<number, T[]> =>
  arr.reduce<Record<number, T[]>>((acc, item) => {
    const k = key(item);
    (acc[k] ??= []).push(item);
    return acc;
  }, {});

const getNumber = (val: number | undefined, fallback: number): number =>
  val !== undefined && !isNaN(val) ? val : fallback;

const parseStateDataOrder = (stateData: string | undefined): number => {
  if (!stateData) return 0;
  try {
    const parsed = JSON.parse(stateData) as Record<string, unknown>;
    return typeof parsed["order"] === "number" ? parsed["order"] : 0;
  } catch {
    return 0;
  }
};

export const useLayout = (attributes: ILayoutData[]): IGridItem[] =>
  useMemo(() => {
    const presorted = [...attributes].sort(
      (a, b) => parseStateDataOrder(a.StateData) - parseStateDataOrder(b.StateData),
    );

    const grouped = groupBy(presorted, (item) => item.ColumnIndex);

    return Object.keys(grouped)
      .map(Number)
      .sort((a, b) => a - b)
      .map((colIndex) => ({
        colIndex,
        items: [...grouped[colIndex]].sort(
          (a, b) => getNumber(a.VerticalIndex, 0) - getNumber(b.VerticalIndex, 0),
        ),
      }));
  }, [attributes]);
