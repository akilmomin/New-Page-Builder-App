"use client";

import { useRef, useState, useMemo } from "react";
import { PageBuilder } from "react-page-and-form-builder";
import type { ComponentDefinition, PageBuilderHandle, SerializableLayoutItem, SectionWrapperRenderProps } from "react-page-and-form-builder";
import { initialLayout } from "@/data/initialLayout";
import { Banner, BusinessPaper, Event, News, TilesQuickLink } from "@/components/widgets";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// ─── Component registry ───────────────────────────────────────────────────────

const components: ComponentDefinition[] = [
  { name: "Banner",         label: "Banner",        icon: "🖼️", component: Banner,         category: "Media" },
  { name: "News",           label: "News",           icon: "📰", component: News,           category: "Content" },
  { name: "BusinessPaper",  label: "Business Paper", icon: "📄", component: BusinessPaper,  category: "Content" },
  { name: "Event",          label: "Events",         icon: "📅", component: Event,          category: "Content" },
  { name: "TilesQuickLink", label: "Quick Tiles",    icon: "🔷", component: TilesQuickLink, category: "Navigation" },
];

// ─── Layout helpers ───────────────────────────────────────────────────────────

function getSectionOrder(layout: SerializableLayoutItem[]): string[] {
  const seen = new Set<string>();
  const order: string[] = [];
  for (const item of layout) {
    if (!seen.has(item.SectionId)) {
      seen.add(item.SectionId);
      order.push(item.SectionId);
    }
  }
  return order;
}

function reorderBySections(layout: SerializableLayoutItem[], newOrder: string[]): SerializableLayoutItem[] {
  // Update RowIndex to match new position — layoutDataToNodes sorts by RowIndex,
  // so without this the conversion would re-sort back to the original order.
  return newOrder.flatMap((id, rowIndex) =>
    layout.filter((i) => i.SectionId === id).map((item) => ({ ...item, RowIndex: rowIndex })),
  );
}

// ─── Sortable section wrapper — rendered by the builder via renderSectionWrapper ──

function SortableSectionWrapper({ nodeId, children }: SectionWrapperRenderProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: nodeId });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.35 : 1,
        position: "relative",
      }}
    >
      {/* Drag handle — floats top-right, outside the section outline */}
      <div
        {...attributes}
        {...listeners}
        style={{
          position: "absolute",
          top: 6,
          right: 6,
          zIndex: 30,
          cursor: "grab",
          background: "#fff",
          border: "1px solid #e0e0e0",
          borderRadius: 4,
          padding: "2px 6px",
          fontSize: 14,
          lineHeight: 1.5,
          color: "#aaa",
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
          userSelect: "none",
        }}
        title="Drag to reorder section"
      >
        ⠿
      </div>
      {children}
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export function PageBuilderApp5() {
  const ref = useRef<PageBuilderHandle>(null);
  const [layout, setLayout] = useState<SerializableLayoutItem[]>(initialLayout as SerializableLayoutItem[]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(true);

  const sectionOrder = useMemo(() => getSectionOrder(layout), [layout]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sectionOrder.indexOf(active.id as string);
    const newIndex = sectionOrder.indexOf(over.id as string);
    const newOrder = arrayMove(sectionOrder, oldIndex, newIndex);
    const reordered = reorderBySections(layout, newOrder);

    ref.current?.setLayout(reordered);
    setLayout(reordered);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-white border-b border-gray-200 shrink-0">
        <span className="text-sm font-semibold text-gray-600">DnD Reorder</span>
        <button
          onClick={() => setEditMode((m) => !m)}
          className={`ml-2 px-3 py-1.5 text-sm border rounded cursor-pointer ${
            editMode
              ? "border-blue-600 bg-blue-600 text-white hover:bg-blue-700"
              : "border-gray-300 hover:bg-gray-50"
          }`}
        >
          {editMode ? "Done" : "Edit"}
        </button>
        {editMode && (
          <span className="text-xs text-gray-400">Drag ⠿ on any section to reorder</span>
        )}
      </div>

      {/* Builder wrapped in DndContext + SortableContext */}
      <div className="flex-1 overflow-auto p-4 bg-gray-50">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={sectionOrder} strategy={verticalListSortingStrategy}>
            <PageBuilder
              ref={ref}
              components={components}
              defaultValue={initialLayout}
              editMode={editMode}
              onEditModeChange={setEditMode}
              onChange={setLayout}
              spacing={16}
              tabletMaxColumnsPerRow={3}
              maxColumnsPerRow={3}
              renderSectionWrapper={editMode
                ? (props) => <SortableSectionWrapper {...props} />
                : undefined
              }
            />
          </SortableContext>

          {/* Drag preview */}
          <DragOverlay>
            {activeId && (
              <div style={{
                background: "#e8f2fb",
                border: "2px dashed #0078d4",
                borderRadius: 8,
                height: 60,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#0078d4",
                fontSize: 13,
                fontWeight: 600,
              }}>
                Moving section…
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
