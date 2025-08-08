import { describe, it, expect } from "vitest";

describe("Basic Test Suite", () => {
  it("should run basic test", () => {
    expect(1 + 1).toBe(2);
  });

  it("should test string operations", () => {
    expect("hello world".toUpperCase()).toBe("HELLO WORLD");
  });

  it("should test array operations", () => {
    const arr = [1, 2, 3];
    expect(arr.length).toBe(3);
    expect(arr.includes(2)).toBe(true);
  });

  it("should test object operations", () => {
    const obj = { name: "Test", value: 42 };
    expect(obj.name).toBe("Test");
    expect(obj.value).toBeGreaterThan(40);
  });
});
