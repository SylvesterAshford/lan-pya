import { describe, expect, it } from "vitest";
import { z } from "zod";
import { uuidLike } from "@/lib/validation/ids";

/**
 * Regression guard for the proof-sharing outage.
 *
 * Seeded identifiers are valid Postgres uuids but not RFC 9562 uuids, and
 * `z.string().uuid()` rejected them with a 400. Sharing was broken for every
 * proof the demo account owned while the database held valid rows.
 */

const SEEDED = [
  "16400000-0000-0000-0000-000000000001",
  "16700000-0000-0000-0000-000000000001",
  "16200000-0000-0000-0000-000000000001",
];

describe("uuidLike", () => {
  it("accepts seeded identifiers that Postgres accepts but RFC 9562 does not", () => {
    for (const id of SEEDED) {
      expect(uuidLike().safeParse(id).success).toBe(true);
    }
  });

  it("still accepts ordinary generated v4 identifiers", () => {
    expect(uuidLike().safeParse("3f2504e0-4f89-41d3-9a0c-0305e82c3301").success).toBe(true);
    expect(uuidLike().safeParse(crypto.randomUUID()).success).toBe(true);
  });

  it("rejects anything that is not a well-formed uuid", () => {
    const bad = [
      "not-a-uuid",
      "",
      "16400000-0000-0000-0000-00000000000",     // one digit short
      "16400000-0000-0000-0000-0000000000012",   // one digit long
      "16400000000000000000000000000000001",     // no separators
      "zzzzzzzz-0000-0000-0000-000000000001",    // non-hex
      "16400000-0000-0000-0000-000000000001 ",   // trailing space
    ];
    for (const value of bad) {
      expect(uuidLike().safeParse(value).success).toBe(false);
    }
  });

  it("is strictly more permissive than the validator it replaced", () => {
    // The point of the change: everything the old rule allowed is still
    // allowed, and the seeded ids that broke production now pass too.
    const strict = z.string().uuid();
    for (const id of [...SEEDED, "3f2504e0-4f89-41d3-9a0c-0305e82c3301"]) {
      if (strict.safeParse(id).success) {
        expect(uuidLike().safeParse(id).success).toBe(true);
      }
    }
    expect(SEEDED.every((id) => strict.safeParse(id).success)).toBe(false);
    expect(SEEDED.every((id) => uuidLike().safeParse(id).success)).toBe(true);
  });
});
