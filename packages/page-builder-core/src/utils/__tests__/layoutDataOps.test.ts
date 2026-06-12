import type { ILayoutData, PageNode } from "../../models/pageBuilder";
import { serializeLayout, layoutDataToNodes, nodesToLayoutData } from "../layoutDataOps";

// ─── serializeLayout ─────────────────────────────────────────────────────────

describe("serializeLayout", () => {
  it("strips items with empty ComponentName (plain placeholders)", () => {
    const items: ILayoutData[] = [
      { Id: "a", SectionId: "s1", RowIndex: 0, ColumnIndex: 0, ComponentName: "Banner" },
      { Id: "b", SectionId: "s1", RowIndex: 0, ColumnIndex: 1, ComponentName: "" },
    ];
    const result = serializeLayout(items);
    expect(result).toHaveLength(1);
    expect(result[0].ComponentName).toBe("Banner");
  });

  it("strips renderComponent function", () => {
    const items: ILayoutData[] = [
      {
        Id: "a",
        SectionId: "s1",
        RowIndex: 0,
        ColumnIndex: 0,
        ComponentName: "Banner",
        renderComponent: () => ({ type: "div", props: {}, key: null }),
      },
    ];
    const result = serializeLayout(items);
    expect("renderComponent" in result[0]).toBe(false);
  });

  it("keeps items with non-empty ComponentName", () => {
    const items: ILayoutData[] = [
      { Id: "a", SectionId: "s1", RowIndex: 0, ColumnIndex: 0, ComponentName: "Banner" },
      { Id: "b", SectionId: "s1", RowIndex: 0, ColumnIndex: 1, ComponentName: "News" },
    ];
    expect(serializeLayout(items)).toHaveLength(2);
  });

  it("keeps structural placeholders that parent nested sections", () => {
    // s1 col0 is a structural placeholder — it parents a nested section
    const items: ILayoutData[] = [
      { Id: "sub0", SectionId: "s1", RowIndex: 0, ColumnIndex: 0, ColumnSpan: 8, ComponentName: "" },
      { Id: "c1", SectionId: "sNested", RowIndex: 0, ColumnIndex: 0, ColumnSpan: 12, ComponentName: "Banner", nestedInSubSectionId: "s1__col0" },
    ];
    const result = serializeLayout(items);
    // Structural placeholder for s1__col0 is kept; nested component is kept
    expect(result).toHaveLength(2);
    expect(result.find((i) => i.ComponentName === "")).toBeDefined();
  });

  it("does not keep plain placeholders that have no nested sections", () => {
    const items: ILayoutData[] = [
      { Id: "sub0", SectionId: "s1", RowIndex: 0, ColumnIndex: 0, ComponentName: "" },
      { Id: "sub1", SectionId: "s1", RowIndex: 0, ColumnIndex: 1, ComponentName: "" },
    ];
    expect(serializeLayout(items)).toHaveLength(0);
  });

  it("does not mutate the input array", () => {
    const items: ILayoutData[] = [
      { Id: "a", SectionId: "s1", RowIndex: 0, ColumnIndex: 0, ComponentName: "Banner" },
    ];
    const copy = [...items];
    serializeLayout(items);
    expect(items).toEqual(copy);
  });
});

// ─── layoutDataToNodes ───────────────────────────────────────────────────────

