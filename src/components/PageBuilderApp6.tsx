"use client";

import { useRef, useState } from "react";
import { PageBuilder } from "react-page-builder";
import type {
  ComponentDefinition,
  PageBuilderHandle,
  SectionWrapperRenderProps,
  SubSectionWrapperRenderProps,
} from "react-page-builder";
import { initialLayout } from "@/data/initialLayout";
import { Banner, BusinessPaper, Event, News, TilesQuickLink } from "@/components/widgets";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";

// ─── Component registry ───────────────────────────────────────────────────────

const components: ComponentDefinition[] = [
  { name: "Banner",         label: "Banner",        icon: "🖼️", component: Banner,         category: "Media" },
  { name: "News",           label: "News",           icon: "📰", component: News,           category: "Content" },
  { name: "BusinessPaper",  label: "Business Paper", icon: "📄", component: BusinessPaper,  category: "Content" },
  { name: "Event",          label: "Events",         icon: "📅", component: Event,          category: "Content" },
  { name: "TilesQuickLink", label: "Quick Tiles",    icon: "🔷", component: TilesQuickLink, category: "Navigation" },
];

// ─── Layout presets available in the sidebar ──────────────────────────────────

const LAYOUT_PRESETS = [
  { id: "layout:full",       label: "Full width",  columns: [12] as const,      preview: [1] as readonly number[] },
  { id: "layout:half",       label: "Two columns", columns: [6, 6] as const,    preview: [1, 1] as readonly number[] },
  { id: "layout:thirds",     label: "3 columns",   columns: [4, 4, 4] as const, preview: [1, 1, 1] as readonly number[] },
  { id: "layout:left-wide",  label: "Left wide",   columns: [8, 4] as const,    preview: [2, 1] as readonly number[] },
  { id: "layout:right-wide", label: "Right wide",  columns: [4, 8] as const,    preview: [1, 2] as readonly number[] },
] as const;

// ─── DragItem union type ──────────────────────────────────────────────────────

type DragItemLayout = { kind: "layout"; columns: readonly number[]; label: string; preview: readonly number[] };
type DragItemWidget = { kind: "widget"; componentName: string; label: string; icon: string };
type DragItem = DragItemLayout | DragItemWidget;

// ─── Draggable layout chip ────────────────────────────────────────────────────

function DraggableLayout({
  id,
  label,
  columns,
  preview,
}: {
  id: string;
  label: string;
  columns: readonly number[];
  preview: readonly number[];
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    data: { kind: "layout", columns, label, preview } satisfies DragItemLayout,
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{ opacity: isDragging ? 0.35 : 1 }}
      className="flex flex-col gap-1.5 p-2.5 border border-gray-200 rounded-lg bg-white cursor-grab active:cursor-grabbing hover:border-blue-400 hover:shadow-sm transition-all select-none"
    >
      <div className="flex gap-1">
        {preview.map((size, i) => (
          <div key={i} className="bg-blue-100 rounded h-4" style={{ flex: size }} />
        ))}
      </div>
      <span className="text-[11px] text-gray-500 font-medium">{label}</span>
    </div>
  );
}

// ─── Draggable widget chip ────────────────────────────────────────────────────

function DraggableWidget({
  id,
  componentName,
  label,
  icon,
}: {
  id: string;
  componentName: string;
  label: string;
  icon: string;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    data: { kind: "widget", componentName, label, icon } satisfies DragItemWidget,
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{ opacity: isDragging ? 0.35 : 1 }}
      className="flex items-center gap-2 p-2.5 border border-gray-200 rounded-lg bg-white cursor-grab active:cursor-grabbing hover:border-blue-400 hover:shadow-sm transition-all select-none"
    >
      <span className="text-base leading-none">{icon}</span>
      <span className="text-[11px] text-gray-600 font-medium">{label}</span>
    </div>
  );
}

// ─── Drop zone between / around sections (for layout drops) ──────────────────

function SectionDropZone({ afterIndex, isDragActive }: { afterIndex: number; isDragActive: boolean }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `section-drop-${afterIndex}`,
    data: { kind: "section-zone", afterIndex },
  });

  if (!isDragActive) return null;

  return (
    <div
      ref={setNodeRef}
      style={{
        height: isOver ? 52 : 20,
        margin: "2px 0",
        borderRadius: 8,
        border: isOver ? "2px dashed #0078d4" : "2px dashed transparent",
        background: isOver ? "#e8f2fb" : "rgba(0,120,212,0.04)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.15s",
      }}
    >
      {isOver && (
        <span style={{ fontSize: 12, color: "#0078d4", fontWeight: 600 }}>
          Drop to insert section here
        </span>
      )}
    </div>
  );
}

// ─── Droppable column wrapper (for widget drops) ──────────────────────────────

function DroppableColumn({
  nodeId,
  children,
  isDragActive,
}: SubSectionWrapperRenderProps & { isDragActive: boolean }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `col-${nodeId}`,
    data: { kind: "column", nodeId },
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        outline: isDragActive
          ? isOver
            ? "2px dashed #0078d4"
            : "2px dashed rgba(0,120,212,0.25)"
          : "2px solid transparent",
        background: isOver ? "rgba(0,120,212,0.04)" : undefined,
        borderRadius: 6,
        minHeight: isDragActive ? 48 : undefined,
        transition: "all 0.15s",
      }}
    >
      {isOver && isDragActive && (
        <div style={{ textAlign: "center", fontSize: 11, color: "#0078d4", padding: "4px 0", fontWeight: 600 }}>
          Drop widget here
        </div>
      )}
      {children}
    </div>
  );
}

