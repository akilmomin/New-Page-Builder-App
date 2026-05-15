"use client";

import React from "react";
import { useFormField } from "./FormContext";

export interface TextFieldProps {
  fieldId: string;
  label?: string;
  placeholder?: string;
  editMode?: boolean;
}

export const TextField: React.FC<TextFieldProps> = ({
  fieldId,
  label = "Text Field",
  placeholder = "Enter text…",
  editMode = false,
}) => {
  const { value, onChange } = useFormField(fieldId);

  return (
    <div className="flex flex-col gap-1 p-3 bg-white rounded-lg border border-gray-200">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {label}
      </label>
      <input
        type="text"
        value={(value as string) ?? ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={editMode}
        placeholder={editMode ? `[${label}]` : placeholder}
        className={`w-full px-3 py-2 text-sm border rounded-md outline-none transition-colors ${
          editMode
            ? "bg-gray-50 border-dashed border-gray-300 text-gray-400 cursor-not-allowed"
            : "bg-white border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        }`}
      />
    </div>
  );
};