describe("layoutDataToNodes", () => {
  it("returns an empty array for empty input", () => {
    expect(layoutDataToNodes([])).toHaveLength(0);
  });

  it("creates Section → SubSection → Component from a single item", () => {
    const items: ILayoutData[] = [
      { Id: "c1", SectionId: "s1", RowIndex: 0, ColumnIndex: 0, ComponentName: "Banner" },
    ];
    const nodes = layoutDataToNodes(items);
    expect(nodes).toHaveLength(1);
    expect(nodes[0].type).toBe("Section");
    expect(nodes[0].uniqueId).toBe("s1");
    expect(nodes[0].children).toHaveLength(1);
    expect(nodes[0].children![0].type).toBe("SubSection");
    expect(nodes[0].children![0].children).toHaveLength(1);
    expect(nodes[0].children![0].children![0].type).toBe("Component");
    expect(nodes[0].children![0].children![0].uniqueId).toBe("c1");
    expect(nodes[0].children![0].children![0].componentName).toBe("Banner");
  });

  it("orders sections by RowIndex", () => {
    const items: ILayoutData[] = [
      { Id: "c2", SectionId: "s2", RowIndex: 1, ColumnIndex: 0, ComponentName: "News" },
      { Id: "c1", SectionId: "s1", RowIndex: 0, ColumnIndex: 0, ComponentName: "Banner" },
    ];
    const nodes = layoutDataToNodes(items);
    expect(nodes[0].uniqueId).toBe("s1");
    expect(nodes[1].uniqueId).toBe("s2");
  });

  it("creates multiple SubSections ordered by ColumnIndex", () => {
    const items: ILayoutData[] = [
      { Id: "c1", SectionId: "s1", RowIndex: 0, ColumnIndex: 1, ComponentName: "News" },
      { Id: "c0", SectionId: "s1", RowIndex: 0, ColumnIndex: 0, ComponentName: "Banner" },
    ];
    const nodes = layoutDataToNodes(items);
    const section = nodes[0];
    expect(section.children).toHaveLength(2);
    expect(section.children![0].children![0].componentName).toBe("Banner");
    expect(section.children![1].children![0].componentName).toBe("News");
  });

  it("stacks components in a column by VerticalIndex", () => {
    const items: ILayoutData[] = [
      { Id: "c1", SectionId: "s1", RowIndex: 0, ColumnIndex: 0, VerticalIndex: 1, ComponentName: "News" },
      { Id: "c0", SectionId: "s1", RowIndex: 0, ColumnIndex: 0, VerticalIndex: 0, ComponentName: "Banner" },
    ];
    const nodes = layoutDataToNodes(items);
    const col = nodes[0].children![0];
    expect(col.children).toHaveLength(2);
    expect(col.children![0].componentName).toBe("Banner");
    expect(col.children![1].componentName).toBe("News");
  });

  it("produces an empty SubSection for a placeholder item (ComponentName '')", () => {
    const items: ILayoutData[] = [
      { Id: "sub0", SectionId: "s1", RowIndex: 0, ColumnIndex: 0, ComponentName: "" },
    ];
    const nodes = layoutDataToNodes(items);
    expect(nodes[0].children![0].children).toHaveLength(0);
  });

  it("uses ColumnSpan as SubSection gridValue", () => {
    const items: ILayoutData[] = [
      { Id: "c0", SectionId: "s1", RowIndex: 0, ColumnIndex: 0, ColumnSpan: 8, ComponentName: "Banner" },
    ];
    const nodes = layoutDataToNodes(items);
    expect(nodes[0].children![0].gridValue).toBe(8);
  });

  it("defaults ColumnSpan to equal distribution when omitted", () => {
    const items: ILayoutData[] = [
      { Id: "a", SectionId: "s1", RowIndex: 0, ColumnIndex: 0, ComponentName: "Banner" },
      { Id: "b", SectionId: "s1", RowIndex: 0, ColumnIndex: 1, ComponentName: "News" },
    ];
    const nodes = layoutDataToNodes(items);
    expect(nodes[0].children![0].gridValue).toBe(6); // 12 / 2
    expect(nodes[0].children![1].gridValue).toBe(6);
  });

  it("derives SubSection uniqueId as ${sectionId}__col${pos}", () => {
    const items: ILayoutData[] = [
      { Id: "c0", SectionId: "sec1", RowIndex: 0, ColumnIndex: 0, ComponentName: "Banner" },
    ];
    const nodes = layoutDataToNodes(items);
    expect(nodes[0].children![0].uniqueId).toBe("sec1__col0");
  });

  it("preserves componentProps on the Component node", () => {
    const items: ILayoutData[] = [
      {
        Id: "c0",
        SectionId: "s1",
        RowIndex: 0,
        ColumnIndex: 0,
        ComponentName: "Banner",
        componentProps: { heading: "Hello", color: "blue" },
      },
    ];
    const nodes = layoutDataToNodes(items);
    expect(nodes[0].children![0].children![0].componentProps).toEqual({
      heading: "Hello",
      color: "blue",
    });
  });

  it("preserves conditions on the Component node", () => {
    const items: ILayoutData[] = [
      {
        Id: "c0",
        SectionId: "s1",
        RowIndex: 0,
        ColumnIndex: 0,
        ComponentName: "Banner",
        conditions: [{ when: "role", operator: "eq", value: "admin", then: "hide" }],
      },
    ];
    const nodes = layoutDataToNodes(items);
    expect(nodes[0].children![0].children![0].conditions).toEqual([
      { when: "role", operator: "eq", value: "admin", then: "hide" },
    ]);
  });

  it("reconstructs a nested Section from nestedInSubSectionId", () => {
    const items: ILayoutData[] = [
      // Outer section col0 structural placeholder
      { Id: "s1__col0", SectionId: "s1", RowIndex: 0, ColumnIndex: 0, ColumnSpan: 8, ComponentName: "" },
      // Nested section component
      { Id: "comp1", SectionId: "sNested", RowIndex: 0, ColumnIndex: 0, ColumnSpan: 12, ComponentName: "Banner", nestedInSubSectionId: "s1__col0" },
      // Outer section col1 component
      { Id: "comp2", SectionId: "s1", RowIndex: 0, ColumnIndex: 1, ColumnSpan: 4, ComponentName: "News" },
    ];
    const nodes = layoutDataToNodes(items);

    expect(nodes).toHaveLength(1);
    const outerSection = nodes[0];
    expect(outerSection.uniqueId).toBe("s1");
    expect(outerSection.children).toHaveLength(2);

    // col0 should contain the nested section
    const col0 = outerSection.children![0];
    expect(col0.children).toHaveLength(1);
    const innerSection = col0.children![0];
    expect(innerSection.type).toBe("Section");
    expect(innerSection.uniqueId).toBe("sNested");
    expect(innerSection.children![0].children![0].componentName).toBe("Banner");

    // col1 should contain News
    expect(outerSection.children![1].children![0].componentName).toBe("News");
  });
});

