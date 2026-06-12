import type { PageNode } from "../../models/pageBuilder";
import {
  buildSubSections,
  buildSection,
  mapTree,
  filterTree,
  deepCloneWithNewIds,
  insertAfter,
  addSectionToNode,
  addSectionAfterIndex,
  changeSectionLayout,
  addComponentToNode,
  updateComponentPropsById,
  findNodeById,
  deleteNodeById,
  cloneNodeById,
} from "../treeOps";

// ─── helpers ────────────────────────────────────────────────────────────────

/** Build a minimal tree: Section → SubSection → Component */
const makeTree = (): readonly PageNode[] => {
  const section = buildSection([12]);
  const ssId = section.children![0].uniqueId;
  return addComponentToNode([section], ssId, "Banner");
};

// ─── buildSubSections ────────────────────────────────────────────────────────

describe("buildSubSections", () => {
  it("creates subsection nodes with correct types", () => {
    const nodes = buildSubSections([6, 6]);
    nodes.forEach((n) => expect(n.type).toBe("SubSection"));
  });

  it("assigns the column span as gridValue", () => {
    const nodes = buildSubSections([8, 4]);
    expect(nodes[0].gridValue).toBe(8);
    expect(nodes[1].gridValue).toBe(4);
  });

  it("assigns unique IDs", () => {
    const nodes = buildSubSections([4, 4, 4]);
    const ids = nodes.map((n) => n.uniqueId);
    expect(new Set(ids).size).toBe(3);
  });

  it("initialises children as empty array", () => {
    const nodes = buildSubSections([12]);
    expect(nodes[0].children).toEqual([]);
  });
});

// ─── buildSection ────────────────────────────────────────────────────────────

describe("buildSection", () => {
  it("returns a Section node", () => {
    expect(buildSection([12]).type).toBe("Section");
  });

  it("gridValue is '12'", () => {
    expect(buildSection([6, 6]).gridValue).toBe("12");
  });

  it("isGrid is true", () => {
    expect(buildSection([6, 6]).isGrid).toBe(true);
  });

  it("creates the correct number of SubSection children", () => {
    expect(buildSection([4, 4, 4]).children).toHaveLength(3);
  });

  it("SubSection gridValues match columns", () => {
    const section = buildSection([8, 4]);
    expect(section.children![0].gridValue).toBe(8);
    expect(section.children![1].gridValue).toBe(4);
  });
});

// ─── mapTree ─────────────────────────────────────────────────────────────────

describe("mapTree", () => {
  it("transforms every node including deeply nested ones", () => {
    const nodes = makeTree();
    const result = mapTree(nodes, (n) => ({ ...n, uniqueId: n.uniqueId + "_x" }));

    expect(result[0].uniqueId).toMatch(/_x$/);
    expect(result[0].children![0].uniqueId).toMatch(/_x$/);
    expect(result[0].children![0].children![0].uniqueId).toMatch(/_x$/);
  });

  it("does not mutate the original tree", () => {
    const nodes = makeTree();
    const original = nodes[0].uniqueId;
    mapTree(nodes, (n) => ({ ...n, uniqueId: "changed" }));
    expect(nodes[0].uniqueId).toBe(original);
  });

  it("returns a new array reference", () => {
    const nodes = makeTree();
    const result = mapTree(nodes, (n) => n);
    expect(result).not.toBe(nodes);
  });
});

// ─── filterTree ──────────────────────────────────────────────────────────────

describe("filterTree", () => {
  it("removes a root-level node by uniqueId", () => {
    const s1 = buildSection([12]);
    const s2 = buildSection([12]);
    const result = filterTree([s1, s2], s1.uniqueId);
    expect(result).toHaveLength(1);
    expect(result[0].uniqueId).toBe(s2.uniqueId);
  });

  it("removes a deeply nested node", () => {
    const nodes = makeTree();
    const compId = nodes[0].children![0].children![0].uniqueId;
    const result = filterTree(nodes, compId);
    expect(result[0].children![0].children).toHaveLength(0);
  });

  it("is a no-op when the ID does not exist", () => {
    const nodes = makeTree();
    const result = filterTree(nodes, "nonexistent");
    expect(result).toHaveLength(1);
  });

  it("preserves sibling nodes after removal", () => {
    const section = buildSection([12]);
    const ssId = section.children![0].uniqueId;
    const withTwo = addComponentToNode(
      addComponentToNode([section], ssId, "Banner"),
      ssId,
      "News",
    );
    const comp0Id = withTwo[0].children![0].children![0].uniqueId;
    const result = filterTree(withTwo, comp0Id);
    expect(result[0].children![0].children).toHaveLength(1);
    expect(result[0].children![0].children![0].componentName).toBe("News");
  });
});

