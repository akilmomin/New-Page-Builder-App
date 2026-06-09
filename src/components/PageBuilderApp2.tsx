"use client";

import { useRef, useState } from "react";
import { PageBuilder } from "react-page-builder";
import type {
  ComponentDefinition,
  PageBuilderHandle,
  SerializableLayoutItem,
  LayoutPickerRenderProps,
  ComponentPickerRenderProps,
  SectionControlsRenderProps,
  ComponentControlsRenderProps,
  AddTriggerRenderProps,
} from "react-page-builder";
import { LAYOUT_PRESETS } from "react-page-builder";
import { initialLayout } from "@/data/initialLayout";
import { Banner, BusinessPaper, Event, News, TilesQuickLink } from "@/components/widgets";

const components: ComponentDefinition[] = [
  { name: "Banner", label: "Banner", icon: "🖼️", component: Banner, category: "Media" },
  { name: "News", label: "News", icon: "📰", component: News, category: "Content" },
  { name: "BusinessPaper", label: "Business Paper", icon: "📄", component: BusinessPaper, category: "Content" },
  { name: "Event", label: "Events", icon: "📅", component: Event, category: "Content" },
  { name: "TilesQuickLink", label: "Quick Tiles", icon: "🔷", component: TilesQuickLink, category: "Navigation" },
];

// ─── Custom render-prop implementations ──────────────────────────────────────

function CustomAddTrigger({ onClick }: AddTriggerRenderProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 border-2 border-dashed border-indigo-300 rounded-lg hover:bg-indigo-50 hover:border-indigo-400 transition-colors cursor-pointer"
    >
      <span className="text-lg leading-none">＋</span>
      Add New Section
    </button>
  );
}

