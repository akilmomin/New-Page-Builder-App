"use client";

import { useRef, useState } from "react";
import { PageBuilder } from "react-page-builder";
import type { ComponentDefinition, PageBuilderHandle, SerializableLayoutItem } from "react-page-builder";
import { initialLayout } from "@/data/initialLayout";
import { Banner, BusinessPaper, Event, News, TilesQuickLink } from "@/components/widgets";

const components: ComponentDefinition[] = [
  { name: "Banner", label: "Banner", icon: "🖼️", component: Banner, category: "Media" },
  { name: "News", label: "News", icon: "📰", component: News, category: "Content" },
  {
    name: "BusinessPaper",
    label: "Business Paper",
    icon: "📄",
    component: BusinessPaper,
    category: "Content",
  },
  { name: "Event", label: "Events", icon: "📅", component: Event, category: "Content" },
  {
    name: "TilesQuickLink",
    label: "Quick Tiles",
    icon: "🔷",
    component: TilesQuickLink,
    category: "Navigation",
  },
];

export function PageBuilderApp() {
  const builderRef = useRef<PageBuilderHandle>(null);
  const [editMode, setEditMode] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const handleSave = (layout: SerializableLayoutItem[]) => {
    console.log("Saved layout:", layout);
  };

  return (
    <div>
      {/* External toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-white border-b border-gray-200">
        <button
          onClick={() => builderRef.current?.reset()}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 cursor-pointer"
        >
          Reset
        </button>

        <button
          onClick={() => setEditMode((m) => !m)}
          className={`px-3 py-1.5 text-sm border rounded cursor-pointer ${
            editMode
              ? "border-blue-600 bg-blue-600 text-white hover:bg-blue-700"
              : "border-gray-300 hover:bg-gray-50"
          }`}
        >
          {editMode ? "Done Editing" : "Edit"}
        </button>

        {editMode && (
          <>
            <button
              onClick={() => builderRef.current?.undo()}
              disabled={!canUndo}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:enabled:bg-gray-50"
              title="Undo (Ctrl+Z)"
            >
              ↩ Undo
            </button>
            <button
              onClick={() => builderRef.current?.redo()}
              disabled={!canRedo}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:enabled:bg-gray-50"
              title="Redo (Ctrl+Y)"
            >
              ↪ Redo
            </button>
          </>
        )}

        <button
          onClick={() => builderRef.current?.save()}
          className="ml-auto px-3 py-1.5 text-sm bg-green-600 text-white border border-green-600 rounded hover:bg-green-700 cursor-pointer"
        >
          Save
        </button>
      </div>

      <div style={{ padding: 8 }}>
        <PageBuilder
          ref={builderRef}
          components={components}
          defaultValue={initialLayout}
          editMode={editMode}
          onEditModeChange={setEditMode}
          onSaveChange={handleSave}
          onHistoryChange={({ canUndo, canRedo }) => {
            setCanUndo(canUndo);
            setCanRedo(canRedo);
          }}
          spacing={16}
        />
      </div>
    </div>
  );
}