// ─── deepCloneWithNewIds ──────────────────────────────────────────────────────

describe("deepCloneWithNewIds", () => {
  it("gives the root node a new uniqueId", () => {
    const section = buildSection([12]);
    const clone = deepCloneWithNewIds(section);
    expect(clone.uniqueId).not.toBe(section.uniqueId);
  });

  it("gives every descendant a new uniqueId", () => {
    const nodes = makeTree();
    const section = nodes[0];
    const ssId = section.children![0].uniqueId;
    const compId = section.children![0].children![0].uniqueId;

    const clone = deepCloneWithNewIds(section);
    expect(clone.children![0].uniqueId).not.toBe(ssId);
    expect(clone.children![0].children![0].uniqueId).not.toBe(compId);
  });

  it("preserves all non-ID fields", () => {
    const section = buildSection([6, 6]);
    const clone = deepCloneWithNewIds(section);
    expect(clone.type).toBe("Section");
    expect(clone.isGrid).toBe(true);
    expect(clone.gridValue).toBe("12");
    expect(clone.children).toHaveLength(2);
  });

  it("preserves componentProps on cloned component", () => {
    const section = buildSection([12]);
    const ssId = section.children![0].uniqueId;
    const withComp = addComponentToNode([section], ssId, "Banner", { heading: "Hi" });
    const clone = deepCloneWithNewIds(withComp[0]);
    expect(clone.children![0].children![0].componentProps).toEqual({ heading: "Hi" });
  });
});

// ─── insertAfter ─────────────────────────────────────────────────────────────

describe("insertAfter", () => {
  it("inserts at position index+1", () => {
    expect(insertAfter(["a", "b", "c"], 1, "x")).toEqual(["a", "b", "x", "c"]);
  });

  it("appends when index is the last element", () => {
    expect(insertAfter(["a", "b"], 1, "x")).toEqual(["a", "b", "x"]);
  });

  it("inserts at index 1 when afterIndex is 0", () => {
    expect(insertAfter(["a", "b"], 0, "x")).toEqual(["a", "x", "b"]);
  });

  it("prepends when afterIndex is -1", () => {
    expect(insertAfter(["a", "b"], -1, "x")).toEqual(["x", "a", "b"]);
  });
});

// ─── addSectionToNode ────────────────────────────────────────────────────────

describe("addSectionToNode", () => {
  it("appends a Section to __root__", () => {
    const s1 = buildSection([12]);
    const result = addSectionToNode([s1], "__root__", [6, 6]);
    expect(result).toHaveLength(2);
    expect(result[1].type).toBe("Section");
    expect(result[1].children).toHaveLength(2);
  });

  it("adds a nested Section inside the target SubSection", () => {
    const section = buildSection([12]);
    const ssId = section.children![0].uniqueId;
    const result = addSectionToNode([section], ssId, [6, 6]);
    const ss = result[0].children![0];
    expect(ss.children).toHaveLength(1);
    expect(ss.children![0].type).toBe("Section");
    expect(ss.children![0].children).toHaveLength(2);
  });

  it("is a no-op when targetId does not exist", () => {
    const nodes = [buildSection([12])];
    const result = addSectionToNode(nodes, "nonexistent", [12]);
    expect(result[0].children).toHaveLength(1); // SubSection still there, nothing added
  });
});

// ─── addSectionAfterIndex ─────────────────────────────────────────────────────

describe("addSectionAfterIndex", () => {
  it("inserts after the given root index", () => {
    const s1 = buildSection([12]);
    const s2 = buildSection([12]);
    const result = addSectionAfterIndex([s1, s2], "__root__", 0, [4, 4, 4]);
    expect(result).toHaveLength(3);
    expect(result[0].uniqueId).toBe(s1.uniqueId);
    expect(result[1].type).toBe("Section");
    expect(result[2].uniqueId).toBe(s2.uniqueId);
  });

  it("prepends when afterIndex is -1", () => {
    const s1 = buildSection([12]);
    const result = addSectionAfterIndex([s1], "__root__", -1, [12]);
    expect(result).toHaveLength(2);
    expect(result[0].type).toBe("Section");
    expect(result[1].uniqueId).toBe(s1.uniqueId);
  });

  it("appends when afterIndex is at the last element", () => {
    const s1 = buildSection([12]);
    const result = addSectionAfterIndex([s1], "__root__", 0, [6, 6]);
    expect(result).toHaveLength(2);
    expect(result[1].children).toHaveLength(2);
  });
});

