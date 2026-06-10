"use client";

import React from "react";
import { useFormField } from "./FormContext";

export interface DateFieldProps {
  fieldId: string;
  label?: string;
  editMode?: boolean;
  isReadonly?: boolean;
  onFieldChange?: (fieldId: string, value: unknown) => void;
  onPropsChange?: (patch: Record<string, unknown>) => void;
}

export const DateField: React.FC<DateFieldProps> = ({
  fieldId,
  label = "Date",
  editMode = false,
  isReadonly = false,
  onFieldChange,
  onPropsChange,
}) => {
  const { value, onChange } = useFormField(fieldId);
  const disabled = editMode || isReadonly;

  return (
    <div className="flex flex-col gap-1 p-3 bg-white rounded-lg border border-gray-200">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {label}
        {isReadonly && !editMode && (
          <span className="ml-2 text-[10px] text-amber-500 normal-case font-normal">read-only</span>
        )}
      </label>
      <input
        type="date"
        value={(value as string) ?? ""}
        onChange={(e) => { onChange(e.target.value); onFieldChange?.(fieldId, e.target.value); }}
        disabled={disabled}
        className={`w-full px-3 py-2 text-sm border rounded-md outline-none transition-colors ${
          disabled
            ? "bg-gray-50 border-dashed border-gray-300 text-gray-400 cursor-not-allowed"
            : "bg-white border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        }`}
      />

      {editMode && onPropsChange && (
        <div className="mt-2 pt-2 border-t border-dashed border-gray-200 flex flex-col gap-2">
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
