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
 * Strip renderComponent (non-serializable) and plain empty-slot placeholders.
 *
 * Structural placeholders — empty columns that are parent containers for nested
 * sections — are kept because they are required to reconstruct nesting on load.
 * Safe to JSON.stringify and send to a server.
 */
export const serializeLayout = (items: ILayoutData[]): SerializableLayoutItem[] => {
  // Collect SubSection IDs that directly contain nested sections.
  const subSectionsWithNested = new Set<string>();
  for (const item of items) {
    if (item.nestedInSubSectionId) {
      subSectionsWithNested.add(item.nestedInSubSectionId);
    }
  }

  return items
    .filter((item) => {
      if (item.ComponentName !== "") return true;
      // Keep structural placeholders for columns that parent a nested section.
      const mySubSectionId = `${item.SectionId}__col${item.ColumnIndex}`;
      return subSectionsWithNested.has(mySubSectionId);
    })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .map(({ renderComponent, ...rest }) => rest);
};

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
 * Convert flat ILayoutData[] into the Section → SubSection → (Component | Section) tree
 * expected by the builder engine.
 *
 * - Each unique SectionId becomes a Section node, ordered by RowIndex.
 * - Each unique ColumnIndex within a section becomes a SubSection node.
 * - Items with nestedInSubSectionId belong to sections nested inside that SubSection.
 * - Items are sorted by VerticalIndex and become Component nodes in their SubSection.
 * - Empty-slot items (ComponentName === "") produce an empty SubSection (no Component child).
 */
export const layoutDataToNodes = (items: ILayoutData[]): readonly PageNode[] => {
  const topLevelItems = items.filter((item) => !item.nestedInSubSectionId);
  const nestedBySubSectionId = groupByKey(
    items.filter((item) => !!item.nestedInSubSectionId),
    (item) => item.nestedInSubSectionId!,
  );

  const buildSections = (sectionItems: ILayoutData[]): readonly PageNode[] => {
    if (sectionItems.length === 0) return [];

    const bySectionId = groupByKey(sectionItems, (item) => item.SectionId);
    const sectionOrder = stableKeys(sectionItems, (item) => item.SectionId).sort(
      (a, b) => (bySectionId[a][0]?.RowIndex ?? 0) - (bySectionId[b][0]?.RowIndex ?? 0),
    );

    return sectionOrder.map((sectionId) => {
      const secItems = bySectionId[sectionId];
      const byColIndex = groupByKey(secItems, (item) => String(item.ColumnIndex));
      const colKeys = stableKeys(secItems, (item) => String(item.ColumnIndex)).sort(
        (a, b) => Number(a) - Number(b),
      );

      const numCols = colKeys.length;

      const subSections: PageNode[] = colKeys.map((colKey, pos) => {
        const colItems = [...byColIndex[colKey]].sort(
          (a, b) => (a.VerticalIndex ?? 0) - (b.VerticalIndex ?? 0),
        );
        const span = colItems[0].ColumnSpan ?? Math.floor(12 / Math.max(numCols, 1));
        const subSectionId = `${sectionId}__col${pos}`;

        const componentChildren: PageNode[] = colItems
          .filter((item) => item.ComponentName !== "")
          .map((item) => ({
            type: "Component" as const,
            uniqueId: item.Id,
            componentName: item.ComponentName,
            ...(item.componentProps ? { componentProps: item.componentProps } : {}),
            ...(item.conditions ? { conditions: item.conditions } : {}),
          }));

        const nestedSections = buildSections(nestedBySubSectionId[subSectionId] ?? []);

        return {
          type: "SubSection" as const,
          isGrid: true,
          gridValue: span,
          // Stable ID derived from section + column position so builder ops can find it.
          uniqueId: subSectionId,
          children: [...componentChildren, ...nestedSections],
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

  return buildSections(topLevelItems);
};

// ─── PageNode[] → ILayoutData[] ───────────────────────────────────────────────

/**
 * Convert an internal PageNode[] tree back to a flat ILayoutData[].
 * Handles Section → SubSection → (Component | nested Section) at any depth.
 *
 * Empty SubSections (no Component children) produce placeholder items with
 * ComponentName: "" so that column structure is preserved across round-trips.
 *
 * Nested sections (Section children of a SubSection) produce items tagged with
 * nestedInSubSectionId pointing to the parent SubSection's reconstructed ID
 * (${sectionId}__col${colIndex}). serializeLayout keeps structural placeholders
 * (those that parent a nested section) so nested layouts survive server round-trips.
 */
export const nodesToLayoutData = (nodes: readonly PageNode[]): ILayoutData[] => {
  const items: ILayoutData[] = [];

  const processSection = (
    section: PageNode,
    sectionIdx: number,
    parentSubSectionId?: string,
  ) => {
    const sectionId = section.uniqueId;
    const subSections = (section.children ?? []).filter((c) => c.type === "SubSection");
    const numCols = subSections.length;

    subSections.forEach((sub, colIndex) => {
      const span = Number(sub.gridValue) || Math.floor(12 / Math.max(numCols, 1));
      const components = (sub.children ?? []).filter((c) => c.type === "Component");
      const nestedSections = (sub.children ?? []).filter((c) => c.type === "Section");
      // The stable SubSection ID this column will receive after a layoutDataToNodes round-trip.
      const reconstructedSubSectionId = `${sectionId}__col${colIndex}`;

      const nestingProp: Pick<ILayoutData, "nestedInSubSectionId"> = parentSubSectionId
        ? { nestedInSubSectionId: parentSubSectionId }
        : {};

      if (components.length === 0) {
        // Emit placeholder so column structure is preserved.
        items.push({
          Id: sub.uniqueId,
          SectionId: sectionId,
          RowIndex: sectionIdx,
          ColumnIndex: colIndex,
          ColumnSpan: span,
          ComponentName: "",
          ...nestingProp,
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
            ...(comp.componentProps ? { componentProps: comp.componentProps } : {}),
            ...(comp.conditions ? { conditions: comp.conditions } : {}),
            ...nestingProp,
          });
        });
      }

      // Recurse into nested sections, tagging their items with this SubSection's ID.
      nestedSections.forEach((nestedSection, nestedIdx) => {
        processSection(nestedSection, nestedIdx, reconstructedSubSectionId);
      });
    });
  };

  nodes.filter((n) => n.type === "Section").forEach((section, sectionIdx) => {
    processSection(section, sectionIdx);
  });

  return items;
};
