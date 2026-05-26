"use client";

import { useRef, useState } from "react";
import { PageBuilder } from "react-page-builder";
import type { ComponentDefinition, PageBuilderHandle, SerializableLayoutItem } from "react-page-builder";
import { initialLayout } from "@/data/initialLayout";
import { Banner, BusinessPaper, Event, News, TilesQuickLink } from "@/components/widgets";

const components: ComponentDefinition[] = [
  { name: "Banner",        label: "Banner",        icon: "🖼️", component: Banner,        category: "Media" },
  { name: "News",          label: "News",          icon: "📰", component: News,          category: "Content" },
  { name: "BusinessPaper", label: "Business Paper",icon: "📄", component: BusinessPaper, category: "Content" },
  { name: "Event",         label: "Events",        icon: "📅", component: Event,         category: "Content" },
  { name: "TilesQuickLink",label: "Quick Tiles",   icon: "🔷", component: TilesQuickLink,category: "Navigation" },
  { name: "TilesQuickLink1",label: "Quick Tiles",   icon: "🔷", component: TilesQuickLink,category: "Navigation" },
];

interface SelectedComponent {
  nodeId: string;
  componentName: string;
  props: Record<string, unknown>;
}

export function PageBuilderApp() {
  const builderRef = useRef<PageBuilderHandle>(null);
  const [editMode, setEditMode] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [selected, setSelected] = useState<SelectedComponent | null>(null);

  const handleSave = (layout: SerializableLayoutItem[]) => {
    console.log("Saved layout:", layout);
  };

  const patch = (key: string, value: unknown) => {
    if (!selected) return;
    builderRef.current?.updateComponentProps(selected.nodeId, { [key]: value });
    setSelected((s) => s ? { ...s, props: { ...s.props, [key]: value } } : s);
  };

  return (
    <div className="flex h-screen overflow-hidden">

      {/* ── Canvas ─────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-auto">
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-3 py-2 bg-white border-b border-gray-200 shrink-0">
          <button
            onClick={() => builderRef.current?.reset()}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 cursor-pointer"
          >
            Reset
          </button>

          <button
            onClick={() => { setEditMode((m) => !m); setSelected(null); }}
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

        {/* Builder */}
        <div className="flex-1 overflow-auto p-2">
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
            onComponentSelect={(nodeId, componentName, props) => {
              setSelected(nodeId ? { nodeId, componentName: componentName!, props } : null);
            }}
            spacing={16}
            tabletMaxColumnsPerRow={3}
            maxColumnsPerRow={4}
          />
        </div>
      </div>

      {/* ── Side panel ─────────────────────────────────────────────────────── */}
      {editMode && (
        <aside className="w-64 shrink-0 border-l border-gray-200 bg-white flex flex-col overflow-auto">
          {selected ? (
            <ComponentSettingsPanel selected={selected} patch={patch} />
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 gap-2 text-center px-4">
              <span style={{ fontSize: 28 }}>👆</span>
              <p className="text-sm text-gray-400">Click a component to edit its settings.</p>
            </div>
          )}
        </aside>
      )}
    </div>
  );
}

// ─── Settings panel ───────────────────────────────────────────────────────────

function ComponentSettingsPanel({
  selected,
  patch,
}: {
  selected: SelectedComponent;
  patch: (key: string, value: unknown) => void;
}) {
  const p = selected.props;

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">
          {selected.componentName}
        </p>
      </div>

      <div className="flex-1 overflow-auto px-4 py-3 flex flex-col gap-4">

        {selected.componentName === "Banner" && (
          <>
            <Field label="Heading">
              <input
                key={selected.nodeId + "_heading"}
                type="text"
                defaultValue={(p.heading as string) ?? ""}
                onBlur={(e) => patch("heading", e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded outline-none focus:border-blue-400"
              />
            </Field>
            <Field label="Subheading">
              <input
                key={selected.nodeId + "_subheading"}
                type="text"
                defaultValue={(p.subheading as string) ?? ""}
                onBlur={(e) => patch("subheading", e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded outline-none focus:border-blue-400"
              />
            </Field>
            <Field label="Colour">
              <select
                key={selected.nodeId + "_gradient"}
                defaultValue={(p.gradient as string) ?? "blue"}
                onChange={(e) => patch("gradient", e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded outline-none focus:border-blue-400 bg-white"
              >
                <option value="blue">Blue</option>
                <option value="purple">Purple</option>
                <option value="teal">Teal</option>
                <option value="rose">Rose</option>
                <option value="amber">Amber</option>
              </select>
            </Field>
          </>
        )}

        {(selected.componentName === "News" || selected.componentName === "Event") && (
          <>
            <Field label="Widget Title">
              <input
                key={selected.nodeId + "_widgetTitle"}
                type="text"
                defaultValue={(p.widgetTitle as string) ?? ""}
                onBlur={(e) => patch("widgetTitle", e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded outline-none focus:border-blue-400"
              />
            </Field>
            <Field label="Max Items">
              <input
                key={selected.nodeId + "_maxItems"}
                type="number"
                min={1}
                max={selected.componentName === "News" ? 5 : 6}
                defaultValue={(p.maxItems as number) ?? (selected.componentName === "News" ? 5 : 4)}
                onBlur={(e) => patch("maxItems", Number(e.target.value))}
                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded outline-none focus:border-blue-400"
              />
            </Field>
          </>
        )}

        {(selected.componentName === "BusinessPaper" || selected.componentName === "TilesQuickLink") && (
          <p className="text-sm text-gray-400 text-center py-4">
            No configurable settings for this component.
          </p>
        )}

      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-500">{label}</label>
      {children}
    </div>
  );
}
