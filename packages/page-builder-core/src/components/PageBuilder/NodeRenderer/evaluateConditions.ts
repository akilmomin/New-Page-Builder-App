import type { FieldCondition } from "../../../models/pageBuilder";

export function evaluateConditions(
  conditions: FieldCondition[] | undefined,
  fieldValues: Record<string, unknown>,
): { isReadonly: boolean; isHidden: boolean } {
  let isReadonly = false;
  let isHidden = false;
  for (const cond of conditions ?? []) {
    const v = fieldValues[cond.when];
    let matches = false;
    switch (cond.operator) {
      case "eq":       matches = v === cond.value; break;
      case "neq":      matches = v !== cond.value; break;
      case "empty":    matches = v === undefined || v === null || v === ""; break;
      case "notEmpty": matches = v !== undefined && v !== null && v !== ""; break;
    }
    if (matches) {
      if (cond.then === "hide")     isHidden   = true;
      if (cond.then === "show")     isHidden   = false;
      if (cond.then === "readonly") isReadonly = true;
      if (cond.then === "editable") isReadonly = false;
    }
  }
  return { isReadonly, isHidden };
}
