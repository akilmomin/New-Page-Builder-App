"use client";

import { PageBuilder } from "page-builder-core";
import type { ComponentDefinition } from "page-builder-core";
import { initialLayout } from "@/data/initialLayout";
import {
  Banner,
  BusinessPaper,
  Event,
  News,
  TilesQuickLink,
} from "@/components/widgets";

const components: ComponentDefinition[] = [
  { name: "Banner",         label: "Banner",         icon: "🖼️", component: Banner,         category: "Media" },
  { name: "News",           label: "News",           icon: "📰", component: News,           category: "Content" },
  { name: "BusinessPaper",  label: "Business Paper", icon: "📄", component: BusinessPaper,  category: "Content" },
  { name: "Event",          label: "Events",         icon: "📅", component: Event,          category: "Content" },
  { name: "TilesQuickLink", label: "Quick Tiles",    icon: "🔷", component: TilesQuickLink, category: "Navigation" },
];

export function PageBuilderApp() {
  return (
    <PageBuilder
      components={components}
      defaultValue={initialLayout}
    />
  );
}
