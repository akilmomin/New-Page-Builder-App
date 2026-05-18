"use client";

import { useRef, useState } from "react";
import { PageBuilder } from "react-page-builder";
import type { ComponentDefinition, ILayoutData, PageBuilderHandle } from "react-page-builder";
import { FormProvider } from "@/components/form/FormContext";
import { TextField } from "@/components/form/TextField";
import { DateField } from "@/components/form/DateField";
import { SwitchField } from "@/components/form/SwitchField";
import { RadioField } from "@/components/form/RadioField";
import type { RadioOption } from "@/components/form/RadioField";

// ─── Component registry ───────────────────────────────────────────────────────

const formComponents: ComponentDefinition[] = [
  {
    name: "TextField",
    label: "Text Field",
    icon: "✏️",
    component: TextField,
    category: "Inputs",
    defaultProps: { fieldId: "untitled", label: "Text Field" },
  },
  {
    name: "DateField",
    label: "Date Picker",
    icon: "📅",
    component: DateField,
    category: "Inputs",
    defaultProps: { fieldId: "untitled", label: "Date" },
  },
  {
    name: "SwitchField",
    label: "Toggle Switch",
    icon: "🔘",
    component: SwitchField,
    category: "Inputs",
    defaultProps: { fieldId: "untitled", label: "Toggle" },
  },
  {
    name: "RadioField",
    label: "Radio Group",
    icon: "⚬",
    component: RadioField,
    category: "Inputs",
    defaultProps: {
      fieldId: "untitled",
      label: "Choose one",
      options: [
        { value: "option1", label: "Option 1" },
        { value: "option2", label: "Option 2" },
      ],
    },
  },
];

const initialLayout: ILayoutData[] = [
  {
    Id: "field-first-name",
    SectionId: "row-names",
    RowIndex: 0,
    ColumnIndex: 0,
    ColumnSpan: 6,
    ComponentName: "TextField",
    componentProps: { fieldId: "firstName", label: "First Name", placeholder: "John" },
  },
  {
    Id: "field-last-name",
    SectionId: "row-names",
    RowIndex: 0,
    ColumnIndex: 1,
    ColumnSpan: 6,
    ComponentName: "TextField",
    componentProps: { fieldId: "lastName", label: "Last Name", placeholder: "Doe" },
  },
  {
    Id: "field-dob",
    SectionId: "row-info",
    RowIndex: 1,
    ColumnIndex: 0,
    ColumnSpan: 6,
    ComponentName: "DateField",
    componentProps: { fieldId: "dateOfBirth", label: "Date of Birth" },
  },
  {
    Id: "field-gender",
    SectionId: "row-info",
    RowIndex: 1,
    ColumnIndex: 1,
    ColumnSpan: 6,
    ComponentName: "RadioField",
    componentProps: {
      fieldId: "gender",
      label: "Gender",
      options: [
        { value: "male", label: "Male" },
        { value: "female", label: "Female" },
        { value: "other", label: "Other" },
      ],
    },
  },
];

// ─── Selected component state ─────────────────────────────────────────────────

interface SelectedComponent {
  nodeId: string;
  componentName: string;
  props: Record<string, unknown>;
}

// ─── App ──────────────────────────────────────────────────────────────────────

export function PageBuilderApp4() {
  const ref = useRef<PageBuilderHandle>(null);
  const [editMode, setEditMode] = useState(false);
  const [selected, setSelected] = useState<SelectedComponent | null>(null);

  const patch = (key: string, value: unknown) => {
    if (!selected) return;
    ref.current?.updateComponentProps(selected.nodeId, { [key]: value });
    // Keep local panel in sync until next onComponentSelect fires
    setSelected((s) => s ? { ...s, props: { ...s.props, [key]: value } } : s);
  };

  return (
    <FormProvider>
      <div className="flex h-screen overflow-hidden">

        {/* ── Canvas ─────────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-auto">
          {/* Toolbar */}
          <div className="flex items-center gap-2 px-3 py-2 bg-white border-b border-gray-200 shrink-0">
            <span className="text-sm font-semibold text-gray-600 mr-2">Form Builder (caller panel)</span>
            <button
              onClick={() => { setEditMode((m) => !m); setSelected(null); }}
              className={`px-3 py-1.5 text-sm border rounded cursor-pointer ${
                editMode
                  ? "border-blue-600 bg-blue-600 text-white hover:bg-blue-700"
                  : "border-gray-300 hover:bg-gray-50"
              }`}
            >
              {editMode ? "Done Editing" : "Edit Layout"}
            </button>
            {editMode && (
              <span className="text-xs text-gray-400">
                Click a field to edit its settings →
              </span>
            )}
          </div>

          {/* Builder */}
          <div className="flex-1 p-4 bg-gray-50 overflow-auto">
            <PageBuilder
              ref={ref}
              components={formComponents}
              defaultValue={initialLayout}
              editMode={editMode}
              onEditModeChange={setEditMode}
              spacing={8}
              onComponentSelect={(nodeId, componentName, props) => {
                setSelected(nodeId ? { nodeId, componentName: componentName!, props } : null);
              }}
            />
          </div>
        </div>

        {/* ── Side panel ─────────────────────────────────────────────────── */}
        {editMode && (
          <aside className="w-64 shrink-0 border-l border-gray-200 bg-white flex flex-col overflow-auto">
            {selected ? (
              <SettingsPanel
                selected={selected}
                patch={patch}
              />
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 gap-2 text-center px-4">
                <span style={{ fontSize: 28 }}>👆</span>
                <p className="text-sm text-gray-400">
                  Click any field on the canvas to edit its settings here.
                </p>
              </div>
            )}
          </aside>
        )}
      </div>
    </FormProvider>
  );
}

