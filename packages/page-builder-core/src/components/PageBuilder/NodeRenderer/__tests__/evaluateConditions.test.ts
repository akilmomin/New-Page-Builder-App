import type { FieldCondition } from "../../../../models/pageBuilder";
import { evaluateConditions } from "../evaluateConditions";

const defaults = { isReadonly: false, isHidden: false };

describe("evaluateConditions", () => {
  // ── Baseline ───────────────────────────────────────────────────────────────

  it("returns defaults when conditions is undefined", () => {
    expect(evaluateConditions(undefined, {})).toEqual(defaults);
  });

  it("returns defaults when conditions is an empty array", () => {
    expect(evaluateConditions([], {})).toEqual(defaults);
  });

  it("returns defaults when no condition matches", () => {
    const conds: FieldCondition[] = [{ when: "role", operator: "eq", value: "admin", then: "hide" }];
    expect(evaluateConditions(conds, { role: "user" })).toEqual(defaults);
  });

  // ── Operators ──────────────────────────────────────────────────────────────

  describe("eq operator", () => {
    it("matches when field value equals condition value", () => {
      const conds: FieldCondition[] = [{ when: "type", operator: "eq", value: "A", then: "hide" }];
      expect(evaluateConditions(conds, { type: "A" })).toEqual({ isReadonly: false, isHidden: true });
    });

    it("does not match when values differ", () => {
      const conds: FieldCondition[] = [{ when: "type", operator: "eq", value: "A", then: "hide" }];
      expect(evaluateConditions(conds, { type: "B" })).toEqual(defaults);
    });

    it("uses strict equality (no coercion)", () => {
      const conds: FieldCondition[] = [{ when: "count", operator: "eq", value: 1, then: "hide" }];
      // "1" !== 1
      expect(evaluateConditions(conds, { count: "1" })).toEqual(defaults);
    });
  });

  describe("neq operator", () => {
    it("matches when field value does not equal condition value", () => {
      const conds: FieldCondition[] = [{ when: "role", operator: "neq", value: "admin", then: "hide" }];
      expect(evaluateConditions(conds, { role: "user" })).toEqual({ isReadonly: false, isHidden: true });
    });

    it("does not match when values are equal", () => {
      const conds: FieldCondition[] = [{ when: "role", operator: "neq", value: "admin", then: "hide" }];
      expect(evaluateConditions(conds, { role: "admin" })).toEqual(defaults);
    });

    it("matches when field is not present in fieldValues", () => {
      const conds: FieldCondition[] = [{ when: "x", operator: "neq", value: "y", then: "readonly" }];
      expect(evaluateConditions(conds, {})).toEqual({ isReadonly: true, isHidden: false });
    });
  });

  describe("empty operator", () => {
    it("matches when field value is undefined", () => {
      const conds: FieldCondition[] = [{ when: "x", operator: "empty", then: "hide" }];
      expect(evaluateConditions(conds, {})).toEqual({ isReadonly: false, isHidden: true });
    });

    it("matches when field value is null", () => {
      const conds: FieldCondition[] = [{ when: "x", operator: "empty", then: "hide" }];
      expect(evaluateConditions(conds, { x: null })).toEqual({ isReadonly: false, isHidden: true });
    });

    it("matches when field value is empty string", () => {
      const conds: FieldCondition[] = [{ when: "x", operator: "empty", then: "hide" }];
      expect(evaluateConditions(conds, { x: "" })).toEqual({ isReadonly: false, isHidden: true });
    });

    it("does not match when field has a non-empty value", () => {
      const conds: FieldCondition[] = [{ when: "x", operator: "empty", then: "hide" }];
      expect(evaluateConditions(conds, { x: "hello" })).toEqual(defaults);
    });

    it("does not match for 0 or false (non-empty falsy)", () => {
      const conds: FieldCondition[] = [{ when: "x", operator: "empty", then: "hide" }];
      expect(evaluateConditions(conds, { x: 0 })).toEqual(defaults);
      expect(evaluateConditions(conds, { x: false })).toEqual(defaults);
    });
  });

  describe("notEmpty operator", () => {
    it("matches when field has a non-empty string value", () => {
      const conds: FieldCondition[] = [{ when: "x", operator: "notEmpty", then: "hide" }];
      expect(evaluateConditions(conds, { x: "hello" })).toEqual({ isReadonly: false, isHidden: true });
    });

    it("does not match when field is undefined", () => {
      const conds: FieldCondition[] = [{ when: "x", operator: "notEmpty", then: "hide" }];
      expect(evaluateConditions(conds, {})).toEqual(defaults);
    });

    it("does not match when field is null", () => {
      const conds: FieldCondition[] = [{ when: "x", operator: "notEmpty", then: "hide" }];
      expect(evaluateConditions(conds, { x: null })).toEqual(defaults);
    });

    it("does not match when field is empty string", () => {
      const conds: FieldCondition[] = [{ when: "x", operator: "notEmpty", then: "hide" }];
      expect(evaluateConditions(conds, { x: "" })).toEqual(defaults);
    });

    it("matches for 0 and false (truthy non-empty values)", () => {
      const conds: FieldCondition[] = [{ when: "x", operator: "notEmpty", then: "hide" }];
      expect(evaluateConditions(conds, { x: 0 })).toEqual({ isReadonly: false, isHidden: true });
      expect(evaluateConditions(conds, { x: false })).toEqual({ isReadonly: false, isHidden: true });
    });
  });

  // ── Actions ────────────────────────────────────────────────────────────────

  describe("hide action", () => {
    it("sets isHidden to true", () => {
      const conds: FieldCondition[] = [{ when: "x", operator: "eq", value: 1, then: "hide" }];
      expect(evaluateConditions(conds, { x: 1 }).isHidden).toBe(true);
    });
  });

  describe("show action", () => {
    it("sets isHidden to false (can override a previous hide)", () => {
      const conds: FieldCondition[] = [
        { when: "x", operator: "eq", value: 1, then: "hide" },
        { when: "y", operator: "eq", value: 2, then: "show" },
      ];
      expect(evaluateConditions(conds, { x: 1, y: 2 }).isHidden).toBe(false);
    });
  });

  describe("readonly action", () => {
    it("sets isReadonly to true", () => {
      const conds: FieldCondition[] = [{ when: "x", operator: "eq", value: 1, then: "readonly" }];
      expect(evaluateConditions(conds, { x: 1 }).isReadonly).toBe(true);
    });
  });

  describe("editable action", () => {
    it("sets isReadonly to false (can override a previous readonly)", () => {
      const conds: FieldCondition[] = [
        { when: "x", operator: "eq", value: 1, then: "readonly" },
        { when: "y", operator: "eq", value: 2, then: "editable" },
      ];
      expect(evaluateConditions(conds, { x: 1, y: 2 }).isReadonly).toBe(false);
    });
  });

  // ── Ordering and independence ─────────────────────────────────────────────

  it("evaluates conditions in order — later conditions override earlier ones", () => {
    const conds: FieldCondition[] = [
      { when: "x", operator: "eq", value: 1, then: "hide" },
      { when: "y", operator: "eq", value: 2, then: "show" },
      { when: "z", operator: "eq", value: 3, then: "hide" },
    ];
    // hide, show, hide → isHidden = true
    expect(evaluateConditions(conds, { x: 1, y: 2, z: 3 }).isHidden).toBe(true);
  });

  it("only applies actions for conditions that match", () => {
    const conds: FieldCondition[] = [
      { when: "x", operator: "eq", value: 1, then: "hide" },   // matches
      { when: "y", operator: "eq", value: 9, then: "show" },   // does NOT match (y=2)
    ];
    expect(evaluateConditions(conds, { x: 1, y: 2 }).isHidden).toBe(true);
  });

  it("isHidden and isReadonly are independent", () => {
    const conds: FieldCondition[] = [
      { when: "a", operator: "eq", value: 1, then: "hide" },
      { when: "b", operator: "eq", value: 2, then: "readonly" },
    ];
    const result = evaluateConditions(conds, { a: 1, b: 2 });
    expect(result.isHidden).toBe(true);
    expect(result.isReadonly).toBe(true);
  });

  it("handles multiple conditions on different fields without interference", () => {
    const conds: FieldCondition[] = [
      { when: "flag", operator: "eq", value: true, then: "hide" },
      { when: "role", operator: "neq", value: "admin", then: "readonly" },
    ];
    const result = evaluateConditions(conds, { flag: true, role: "user" });
    expect(result.isHidden).toBe(true);
    expect(result.isReadonly).toBe(true);
  });
});