function CustomLayoutPicker({ presets, onSelectLayout, onClose }: LayoutPickerRenderProps) {
  const entries = Object.entries(presets) as [string, readonly number[]][];
  return (
    <div className="absolute z-[9999] bg-white border border-gray-200 rounded-xl shadow-xl p-4 min-w-[260px]">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative z-10">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
          Choose Layout
        </p>
        <div className="grid grid-cols-2 gap-2">
          {entries.map(([key, cols]) => (
            <button
              key={key}
              onClick={() => onSelectLayout(cols)}
              className="flex flex-col items-center gap-1 p-3 border border-gray-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-colors cursor-pointer text-left"
            >
              <div className="flex gap-1 w-full h-5">
                {cols.map((span, i) => (
                  <div
                    key={i}
                    style={{ flex: span }}
                    className="bg-indigo-400 rounded-sm opacity-60"
                  />
                ))}
              </div>
              <span className="text-[10px] text-gray-500 capitalize">{key}</span>
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="mt-3 w-full text-xs text-gray-400 hover:text-gray-600 py-1"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

const SECTION_PRESETS_APP2 = [
  { key: "single",    label: "Full",       spans: LAYOUT_PRESETS.single },
  { key: "double",    label: "Half/Half",  spans: LAYOUT_PRESETS.double },
  { key: "leftWide",  label: "Left Wide",  spans: LAYOUT_PRESETS.leftWide },
  { key: "rightWide", label: "Right Wide", spans: LAYOUT_PRESETS.rightWide },
  { key: "triple",    label: "Thirds",     spans: LAYOUT_PRESETS.triple },
] as const;

function CustomComponentPicker({ components, onSelectComponent, onClose, onAddSection }: ComponentPickerRenderProps) {
  return (
    <div className="absolute z-[9999] left-0 right-0 mx-auto w-fit min-w-[300px]">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative z-10 bg-white border border-gray-200 rounded-xl shadow-xl p-4 mt-2">

        {/* Section presets — only shown when onAddSection is provided (depth 0 columns) */}
        {onAddSection && (
          <>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
              Add Section
            </p>
            <div className="grid grid-cols-5 gap-1.5 mb-4">
              {SECTION_PRESETS_APP2.map(({ key, label, spans }) => (
                <button
                  key={key}
                  onClick={() => { onAddSection(spans); onClose(); }}
                  className="flex flex-col items-center gap-1 p-2 border border-gray-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-colors cursor-pointer"
                  title={label}
                >
                  <div className="flex gap-0.5 w-full h-4">
                    {spans.map((span, i) => (
                      <div key={i} style={{ flex: span }} className="bg-indigo-400 rounded-sm opacity-50" />
                    ))}
                  </div>
                  <span className="text-[9px] text-gray-400 whitespace-nowrap">{label}</span>
                </button>
              ))}
            </div>
            <div className="border-t border-gray-100 mb-3" />
          </>
        )}

        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
          Add Component
        </p>
        <div className="flex flex-col gap-1">
          {components.map((def) => (
            <button
              key={def.name}
              onClick={() => { onSelectComponent(def.name); onClose(); }}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-indigo-50 hover:text-indigo-700 transition-colors text-sm text-left cursor-pointer"
            >
              <span className="text-xl w-7 text-center">{def.icon}</span>
              <div>
                <div className="font-medium">{def.label}</div>
                {def.category && (
                  <div className="text-[10px] text-gray-400 uppercase tracking-wide">
                    {def.category}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function CustomSectionControls({
  onClone,
  onDelete,
  onChangeLayout,
  isLayoutPickerOpen,
}: SectionControlsRenderProps) {
  return (
    <div
      style={{
        position: "absolute",
        top: 4,
        left: 4,
        zIndex: 20,
        display: "flex",
        gap: 4,
        pointerEvents: "none",
      }}
    >
      {[
        { label: "⊞", title: "Change layout", action: onChangeLayout, active: isLayoutPickerOpen },
        { label: "⧉", title: "Clone section", action: onClone },
        { label: "✕", title: "Delete section", action: onDelete, danger: true },
      ].map(({ label, title, action, active, danger }) => (
        <button
          key={title}
          title={title}
          onClick={(e) => { e.stopPropagation(); action(); }}
          style={{ pointerEvents: "auto" }}
          className={`px-2 py-0.5 text-xs font-medium rounded border transition-colors cursor-pointer ${
            active
              ? "bg-indigo-600 text-white border-indigo-600"
              : danger
              ? "bg-white text-red-500 border-red-300 hover:bg-red-50"
              : "bg-white text-indigo-600 border-indigo-300 hover:bg-indigo-50"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function CustomComponentControls({ onClone, onDelete }: ComponentControlsRenderProps) {
  return (
    <div
      style={{
        position: "absolute",
        top: 4,
        right: 4,
        zIndex: 30,
        display: "flex",
        gap: 4,
      }}
    >
      <button
        title="Clone component"
        onClick={(e) => { e.stopPropagation(); onClone(); }}
        className="w-7 h-7 flex items-center justify-center rounded-full bg-indigo-600 text-white text-xs hover:bg-indigo-700 transition-colors cursor-pointer shadow"
      >
        ⧉
      </button>
      <button
        title="Delete component"
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="w-7 h-7 flex items-center justify-center rounded-full bg-red-500 text-white text-xs hover:bg-red-600 transition-colors cursor-pointer shadow"
      >
        ✕
      </button>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export function PageBuilderApp2() {
  const builderRef = useRef<PageBuilderHandle>(null);
  const [editMode, setEditMode] = useState(false);
  const [lastSave, setLastSave] = useState<SerializableLayoutItem[] | null>(null);

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-indigo-900 text-white">
        <span className="text-sm font-semibold text-indigo-200 mr-2">Custom UI Builder</span>
        <button
          onClick={() => builderRef.current?.reset()}
          className="px-3 py-1.5 text-xs border border-indigo-400 text-indigo-200 rounded hover:bg-indigo-700 cursor-pointer"
        >
          Reset
        </button>
        <button
          onClick={() => setEditMode((m) => !m)}
          className={`px-3 py-1.5 text-xs border rounded cursor-pointer ${
            editMode
              ? "border-white bg-white text-indigo-900 font-semibold"
              : "border-indigo-400 text-indigo-200 hover:bg-indigo-700"
          }`}
        >
          {editMode ? "Done Editing" : "Edit"}
        </button>
        <button
          onClick={() => builderRef.current?.save()}
          className="ml-auto px-3 py-1.5 text-xs bg-indigo-500 text-white border border-indigo-400 rounded hover:bg-indigo-400 cursor-pointer"
        >
          Save
        </button>
      </div>

      <div className="bg-gray-50 min-h-screen p-4">
        <PageBuilder
          ref={builderRef}
          components={components}
          defaultValue={initialLayout}
          editMode={editMode}
          onEditModeChange={setEditMode}
          onSaveChange={setLastSave}
          spacing={8}
          // ── All 5 render props wired ──────────────────────────────────────
          renderAddTrigger={(props) => <CustomAddTrigger {...props} />}
          renderLayoutPicker={(props) => <CustomLayoutPicker {...props} />}
          renderComponentPicker={(props) => <CustomComponentPicker {...props} />}
          renderSectionControls={(props) => <CustomSectionControls {...props} />}
          renderComponentControls={(props) => <CustomComponentControls {...props} />}
        />
      </div>

      {/* Save output */}
      {lastSave && (
        <details className="mx-4 mb-4">
          <summary className="text-xs text-gray-500 cursor-pointer py-1">
            Last saved layout ({lastSave.length} items)
          </summary>
          <pre className="mt-2 p-3 bg-gray-900 text-green-400 text-xs rounded-lg overflow-auto max-h-48">
            {JSON.stringify(lastSave, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}
