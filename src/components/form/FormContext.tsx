"use client";

import React, { createContext, useContext, useState } from "react";

interface FormContextValue {
  values: Record<string, unknown>;
  setValue: (fieldId: string, value: unknown) => void;
}

const FormContext = createContext<FormContextValue>({
  values: {},
  setValue: () => {},
});

export const FormProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [values, setValues] = useState<Record<string, unknown>>({});
  const setValue = (id: string, val: unknown) =>
    setValues((prev) => ({ ...prev, [id]: val }));
  return <FormContext.Provider value={{ values, setValue }}>{children}</FormContext.Provider>;
};

export const useFormField = (fieldId: string) => {
  const { values, setValue } = useContext(FormContext);
  return {
    value: values[fieldId],
    onChange: (val: unknown) => setValue(fieldId, val),
  };
};

export const useFormValues = () => useContext(FormContext).values;
