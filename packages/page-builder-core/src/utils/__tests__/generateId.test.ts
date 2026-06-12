import { generateId } from "../generateId";

describe("generateId", () => {
  it("returns a string", () => {
    expect(typeof generateId()).toBe("string");
  });

  it("returns exactly 8 characters", () => {
    expect(generateId()).toHaveLength(8);
  });

  it("contains only alphanumeric characters", () => {
    for (let i = 0; i < 50; i++) {
      expect(generateId()).toMatch(/^[A-Za-z0-9]{8}$/);
    }
  });

  it("returns a different value on each call", () => {
    const a = generateId();
    const b = generateId();
    expect(a).not.toBe(b);
  });

  it("produces no collisions across 1000 calls", () => {
    const ids = new Set(Array.from({ length: 1000 }, () => generateId()));
    expect(ids.size).toBe(1000);
  });
});