// ─── Settings panel ───────────────────────────────────────────────────────────

function SettingsPanel({
  selected,
  patch,
}: {
  selected: SelectedComponent;
  patch: (key: string, value: unknown) => void;
}) {
  const p = selected.props;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">
          {selected.componentName}
        </p>
        <p className="text-xs text-gray-300 font-mono mt-0.5 truncate">{selected.nodeId}</p>
      </div>

      {/* Fields */}
      <div className="flex-1 overflow-auto px-4 py-3 flex flex-col gap-4">

        {/* Common: Field ID + Label */}
        <Field label="Field ID">
          <input
            key={selected.nodeId + "_fieldId"}
            type="text"
            defaultValue={(p.fieldId as string) ?? ""}
            onBlur={(e) => patch("fieldId", e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded outline-none focus:border-blue-400 font-mono"
          />
        </Field>

        <Field label="Label">
          <input
            key={selected.nodeId + "_label"}
            type="text"
            defaultValue={(p.label as string) ?? ""}
            onBlur={(e) => patch("label", e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded outline-none focus:border-blue-400"
          />
        </Field>

        {/* TextField-specific */}
        {selected.componentName === "TextField" && (
          <Field label="Placeholder">
            <input
              key={selected.nodeId + "_placeholder"}
              type="text"
              defaultValue={(p.placeholder as string) ?? ""}
              onBlur={(e) => patch("placeholder", e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded outline-none focus:border-blue-400"
            />
          </Field>
        )}

        {/* SwitchField-specific */}
        {selected.componentName === "SwitchField" && (
          <Field label="Description">
            <input
              key={selected.nodeId + "_description"}
              type="text"
              defaultValue={(p.description as string) ?? ""}
              placeholder="optional"
              onBlur={(e) => patch("description", e.target.value || undefined)}
              className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded outline-none focus:border-blue-400"
            />
          </Field>
        )}

        {/* RadioField-specific */}
        {selected.componentName === "RadioField" && (
          <OptionsEditor
            options={(p.options as RadioOption[]) ?? []}
            onChange={(options) => patch("options", options)}
          />
        )}
      </div>
    </div>
  );
}

// ─── Small helpers ────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-500">{label}</label>
      {children}
    </div>
  );
}

function OptionsEditor({
  options,
  onChange,
}: {
  options: RadioOption[];
  onChange: (options: RadioOption[]) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium text-gray-500">Options</label>
      {options.map((opt, idx) => (
        <div key={idx} className="flex items-center gap-1">
          <input
            type="text"
            defaultValue={opt.label}
            onBlur={(e) => {
              const next = options.map((o, i) =>
                i === idx ? { value: o.value, label: e.target.value } : o,
              );
              onChange(next);
            }}
            className="flex-1 px-2 py-1.5 text-sm border border-gray-200 rounded outline-none focus:border-blue-400"
          />
          <button
            type="button"
            onClick={() => onChange(options.filter((_, i) => i !== idx))}
            disabled={options.length <= 1}
            className="text-gray-300 hover:text-red-400 disabled:opacity-20 text-sm px-1"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...options, { value: `option${options.length + 1}`, label: `Option ${options.length + 1}` }])}
        className="text-xs text-blue-500 hover:text-blue-700 text-left"
      >
        + Add option
      </button>
    </div>
  );
}
