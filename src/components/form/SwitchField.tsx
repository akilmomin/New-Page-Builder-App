"use client";

import React from "react";
import { useFormField } from "./FormContext";

export interface SwitchFieldProps {
  fieldId: string;
  label?: string;
  description?: string;
  editMode?: boolean;
}

export const SwitchField: React.FC<SwitchFieldProps> = ({
  fieldId,
  label = "Toggle",
  description,
  editMode = false,
}) => {
  const { value, onChange } = useFormField(fieldId);
  const checked = (value as boolean) ?? false;

  return (
    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
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
  );
};
