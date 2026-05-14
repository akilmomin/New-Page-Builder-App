/**
 * layoutDataOps — conversions between the public ILayoutData[] format
 * and the internal PageNode[] tree used by the builder engine.
 *
 * Public consumers work with ILayoutData[].
 * The builder's reducer/treeOps work with PageNode[].
 * These converters bridge the two at the PageBuilder boundary.
 */

import type { ILayoutData, PageNode, SerializableLayoutItem } from "../models/pageBuilder";

// ─── Serialization ────────────────────────────────────────────────────────────

/**
 * Strip renderComponent (non-serializable) and empty-slot placeholders.
 * Safe to JSON.stringify and send to a server.
 */
export const serializeLayout = (items: ILayoutData[]): SerializableLayoutItem[] =>
  items
    .filter((item) => item.ComponentName !== "")
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .map(({ renderComponent, ...rest }) => rest);

// ─── Internal helpers ──────────────────────────────────────────────────────────

const groupByKey = <T>(arr: T[], getKey: (item: T) => string): Record<string, T[]> =>
  arr.reduce<Record<string, T[]>>((acc, item) => {
    const k = getKey(item);
    (acc[k] ??= []).push(item);
    return acc;
  }, {});

/** Unique keys in first-appearance order. */
const stableKeys = <T>(arr: T[], getKey: (item: T) => string): string[] => {
  const seen = new Set<string>();
  const order: string[] = [];
  for (const item of arr) {
    const k = getKey(item);
    if (!seen.has(k)) {
      seen.add(k);
      order.push(k);
    }
  }
  return order;
};

// ─── ILayoutData[] → PageNode[] ───────────────────────────────────────────────

/**
 * Convert flat ILayoutData[] into the Section → SubSection → Component tree
 * expected by the builder engine.
 *
 * - Each unique SectionId becomes a Section node, ordered by RowIndex.
 * - Each unique ColumnIndex within a section becomes a SubSection node.
 * - Items are sorted by VerticalIndex and become Component nodes in their SubSection.
 * - Empty-slot items (ComponentName === "") produce an empty SubSection (no Component child).
 */
export const layoutDataToNodes = (items: ILayoutData[]): readonly PageNode[] => {
  const bySectionId = groupByKey(items, (item) => item.SectionId);
  // Sort sections by RowIndex (section/row order on the page)
  const sectionOrder = stableKeys(items, (item) => item.SectionId).sort(
    (a, b) => (bySectionId[a][0]?.RowIndex ?? 0) - (bySectionId[b][0]?.RowIndex ?? 0),
  );

  return sectionOrder.map((sectionId) => {
    const sectionItems = bySectionId[sectionId];
    const byColIndex = groupByKey(sectionItems, (item) => String(item.ColumnIndex));
    const colKeys = stableKeys(sectionItems, (item) => String(item.ColumnIndex)).sort(
      (a, b) => Number(a) - Number(b),
    );

    const numCols = colKeys.length;

    const subSections: PageNode[] = colKeys.map((colKey, pos) => {
      const colItems = [...byColIndex[colKey]].sort(
        (a, b) => (a.VerticalIndex ?? 0) - (b.VerticalIndex ?? 0),
      );
      const span = colItems[0].ColumnSpan ?? Math.floor(12 / Math.max(numCols, 1));

      const componentChildren: PageNode[] = colItems
        .filter((item) => item.ComponentName !== "")
        .map((item) => ({
          type: "Component" as const,
          uniqueId: item.Id,
          componentName: item.ComponentName,
        }));

      return {
        type: "SubSection" as const,
        isGrid: true,
        gridValue: span,
        // Stable ID derived from section + column position so builder ops can find it.
        uniqueId: `${sectionId}__col${pos}`,
        children: componentChildren,
      };
    });

    return {
      type: "Section" as const,
      isGrid: true,
      gridValue: "12",
      uniqueId: sectionId,
      children: subSections,
    };
  });
};

// ─── PageNode[] → ILayoutData[] ───────────────────────────────────────────────

/**
 * Convert an internal PageNode[] tree back to a flat ILayoutData[].
 * Only processes the top-level Section → SubSection → Component depth.
 *
 * Empty SubSections (no Component children) produce placeholder items with
 * ComponentName: "" so that column structure is preserved across round-trips.
 * These placeholders are stripped by serializeLayout() before onChange callbacks.
 */
export const nodesToLayoutData = (nodes: readonly PageNode[]): ILayoutData[] => {
  const items: ILayoutData[] = [];

  const sections = nodes.filter((n) => n.type === "Section");

  sections.forEach((section, sectionIdx) => {
    const sectionId = section.uniqueId;
    const subSections = (section.children ?? []).filter((c) => c.type === "SubSection");
    const numCols = subSections.length;

    subSections.forEach((sub, colIndex) => {
      const span = Number(sub.gridValue) || Math.floor(12 / Math.max(numCols, 1));
      const components = (sub.children ?? []).filter((c) => c.type === "Component");

      if (components.length === 0) {
        items.push({
          Id: sub.uniqueId,
          SectionId: sectionId,
          RowIndex: sectionIdx,
          ColumnIndex: colIndex,
          ColumnSpan: span,
          ComponentName: "",
        });
      } else {
        components.forEach((comp, vIdx) => {
          items.push({
            Id: comp.uniqueId,
            SectionId: sectionId,
            RowIndex: sectionIdx,
            ColumnIndex: colIndex,
            ColumnSpan: span,
            VerticalIndex: vIdx,
            ComponentName: comp.componentName ?? "",
          });
        });
      }
    });
  });

  return items;
};
