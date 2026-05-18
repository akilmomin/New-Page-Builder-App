"use client";

import React, { useEffect, useState } from "react";
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
  onPropsChange?: (patch: Record<string, unknown>) => void;
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
  onPropsChange,
}) => {
  const { value, onChange } = useFormField(fieldId);
  const selected = value as string | undefined;

  // Local draft mirrors options prop; synced on external changes (undo/redo)
  const [draftOptions, setDraftOptions] = useState<RadioOption[]>(options);
  useEffect(() => { setDraftOptions(options); }, [options]);

  const commitOptions = (next: RadioOption[]) => {
    setDraftOptions(next);
    onPropsChange?.({ options: next });
  };

  const updateOptionLabel = (idx: number, newLabel: string) => {
    const next = draftOptions.map((o, i) =>
      i === idx ? { value: o.value, label: newLabel } : o,
    );
    commitOptions(next);
  };

  const removeOption = (idx: number) => {
    const next = draftOptions.filter((_, i) => i !== idx);
    commitOptions(next);
  };

  const addOption = () => {
    const n = draftOptions.length + 1;
    const next = [...draftOptions, { value: `option${n}`, label: `Option ${n}` }];
    commitOptions(next);
  };

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

      {editMode && onPropsChange && (
        <div className="mt-1 pt-2 border-t border-dashed border-gray-200 flex flex-col gap-2">
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
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-400">Options</span>
            {draftOptions.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-1">
                <input
                  type="text"
                  defaultValue={opt.label}
                  onBlur={(e) => updateOptionLabel(idx, e.target.value)}
                  className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded outline-none focus:border-blue-400"
                />
                <button
                  type="button"
                  onClick={() => removeOption(idx)}
                  disabled={draftOptions.length <= 1}
                  className="text-xs text-red-400 hover:text-red-600 disabled:opacity-30 px-1"
                  title="Remove option"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addOption}
              className="text-xs text-blue-500 hover:text-blue-700 text-left mt-1"
            >
              + Add option
            </button>
          </div>
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