// ─── Section wrapper: adds a section drop zone below each section ─────────────

function SectionWithDropZone({
  nodeId,
  index,
  children,
  isLayoutDragActive,
}: SectionWrapperRenderProps & { isLayoutDragActive: boolean }) {
  return (
    <div>
      {children}
      <SectionDropZone afterIndex={index} isDragActive={isLayoutDragActive} />
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export function PageBuilderApp6() {
  const ref = useRef<PageBuilderHandle>(null);
  const [editMode, setEditMode] = useState(true);
  const [activeDragItem, setActiveDragItem] = useState<DragItem | null>(null);

  const isLayoutDrag = activeDragItem?.kind === "layout";
  const isWidgetDrag = activeDragItem?.kind === "widget";

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragItem(event.active.data.current as DragItem);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragItem(null);
    const { active, over } = event;
    if (!over) return;

    const dragData = active.data.current as DragItem | undefined;
    const dropData = over.data.current as Record<string, unknown> | undefined;
    if (!dragData || !dropData) return;

    if (dragData.kind === "layout" && dropData.kind === "section-zone") {
      const afterIndex = dropData.afterIndex as number;
      ref.current?.addSectionAfter("__root__", afterIndex, dragData.columns);
    } else if (dragData.kind === "widget" && dropData.kind === "column") {
      const columnNodeId = dropData.nodeId as string;
      ref.current?.addComponent(columnNodeId, dragData.componentName);
    }
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex h-screen overflow-hidden">

        {/* ── Sidebar ──────────────────────────────────────────────────────── */}
        <aside className="w-48 shrink-0 border-r border-gray-200 bg-gray-50 flex flex-col overflow-auto">
          {/* Section layouts */}
          <div className="px-3 py-2.5 border-b border-gray-200 bg-white">
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Layouts</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Drag onto canvas</p>
          </div>
          <div className="flex flex-col gap-2 p-3 border-b border-gray-200">
            {LAYOUT_PRESETS.map((preset) => (
              <DraggableLayout key={preset.id} {...preset} />
            ))}
          </div>

          {/* Widgets */}
          <div className="px-3 py-2.5 border-b border-gray-200 bg-white">
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Widgets</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Drag into a column</p>
          </div>
          <div className="flex flex-col gap-2 p-3">
            {components.map((c) => (
              <DraggableWidget
                key={c.name}
                id={`widget:${c.name}`}
                componentName={c.name}
                label={c.label}
                icon={typeof c.icon === "string" ? c.icon : "📦"}
              />
            ))}
          </div>
        </aside>

        {/* ── Canvas ───────────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center gap-2 px-3 py-2 bg-white border-b border-gray-200 shrink-0">
            <span className="text-sm font-semibold text-gray-600">Drag-to-Add</span>
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
              <span className="text-xs text-gray-400">
                {isWidgetDrag
                  ? "Drop into a column on the canvas"
                  : isLayoutDrag
                  ? "Drop between sections on the canvas"
                  : "Drag a layout or widget from the sidebar"}
              </span>
            )}
            <button
              onClick={() => ref.current?.undo()}
              className="ml-auto px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 cursor-pointer"
            >
              ↩ Undo
            </button>
          </div>

          {/* Builder */}
          <div className="flex-1 overflow-auto p-4 bg-gray-50">
            {/* Drop zone before first section */}
            <SectionDropZone afterIndex={-1} isDragActive={isLayoutDrag} />

            <PageBuilder
              ref={ref}
              components={components}
              defaultValue={initialLayout}
              editMode={editMode}
              onEditModeChange={setEditMode}
              spacing={16}
              maxColumnsPerRow={3}
              renderSectionWrapper={editMode
                ? (props) => (
                    <SectionWithDropZone {...props} isLayoutDragActive={isLayoutDrag} />
                  )
                : undefined
              }
              renderSubSectionWrapper={editMode
                ? (props) => (
                    <DroppableColumn {...props} isDragActive={isWidgetDrag} />
                  )
                : undefined
              }
            />
          </div>
        </div>
      </div>

      {/* Drag preview overlay */}
      <DragOverlay dropAnimation={null}>
        {activeDragItem?.kind === "layout" && (
          <div
            style={{
              padding: "8px 12px",
              background: "#0078d4",
              color: "#fff",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              boxShadow: "0 4px 12px rgba(0,120,212,0.4)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", gap: 3 }}>
              {activeDragItem.preview.map((size, i) => (
                <div
                  key={i}
                  style={{ width: size * 16, height: 16, background: "rgba(255,255,255,0.5)", borderRadius: 3 }}
                />
              ))}
            </div>
            {activeDragItem.label}
          </div>
        )}
        {activeDragItem?.kind === "widget" && (
          <div
            style={{
              padding: "8px 12px",
              background: "#16a34a",
              color: "#fff",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              boxShadow: "0 4px 12px rgba(22,163,74,0.4)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {activeDragItem.icon} {activeDragItem.label}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
