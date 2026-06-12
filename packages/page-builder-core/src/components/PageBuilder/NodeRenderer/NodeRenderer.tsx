"use client";

import React from "react";
import type { ComponentDefinition, PageNode } from "../../../models/pageBuilder";
import type { NodeRendererContext } from "./model/model";
import { SectionItem } from "./SectionItem";
import { SubSectionItem } from "./SubSectionItem";
import { ComponentItem } from "./ComponentItem";

export type { NodeRendererContext };

// ─── NodeRenderer ─────────────────────────────────────────────────────────────

interface NodeRendererProps {
  nodes: readonly PageNode[];
  components: ComponentDefinition[];
  ctx: NodeRendererContext;
  parentId?: string;
  depth?: number;
}

export const NodeRenderer: React.FC<NodeRendererProps> = ({
  nodes,
  components,
  ctx,
  parentId,
  depth = 0,
}) => (
  <>
    {nodes.map((node, index) => (
      <NodeItem
        key={node.uniqueId}
        node={node}
        index={index}
        components={components}
        ctx={ctx}
        parentId={parentId}
        depth={depth}
      />
    ))}
  </>
);

// ─── NodeItem — recursive type dispatcher ────────────────────────────────────

export interface NodeItemProps {
  node: PageNode;
  index: number;
  components: ComponentDefinition[];
  ctx: NodeRendererContext;
  parentId?: string;
  depth?: number;
}

export const NodeItem: React.FC<NodeItemProps> = ({ node, index, components, ctx, parentId, depth = 0 }) => {
  if (node.type === "Section")
    return <SectionItem node={node} index={index} components={components} ctx={ctx} parentId={parentId} depth={depth} />;
  if (node.type === "SubSection")
    return <SubSectionItem node={node} index={index} components={components} ctx={ctx} depth={depth} />;
  if (node.type === "Component")
    return <ComponentItem node={node} components={components} ctx={ctx} />;
  return null;
};