// ─── nodesToLayoutData ───────────────────────────────────────────────────────

describe("nodesToLayoutData", () => {
  it("returns an empty array for empty input", () => {
    expect(nodesToLayoutData([])).toHaveLength(0);
  });

  it("flattens Section → SubSection → Component to a single item", () => {
    const nodes: PageNode[] = [{
      type: "Section",
      uniqueId: "s1",
      isGrid: true,
      gridValue: "12",
      children: [{
        type: "SubSection",
        uniqueId: "s1__col0",
        isGrid: true,
        gridValue: 12,
        children: [{ type: "Component", uniqueId: "c1", componentName: "Banner" }],
      }],
    }];
    const items = nodesToLayoutData(nodes);
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      Id: "c1",
      SectionId: "s1",
      RowIndex: 0,
      ColumnIndex: 0,
      ComponentName: "Banner",
    });
  });

  it("assigns correct RowIndex per section", () => {
    const nodes: PageNode[] = [
      { type: "Section", uniqueId: "s1", isGrid: true, gridValue: "12", children: [{ type: "SubSection", uniqueId: "s1c0", isGrid: true, gridValue: 12, children: [{ type: "Component", uniqueId: "c1", componentName: "Banner" }] }] },
      { type: "Section", uniqueId: "s2", isGrid: true, gridValue: "12", children: [{ type: "SubSection", uniqueId: "s2c0", isGrid: true, gridValue: 12, children: [{ type: "Component", uniqueId: "c2", componentName: "News" }] }] },
    ];
    const items = nodesToLayoutData(nodes);
    expect(items.find((i) => i.Id === "c1")!.RowIndex).toBe(0);
    expect(items.find((i) => i.Id === "c2")!.RowIndex).toBe(1);
  });

  it("assigns correct ColumnIndex per SubSection", () => {
    const nodes: PageNode[] = [{
      type: "Section",
      uniqueId: "s1",
      isGrid: true,
      gridValue: "12",
      children: [
        { type: "SubSection", uniqueId: "s1c0", isGrid: true, gridValue: 8, children: [{ type: "Component", uniqueId: "c0", componentName: "Banner" }] },
        { type: "SubSection", uniqueId: "s1c1", isGrid: true, gridValue: 4, children: [{ type: "Component", uniqueId: "c1", componentName: "News" }] },
      ],
    }];
    const items = nodesToLayoutData(nodes);
    expect(items.find((i) => i.Id === "c0")!.ColumnIndex).toBe(0);
    expect(items.find((i) => i.Id === "c1")!.ColumnIndex).toBe(1);
  });

  it("assigns correct VerticalIndex for stacked components", () => {
    const nodes: PageNode[] = [{
      type: "Section",
      uniqueId: "s1",
      isGrid: true,
      gridValue: "12",
      children: [{
        type: "SubSection",
        uniqueId: "s1c0",
        isGrid: true,
        gridValue: 12,
        children: [
          { type: "Component", uniqueId: "c0", componentName: "Banner" },
          { type: "Component", uniqueId: "c1", componentName: "News" },
        ],
      }],
    }];
    const items = nodesToLayoutData(nodes);
    expect(items.find((i) => i.Id === "c0")!.VerticalIndex).toBe(0);
    expect(items.find((i) => i.Id === "c1")!.VerticalIndex).toBe(1);
  });

  it("emits a placeholder item (ComponentName '') for an empty SubSection", () => {
    const nodes: PageNode[] = [{
      type: "Section",
      uniqueId: "s1",
      isGrid: true,
      gridValue: "12",
      children: [{ type: "SubSection", uniqueId: "s1c0", isGrid: true, gridValue: 12, children: [] }],
    }];
    const items = nodesToLayoutData(nodes);
    expect(items).toHaveLength(1);
    expect(items[0].ComponentName).toBe("");
  });

  it("preserves componentProps", () => {
    const nodes: PageNode[] = [{
      type: "Section", uniqueId: "s1", isGrid: true, gridValue: "12",
      children: [{
        type: "SubSection", uniqueId: "s1c0", isGrid: true, gridValue: 12,
        children: [{ type: "Component", uniqueId: "c0", componentName: "Banner", componentProps: { heading: "Hi" } }],
      }],
    }];
    const items = nodesToLayoutData(nodes);
    expect(items[0].componentProps).toEqual({ heading: "Hi" });
  });

  it("preserves conditions", () => {
    const cond = [{ when: "role", operator: "eq" as const, value: "admin", then: "hide" as const }];
    const nodes: PageNode[] = [{
      type: "Section", uniqueId: "s1", isGrid: true, gridValue: "12",
      children: [{
        type: "SubSection", uniqueId: "s1c0", isGrid: true, gridValue: 12,
        children: [{ type: "Component", uniqueId: "c0", componentName: "Banner", conditions: cond }],
      }],
    }];
    const items = nodesToLayoutData(nodes);
    expect(items[0].conditions).toEqual(cond);
  });

  it("tags nested section items with nestedInSubSectionId", () => {
    const nodes: PageNode[] = [{
      type: "Section",
      uniqueId: "outer",
      isGrid: true,
      gridValue: "12",
      children: [{
        type: "SubSection",
        uniqueId: "outer__col0",
        isGrid: true,
        gridValue: 12,
        children: [{
          type: "Section",
          uniqueId: "inner",
          isGrid: true,
          gridValue: "12",
          children: [{
            type: "SubSection",
            uniqueId: "inner__col0",
            isGrid: true,
            gridValue: 12,
            children: [{ type: "Component", uniqueId: "comp1", componentName: "Banner" }],
          }],
        }],
      }],
    }];

    const items = nodesToLayoutData(nodes);
    const nested = items.find((i) => i.SectionId === "inner");
    expect(nested).toBeDefined();
    expect(nested!.nestedInSubSectionId).toBe("outer__col0");
  });

  it("emits a structural placeholder for an outer col that only contains nested sections", () => {
    const nodes: PageNode[] = [{
      type: "Section",
      uniqueId: "outer",
      isGrid: true,
      gridValue: "12",
      children: [{
        type: "SubSection",
        uniqueId: "outer__col0",
        isGrid: true,
        gridValue: 12,
        children: [{
          type: "Section",
          uniqueId: "inner",
          isGrid: true,
          gridValue: "12",
          children: [{
            type: "SubSection", uniqueId: "inner__col0", isGrid: true, gridValue: 12,
            children: [{ type: "Component", uniqueId: "c1", componentName: "Banner" }],
          }],
        }],
      }],
    }];

    const items = nodesToLayoutData(nodes);
    const placeholder = items.find((i) => i.SectionId === "outer" && i.ComponentName === "");
    expect(placeholder).toBeDefined();
    expect(placeholder!.ColumnIndex).toBe(0);
  });
});

