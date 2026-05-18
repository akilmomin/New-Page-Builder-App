"use client";

import { useState } from "react";
import { PageBuilder } from "react-page-builder";
import type { ComponentDefinition, ILayoutData, SerializableLayoutItem } from "react-page-builder";
import { FormProvider, useFormValues } from "@/components/form/FormContext";
import { TextField } from "@/components/form/TextField";
import { DateField } from "@/components/form/DateField";
import { SwitchField } from "@/components/form/SwitchField";
import { RadioField } from "@/components/form/RadioField";

// ─── Form component definitions ───────────────────────────────────────────────

const formComponents: ComponentDefinition[] = [
  {
    name: "TextField",
    label: "Text Field",
    icon: "✏️",
    component: TextField,
    category: "Inputs",
    description: "Single-line text input",
    defaultProps: { fieldId: "untitled", label: "Text Field" },
  },
  {
    name: "DateField",
    label: "Date Picker",
    icon: "📅",
    component: DateField,
    category: "Inputs",
    description: "Date selector",
    defaultProps: { fieldId: "untitled", label: "Date" },
  },
  {
    name: "SwitchField",
    label: "Toggle Switch",
    icon: "🔘",
    component: SwitchField,
    category: "Inputs",
    description: "Boolean toggle",
    defaultProps: { fieldId: "untitled", label: "Toggle" },
  },
  {
    name: "RadioField",
    label: "Radio Group",
    icon: "⚬",
    component: RadioField,
    category: "Inputs",
    description: "Single-select radio buttons",
    defaultProps: { fieldId: "untitled", label: "Choose one", options: [] },
  },
];

// ─── Initial form layout ──────────────────────────────────────────────────────

const formInitialLayout: ILayoutData[] = [
  // Row 0: Name fields
  {
    Id: "field-first-name",
    SectionId: "row-names",
    RowIndex: 0,
    ColumnIndex: 0,
    ColumnSpan: 6,
    VerticalIndex: 0,
    ComponentName: "TextField",
    componentProps: { fieldId: "firstName", label: "First Name", placeholder: "John" },
  },
  {
    Id: "field-last-name",
    SectionId: "row-names",
    RowIndex: 0,
    ColumnIndex: 1,
    ColumnSpan: 6,
    VerticalIndex: 0,
    ComponentName: "TextField",
    componentProps: { fieldId: "lastName", label: "Last Name", placeholder: "Doe" },
  },

  // Row 1: Date + Gender
  {
    Id: "field-dob",
    SectionId: "row-info",
    RowIndex: 1,
    ColumnIndex: 0,
    ColumnSpan: 6,
    VerticalIndex: 0,
    ComponentName: "DateField",
    componentProps: { fieldId: "dateOfBirth", label: "Date of Birth" },
  },
  {
    Id: "field-gender",
    SectionId: "row-info",
    RowIndex: 1,
    ColumnIndex: 1,
    ColumnSpan: 6,
    VerticalIndex: 0,
    ComponentName: "RadioField",
    componentProps: {
      fieldId: "gender",
      label: "Gender",
      options: [
        { value: "male", label: "Male" },
        { value: "female", label: "Female" },
        { value: "other", label: "Other / Prefer not to say" },
      ],
    },
  },

  // Row 2: Email full-width
  {
    Id: "field-email",
    SectionId: "row-email",
    RowIndex: 2,
    ColumnIndex: 0,
    ColumnSpan: 12,
    VerticalIndex: 0,
    ComponentName: "TextField",
    componentProps: { fieldId: "email", label: "Email Address", placeholder: "you@example.com" },
  },

  // Row 3: Preferences
  {
    Id: "field-newsletter",
    SectionId: "row-prefs",
    RowIndex: 3,
    ColumnIndex: 0,
    ColumnSpan: 6,
    VerticalIndex: 0,
    ComponentName: "SwitchField",
    componentProps: {
      fieldId: "newsletter",
      label: "Subscribe to newsletter",
      description: "Get weekly updates",
    },
  },
  {
    Id: "field-notifications",
    SectionId: "row-prefs",
    RowIndex: 3,
    ColumnIndex: 1,
    ColumnSpan: 6,
    VerticalIndex: 0,
    ComponentName: "SwitchField",
    componentProps: {
      fieldId: "notifications",
      label: "Push notifications",
      description: "Receive alerts on your device",
    },
  },
];

// ─── SaveButton reads form values from context ────────────────────────────────

function SaveFormButton({
  onSave,
}: {
  onSave: (values: Record<string, unknown>) => void;
}) {
  const values = useFormValues();
  return (
    <button
      onClick={() => onSave(values)}
      className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
    >
      Save Form
    </button>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export function PageBuilderApp3() {
  const [editMode, setEditMode] = useState(false);
  const [savedData, setSavedData] = useState<Record<string, unknown> | null>(null);
  const [layoutData, setLayoutData] = useState<SerializableLayoutItem[] | null>(null);

  const handleSave = (values: Record<string, unknown>) => {
    setSavedData(values);
  };

  return (
    <FormProvider>
      <div>
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-3 py-2 bg-white border-b border-gray-200">
          <span className="text-sm font-semibold text-gray-600 mr-2">Form Builder</span>

          <button
            onClick={() => setEditMode((m) => !m)}
            className={`px-3 py-1.5 text-sm border rounded cursor-pointer ${
              editMode
                ? "border-blue-600 bg-blue-600 text-white hover:bg-blue-700"
                : "border-gray-300 hover:bg-gray-50"
            }`}
          >
            {editMode ? "Done Editing" : "Edit Form Layout"}
          </button>

          {!editMode && (
            <SaveFormButton onSave={handleSave} />
          )}

          {layoutData && (
            <span className="ml-auto text-xs text-gray-400">
              {layoutData.length} fields
            </span>
          )}
        </div>

        {/* Builder */}
        <div className="p-4 bg-gray-50 min-h-screen">
          {!editMode && (
            <p className="text-xs text-gray-400 mb-3 text-center">
              Fill in the form below, then click Save Form.
            </p>
          )}
          {editMode && (
            <p className="text-xs text-blue-500 mb-3 text-center">
              Edit mode: add, remove, or rearrange form fields.
            </p>
          )}

          <PageBuilder
            components={formComponents}
            defaultValue={formInitialLayout}
            editMode={editMode}
            onEditModeChange={setEditMode}
            onChange={setLayoutData}
            spacing={8}
          />
        </div>

        {/* Saved data output */}
        {savedData && (
          <div className="mx-4 mb-6 p-4 bg-white border border-green-200 rounded-xl shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-green-600 font-semibold text-sm">✓ Form Saved</span>
              <button
                onClick={() => setSavedData(null)}
                className="ml-auto text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
              {Object.entries(savedData).map(([key, val]) => (
                <div key={key} className="flex flex-col">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                    {key}
                  </span>
                  <span className="text-sm text-gray-700">
                    {val === undefined || val === "" || val === null
                      ? <span className="text-gray-300 italic">—</span>
                      : String(val === true ? "Yes" : val === false ? "No" : val)}
                  </span>
                </div>
              ))}
            </div>
            <details className="mt-4">
              <summary className="text-xs text-gray-400 cursor-pointer">Raw JSON</summary>
              <pre className="mt-2 p-3 bg-gray-900 text-green-400 text-xs rounded-lg overflow-auto max-h-40">
                {JSON.stringify(savedData, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </FormProvider>
  );
}
