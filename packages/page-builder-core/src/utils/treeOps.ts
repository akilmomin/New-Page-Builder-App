/**
 * treeOps — pure, immutable operations on a PageNode tree.
 *
 * All functions return a new tree; the original is never modified.
 * Array mutations (push, splice, etc.) are deliberately avoided.
 */

import type { PageNode } from "../models/pageBuilder";
import { generateId } from "./generateId";

// ─── Build helpers ────────────────────────────────────────────────────────────

export const buildSubSections = (
  columns: readonly number[]
): readonly PageNode[] =>
  columns.map((col) => ({
    type: "SubSection" as const,
    isGrid: true,
    gridValue: col,
    uniqueId: generateId(),
    children: [] as readonly PageNode[],
  }));

export const buildSection = (columns: readonly number[]): PageNode => ({
  type: "Section" as const,
  isGrid: true,
  gridValue: "12",
  uniqueId: generateId(),
  children: buildSubSections(columns),
});

// ─── Recursive tree transformers ──────────────────────────────────────────────

/** Map over every node in the tree, returning a new tree. */
export const mapTree = (
  nodes: readonly PageNode[],
  transform: (node: PageNode) => PageNode
): readonly PageNode[] =>
  nodes.map((node) => {
    const transformed = transform(node);
    if (!transformed.children) return transformed;
    return {
      ...transformed,
      children: mapTree(transformed.children, transform),
    };
  });

/** Filter — remove a node by uniqueId at any depth. */
export const filterTree = (
  nodes: readonly PageNode[],
  removeId: string
): readonly PageNode[] =>
  nodes
    .filter((node) => node.uniqueId !== removeId)
    .map((node) => {
      if (!node.children) return node;
      return { ...node, children: filterTree(node.children, removeId) };
    });

/** Deep-clone a node and give every descendant a fresh uniqueId. */
export const deepCloneWithNewIds = (node: PageNode): PageNode => ({
  ...node,
  uniqueId: generateId(),
  children: node.children?.map(deepCloneWithNewIds),
});

// ─── Array helpers ────────────────────────────────────────────────────────────

/** Insert item after the element at `index` — immutably. */
export const insertAfter = <T>(
  arr: readonly T[],
  index: number,
  item: T
): readonly T[] => [
  ...arr.slice(0, index + 1),
  item,
  ...arr.slice(index + 1),
];

// ─── High-level tree operations ───────────────────────────────────────────────

/** Add a new Section inside the node identified by `targetId`.
 *  Pass `"__root__"` to append a top-level section to the canvas. */
export const addSectionToNode = (
  nodes: readonly PageNode[],
  targetId: string,
  columns: readonly number[]
): readonly PageNode[] => {
  const newSection = buildSection(columns);
  if (targetId === "__root__") return [...nodes, newSection];
  return mapTree(nodes, (node) => {
    if (node.uniqueId !== targetId) return node;
    return { ...node, children: [newSection] };
  });
};

/** Add a Section after sibling at `afterIndex` inside `parentId`. */
export const addSectionAfterIndex = (
  nodes: readonly PageNode[],
  parentId: string,
  afterIndex: number,
  columns: readonly number[]
): readonly PageNode[] => {
  const newSection = buildSection(columns);
  return mapTree(nodes, (node) => {
    if (node.uniqueId !== parentId || !node.children) return node;
    return {
      ...node,
      children: insertAfter(node.children, afterIndex, newSection),
    };
  });
};

/** Add a Component node inside the node identified by `targetId`. */
export const addComponentToNode = (
  nodes: readonly PageNode[],
  targetId: string,
  componentName: string,
  componentProps?: Record<string, unknown>
): readonly PageNode[] => {
  const componentNode: PageNode = {
    type: "Component",
    componentName,
    uniqueId: generateId(),
    ...(componentProps ? { componentProps } : {}),
  };
  return mapTree(nodes, (node) => {
    if (node.uniqueId !== targetId) return node;
    return { ...node, children: [componentNode] };
  });
};

/** Delete the node identified by `nodeId`. */
export const deleteNodeById = (
  nodes: readonly PageNode[],
  nodeId: string
): readonly PageNode[] => filterTree(nodes, nodeId);

/** Clone the node identified by `nodeId` and insert it after itself. */
export const cloneNodeById = (
  nodes: readonly PageNode[]
): (nodeId: string) => readonly PageNode[] =>
  (nodeId: string) => {
    const cloneInTree = (
      arr: readonly PageNode[]
    ): readonly PageNode[] => {
      const idx = arr.findIndex((n) => n.uniqueId === nodeId);
      if (idx !== -1) {
        const cloned = deepCloneWithNewIds(arr[idx]);
        return insertAfter(arr, idx, cloned);
      }
      return arr.map((node) => {
        if (!node.children) return node;
        return { ...node, children: cloneInTree(node.children) };
      });
    };
    return cloneInTree(nodes);
  };
