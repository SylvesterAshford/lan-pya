import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

export function problem(status: number, code: string, detail: string, retryable = false) {
  return NextResponse.json(
    { type: `https://lanpya.app/problems/${code}`, title: code, status, detail, retryable, requestId: randomUUID() },
    { status, headers: { "content-type": "application/problem+json" } },
  );
}

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ data, requestId: randomUUID() }, { status });
}

/** What a write on the shared demo account answers. The database refuses the
 *  write (guard_demo_writes); this turns that refusal into words. */
export const DEMO_READ_ONLY_DETAIL = "This is the shared demo account, so it can't be changed. Create your own account to save your work.";

export function demoReadOnly(error: { message?: string } | null | undefined) {
  return error?.message?.includes("demo account is read-only") ? problem(403, "demo-read-only", DEMO_READ_ONLY_DETAIL) : null;
}