// ─── changeSectionLayout ─────────────────────────────────────────────────────

describe("changeSectionLayout", () => {
  it("updates column spans and count", () => {
    const section = buildSection([12]);
    const result = changeSectionLayout([section], section.uniqueId, [6, 6]);
    expect(result[0].children).toHaveLength(2);
    expect(result[0].children![0].gridValue).toBe(6);
    expect(result[0].children![1].gridValue).toBe(6);
  });

  it("preserves existing SubSection children at matching positions", () => {
    const section = buildSection([12]);
    const ssId = section.children![0].uniqueId;
    const withComp = addComponentToNode([section], ssId, "Banner");
    const result = changeSectionLayout(withComp, section.uniqueId, [8, 4]);
    // Col 0 retains its component
    expect(result[0].children![0].children).toHaveLength(1);
    expect(result[0].children![0].children![0].componentName).toBe("Banner");
    // Col 1 is new and empty
    expect(result[0].children![1].children).toHaveLength(0);
  });

  it("drops extra columns when reducing count", () => {
    const section = buildSection([4, 4, 4]);
    const result = changeSectionLayout([section], section.uniqueId, [6, 6]);
    expect(result[0].children).toHaveLength(2);
  });

  it("is a no-op when the sectionId does not exist", () => {
    const nodes = [buildSection([12])];
    const result = changeSectionLayout(nodes, "nonexistent", [6, 6]);
    expect(result[0].children).toHaveLength(1);
  });
});

// ─── addComponentToNode ──────────────────────────────────────────────────────

describe("addComponentToNode", () => {
  it("adds a Component node to the target SubSection", () => {
    const section = buildSection([12]);
    const ssId = section.children![0].uniqueId;
    const result = addComponentToNode([section], ssId, "Banner");
    expect(result[0].children![0].children).toHaveLength(1);
    expect(result[0].children![0].children![0].type).toBe("Component");
    expect(result[0].children![0].children![0].componentName).toBe("Banner");
  });

  it("appends to existing components", () => {
    const section = buildSection([12]);
    const ssId = section.children![0].uniqueId;
    const after1 = addComponentToNode([section], ssId, "Banner");
    const after2 = addComponentToNode(after1, ssId, "News");
    expect(after2[0].children![0].children).toHaveLength(2);
    expect(after2[0].children![0].children![1].componentName).toBe("News");
  });

  it("stores componentProps when provided", () => {
    const section = buildSection([12]);
    const ssId = section.children![0].uniqueId;
    const result = addComponentToNode([section], ssId, "Banner", { heading: "Hello" });
    expect(result[0].children![0].children![0].componentProps).toEqual({ heading: "Hello" });
  });

  it("assigns a new unique ID to the added component", () => {
    const section = buildSection([12]);
    const ssId = section.children![0].uniqueId;
    const after1 = addComponentToNode([section], ssId, "Banner");
    const after2 = addComponentToNode(after1, ssId, "News");
    const ids = after2[0].children![0].children!.map((c) => c.uniqueId);
    expect(new Set(ids).size).toBe(2);
  });

  it("is a no-op when targetId does not exist", () => {
    const nodes = makeTree();
    const before = nodes[0].children![0].children!.length;
    const result = addComponentToNode(nodes, "nonexistent", "Banner");
    expect(result[0].children![0].children).toHaveLength(before);
  });
});

// ─── updateComponentPropsById ────────────────────────────────────────────────

describe("updateComponentPropsById", () => {
  it("merges new props with existing props", () => {
    const nodes = makeTree();
    const compId = nodes[0].children![0].children![0].uniqueId;
    const withProps = updateComponentPropsById(nodes, compId, { color: "blue", heading: "Old" });
    const result = updateComponentPropsById(withProps, compId, { heading: "New" });
    expect(result[0].children![0].children![0].componentProps).toEqual({
      color: "blue",
      heading: "New",
    });
  });

  it("creates componentProps when the node has none", () => {
    const nodes = makeTree();
    const compId = nodes[0].children![0].children![0].uniqueId;
    const result = updateComponentPropsById(nodes, compId, { label: "Test" });
    expect(result[0].children![0].children![0].componentProps).toEqual({ label: "Test" });
  });

  it("is a no-op when nodeId does not exist", () => {
    const nodes = makeTree();
    const result = updateComponentPropsById(nodes, "nonexistent", { x: 1 });
    expect(result[0].children![0].children![0].componentProps).toBeUndefined();
  });
});

