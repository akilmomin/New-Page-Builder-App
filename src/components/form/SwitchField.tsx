"use client";

import React from "react";
import { useFormField } from "./FormContext";

export interface SwitchFieldProps {
  fieldId: string;
  label?: string;
  description?: string;
  editMode?: boolean;
  onPropsChange?: (patch: Record<string, unknown>) => void;
}

export const SwitchField: React.FC<SwitchFieldProps> = ({
  fieldId,
  label = "Toggle",
  description,
  editMode = false,
  onPropsChange,
}) => {
  const { value, onChange } = useFormField(fieldId);
  const checked = (value as boolean) ?? false;

  return (
    <div className="flex flex-col p-3 bg-white rounded-lg border border-gray-200 gap-2">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {description && <span className="text-xs text-gray-400">{description}</span>}
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          disabled={editMode}
          onClick={() => !editMode && onChange(!checked)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
            editMode
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer"
          } ${checked ? "bg-blue-600" : "bg-gray-200"}`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
              checked ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {editMode && onPropsChange && (
        <div className="pt-2 border-t border-dashed border-gray-200 flex flex-col gap-2">
          <span className="text-xs font-semibold text-blue-500 uppercase tracking-wide">⚙ Field Settings</span>
          <EditRow label="Field ID">
            <input
              type="text"
              defaultValue={fieldId}
              onBlur={(e) => onPropsChange({ fieldId: e.target.value })}
              className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded outline-none focus:border-blue-400"
            />
          </EditRow>
          <EditRow label="Label">
            <input
              type="text"
              defaultValue={label}
              onBlur={(e) => onPropsChange({ label: e.target.value })}
              className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded outline-none focus:border-blue-400"
            />
          </EditRow>
          <EditRow label="Description">
            <input
              type="text"
              defaultValue={description ?? ""}
              onBlur={(e) => onPropsChange({ description: e.target.value || undefined })}
              placeholder="optional"
              className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded outline-none focus:border-blue-400"
            />
          </EditRow>
        </div>
      )}
    </div>
  );
};

const EditRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex items-center gap-2">
    <span className="text-xs text-gray-400 w-20 shrink-0">{label}</span>
    {children}
  </div>
);
