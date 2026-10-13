import { describe, expect, it } from "vitest";
import { readinessOf } from "@/components/paths/readiness-steps";

describe("readinessOf", () => {
  it("never claims more than the path's availability", () => {
    expect(readinessOf("operational")).toEqual(["done", "done", "done"]);
    expect(readinessOf("controlled_pilot")).toEqual(["done", "done", "partial"]);
    expect(readinessOf("no_missions_yet")).toEqual(["done", "todo", "todo"]);
    expect(readinessOf("preview")).toEqual(["todo", "todo", "todo"]);
  });
});
