import { z } from "zod";

/**
 * Identifier validation for anything that maps to a Postgres `uuid` column.
 *
 * Use this instead of `z.string().uuid()`.
 *
 * Zod 4's `.uuid()` enforces RFC 9562: the version nibble must be 1–8 and the
 * variant bits must be 8/9/a/b. Postgres does not check either — `uuid` accepts
 * any 32 hex digits in 8-4-4-4-12 shape. That gap silently broke proof sharing
 * in production: seeded demo identifiers look like
 *
 *     16400000-0000-0000-0000-000000000001
 *              ^ version 0        ^ variant 0
 *
 * which Postgres stores happily and `.uuid()` rejects with a 400. Every proof
 * the demo account owns is seeded, so "Share proof" failed for all of them
 * while the database held perfectly valid rows.
 *
 * The rule: a validator guarding a database column must not be stricter than
 * the column. `z.guid()` matches Postgres — any well-formed UUID, no version
 * opinion — while still rejecting malformed strings.
 */
export const uuidLike = () => z.guid();

/** Same rule, for identifiers arriving as route parameters. */
export const uuidParam = (value: string) => z.guid().safeParse(value);