// ─── findNodeById ────────────────────────────────────────────────────────────

describe("findNodeById", () => {
  it("finds a root-level section", () => {
    const nodes = makeTree();
    const found = findNodeById(nodes, nodes[0].uniqueId);
    expect(found?.uniqueId).toBe(nodes[0].uniqueId);
    expect(found?.type).toBe("Section");
  });

  it("finds a SubSection nested inside a Section", () => {
    const nodes = makeTree();
    const ssId = nodes[0].children![0].uniqueId;
    const found = findNodeById(nodes, ssId);
    expect(found?.type).toBe("SubSection");
  });

  it("finds a deeply nested Component", () => {
    const nodes = makeTree();
    const compId = nodes[0].children![0].children![0].uniqueId;
    const found = findNodeById(nodes, compId);
    expect(found?.type).toBe("Component");
    expect(found?.componentName).toBe("Banner");
  });

  it("returns undefined when the node does not exist", () => {
    expect(findNodeById(makeTree(), "nonexistent")).toBeUndefined();
  });

  it("returns undefined for an empty array", () => {
    expect(findNodeById([], "any")).toBeUndefined();
  });
});

// ─── deleteNodeById ──────────────────────────────────────────────────────────

describe("deleteNodeById", () => {
  it("removes a root-level section", () => {
    const s1 = buildSection([12]);
    const s2 = buildSection([12]);
    const result = deleteNodeById([s1, s2], s1.uniqueId);
    expect(result).toHaveLength(1);
    expect(result[0].uniqueId).toBe(s2.uniqueId);
  });

  it("removes a nested Component", () => {
    const nodes = makeTree();
    const compId = nodes[0].children![0].children![0].uniqueId;
    const result = deleteNodeById(nodes, compId);
    expect(result[0].children![0].children).toHaveLength(0);
  });

  it("removes a SubSection and its descendants", () => {
    const nodes = makeTree();
    const ssId = nodes[0].children![0].uniqueId;
    const result = deleteNodeById(nodes, ssId);
    expect(result[0].children).toHaveLength(0);
  });

  it("is a no-op when nodeId does not exist", () => {
    const nodes = makeTree();
    const result = deleteNodeById(nodes, "nonexistent");
    expect(result).toHaveLength(1);
  });
});

// ─── cloneNodeById ────────────────────────────────────────────────────────────

describe("cloneNodeById", () => {
  it("clones a root-level section and inserts it after the original", () => {
    const section = buildSection([12]);
    const clone = cloneNodeById([section])(section.uniqueId);
    expect(clone).toHaveLength(2);
    expect(clone[0].uniqueId).toBe(section.uniqueId);
    expect(clone[1].uniqueId).not.toBe(section.uniqueId);
    expect(clone[1].type).toBe("Section");
  });

  it("clones with new IDs at every depth", () => {
    const nodes = makeTree();
    const section = nodes[0];
    const ssId = section.children![0].uniqueId;
    const compId = section.children![0].children![0].uniqueId;

    const result = cloneNodeById(nodes)(section.uniqueId);
    const cloned = result[1];

    expect(cloned.uniqueId).not.toBe(section.uniqueId);
    expect(cloned.children![0].uniqueId).not.toBe(ssId);
    expect(cloned.children![0].children![0].uniqueId).not.toBe(compId);
  });

  it("preserves componentName in the clone", () => {
    const nodes = makeTree();
    const result = cloneNodeById(nodes)(nodes[0].uniqueId);
    expect(result[1].children![0].children![0].componentName).toBe("Banner");
  });

  it("clones a nested Component and inserts it after itself", () => {
    const nodes = makeTree();
    const compId = nodes[0].children![0].children![0].uniqueId;
    const result = cloneNodeById(nodes)(compId);
    const children = result[0].children![0].children!;
    expect(children).toHaveLength(2);
    expect(children[0].uniqueId).toBe(compId);
    expect(children[1].uniqueId).not.toBe(compId);
    expect(children[1].componentName).toBe("Banner");
  });

  it("is a no-op when nodeId does not exist", () => {
    const nodes = makeTree();
    const result = cloneNodeById(nodes)("nonexistent");
    expect(result).toHaveLength(1);
  });
});