// ─── Round-trips ─────────────────────────────────────────────────────────────

describe("round-trip: nodesToLayoutData → layoutDataToNodes", () => {
  it("preserves a flat single-component layout", () => {
    const nodes: PageNode[] = [{
      type: "Section", uniqueId: "s1", isGrid: true, gridValue: "12",
      children: [{
        type: "SubSection", uniqueId: "s1__col0", isGrid: true, gridValue: 12,
        children: [{ type: "Component", uniqueId: "c1", componentName: "Banner" }],
      }],
    }];

    const restored = layoutDataToNodes(nodesToLayoutData(nodes));
    expect(restored[0].uniqueId).toBe("s1");
    expect(restored[0].children![0].children![0].componentName).toBe("Banner");
    expect(restored[0].children![0].children![0].uniqueId).toBe("c1");
  });

  it("preserves section and column order in a multi-section layout", () => {
    const nodes: PageNode[] = [
      {
        type: "Section", uniqueId: "s1", isGrid: true, gridValue: "12",
        children: [
          { type: "SubSection", uniqueId: "s1__col0", isGrid: true, gridValue: 8, children: [{ type: "Component", uniqueId: "c1", componentName: "Banner" }] },
          { type: "SubSection", uniqueId: "s1__col1", isGrid: true, gridValue: 4, children: [{ type: "Component", uniqueId: "c2", componentName: "News" }] },
        ],
      },
      {
        type: "Section", uniqueId: "s2", isGrid: true, gridValue: "12",
        children: [{ type: "SubSection", uniqueId: "s2__col0", isGrid: true, gridValue: 12, children: [{ type: "Component", uniqueId: "c3", componentName: "Event" }] }],
      },
    ];

    const restored = layoutDataToNodes(nodesToLayoutData(nodes));
    expect(restored).toHaveLength(2);
    expect(restored[0].uniqueId).toBe("s1");
    expect(restored[0].children![0].children![0].componentName).toBe("Banner");
    expect(restored[0].children![1].children![0].componentName).toBe("News");
    expect(restored[1].uniqueId).toBe("s2");
    expect(restored[1].children![0].children![0].componentName).toBe("Event");
  });

  it("preserves componentProps through the round-trip", () => {
    const nodes: PageNode[] = [{
      type: "Section", uniqueId: "s1", isGrid: true, gridValue: "12",
      children: [{
        type: "SubSection", uniqueId: "s1__col0", isGrid: true, gridValue: 12,
        children: [{ type: "Component", uniqueId: "c1", componentName: "Banner", componentProps: { heading: "Hello", color: "blue" } }],
      }],
    }];

    const restored = layoutDataToNodes(nodesToLayoutData(nodes));
    expect(restored[0].children![0].children![0].componentProps).toEqual({ heading: "Hello", color: "blue" });
  });

  it("preserves conditions through the round-trip", () => {
    const cond = [{ when: "role", operator: "eq" as const, value: "admin", then: "hide" as const }];
    const nodes: PageNode[] = [{
      type: "Section", uniqueId: "s1", isGrid: true, gridValue: "12",
      children: [{
        type: "SubSection", uniqueId: "s1__col0", isGrid: true, gridValue: 12,
        children: [{ type: "Component", uniqueId: "c1", componentName: "Banner", conditions: cond }],
      }],
    }];

    const restored = layoutDataToNodes(nodesToLayoutData(nodes));
    expect(restored[0].children![0].children![0].conditions).toEqual(cond);
  });

  it("preserves an empty SubSection (no children)", () => {
    const nodes: PageNode[] = [{
      type: "Section", uniqueId: "s1", isGrid: true, gridValue: "12",
      children: [{ type: "SubSection", uniqueId: "s1__col0", isGrid: true, gridValue: 12, children: [] }],
    }];

    const restored = layoutDataToNodes(nodesToLayoutData(nodes));
    expect(restored[0].children![0].children).toHaveLength(0);
  });

  it("preserves nested sections through the round-trip (nested section bug fix)", () => {
    const nodes: PageNode[] = [{
      type: "Section",
      uniqueId: "outer",
      isGrid: true,
      gridValue: "12",
      children: [
        {
          type: "SubSection",
          uniqueId: "outer__col0",
          isGrid: true,
          gridValue: 8,
          children: [{
            type: "Section",
            uniqueId: "inner",
            isGrid: true,
            gridValue: "12",
            children: [{
              type: "SubSection",
              uniqueId: "inner__col0",
              isGrid: true,
              gridValue: 12,
              children: [{ type: "Component", uniqueId: "bannerComp", componentName: "Banner" }],
            }],
          }],
        },
        {
          type: "SubSection",
          uniqueId: "outer__col1",
          isGrid: true,
          gridValue: 4,
          children: [{ type: "Component", uniqueId: "newsComp", componentName: "News" }],
        },
      ],
    }];

    const restored = layoutDataToNodes(nodesToLayoutData(nodes));

    expect(restored).toHaveLength(1);
    const outerSection = restored[0];
    expect(outerSection.uniqueId).toBe("outer");
    expect(outerSection.children).toHaveLength(2);

    // col0 should contain the nested section
    const outerCol0 = outerSection.children![0];
    expect(outerCol0.type).toBe("SubSection");
    expect(outerCol0.children).toHaveLength(1);

    const innerSection = outerCol0.children![0];
    expect(innerSection.type).toBe("Section");
    expect(innerSection.uniqueId).toBe("inner");
    expect(innerSection.children).toHaveLength(1);

    const innerCol0 = innerSection.children![0];
    expect(innerCol0.type).toBe("SubSection");
    expect(innerCol0.children).toHaveLength(1);
    expect(innerCol0.children![0].componentName).toBe("Banner");
    expect(innerCol0.children![0].uniqueId).toBe("bannerComp");

    // col1 should still have News
    const outerCol1 = outerSection.children![1];
    expect(outerCol1.children![0].componentName).toBe("News");
    expect(outerCol1.children![0].uniqueId).toBe("newsComp");
  });

  it("preserves nested sections through serializeLayout + layoutDataToNodes (server round-trip)", () => {
    const nodes: PageNode[] = [{
      type: "Section",
      uniqueId: "outer",
      isGrid: true,
      gridValue: "12",
      children: [{
        type: "SubSection",
        uniqueId: "outer__col0",
        isGrid: true,
        gridValue: 12,
        children: [{
          type: "Section",
          uniqueId: "inner",
          isGrid: true,
          gridValue: "12",
          children: [{
            type: "SubSection",
            uniqueId: "inner__col0",
            isGrid: true,
            gridValue: 12,
            children: [{ type: "Component", uniqueId: "c1", componentName: "Banner" }],
          }],
        }],
      }],
    }];

    // Simulate save → server → load
    const serialized = serializeLayout(nodesToLayoutData(nodes));
    const restored = layoutDataToNodes(serialized);

    const innerSection = restored[0].children![0].children![0];
    expect(innerSection.type).toBe("Section");
    expect(innerSection.uniqueId).toBe("inner");
    expect(innerSection.children![0].children![0].componentName).toBe("Banner");
  });
});
