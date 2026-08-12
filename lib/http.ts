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
