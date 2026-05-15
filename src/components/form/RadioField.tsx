"use client";

import React from "react";
import { useFormField } from "./FormContext";

export interface RadioOption {
  value: string;
  label: string;
}

export interface RadioFieldProps {
  fieldId: string;
  label?: string;
  options?: RadioOption[];
  editMode?: boolean;
}

const DEFAULT_OPTIONS: RadioOption[] = [
  { value: "option1", label: "Option 1" },
  { value: "option2", label: "Option 2" },
  { value: "option3", label: "Option 3" },
];

export const RadioField: React.FC<RadioFieldProps> = ({
  fieldId,
  label = "Select Option",
  options = DEFAULT_OPTIONS,
  editMode = false,
}) => {
  const { value, onChange } = useFormField(fieldId);
  const selected = value as string | undefined;

  return (
    <div className="flex flex-col gap-2 p-3 bg-white rounded-lg border border-gray-200">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {label}
      </label>
      <div className="flex flex-col gap-2">
        {options.map((opt) => (
          <label
            key={opt.value}
            className={`flex items-center gap-2 text-sm ${
              editMode ? "cursor-not-allowed opacity-60" : "cursor-pointer"
            }`}
          >
            <input
              type="radio"
              name={fieldId}
              value={opt.value}
              checked={selected === opt.value}
              disabled={editMode}
              onChange={() => !editMode && onChange(opt.value)}
              className="w-4 h-4 accent-blue-600"
            />
            <span className="text-gray-700">{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};
