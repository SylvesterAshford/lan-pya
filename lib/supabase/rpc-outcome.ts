/**
 * Distinguish "this RPC says no" from "this RPC never ran".
 *
 * Both admin-client proof routes used to collapse these into one 410:
 *
 *     if (error || !data) return problem(410, "share-unavailable",
 *       "This proof link is expired, revoked, or invalid.");
 *
 * When `SUPABASE_SECRET_KEY` was invalid, every RPC failed to authenticate and
 * an employer opening a perfectly valid, unexpired, unrevoked proof link was
 * told the learner's proof had been revoked. That is the worst possible lie for
 * this product to tell: the whole promise is that proof is trustworthy, and a
 * server misconfiguration was being reported as the learner's evidence being
 * withdrawn.
 *
 * A transport or permission error means we do not know the answer. Say that,
 * make it retryable, and log it — do not invent a verdict about the proof.
 */

export type RpcOutcome<T> =
  | { kind: "ok"; data: T }
  | { kind: "empty" }
  | { kind: "unavailable"; reason: string };

export function classifyRpc<T>(
  result: { data: T | null; error: { message?: string; code?: string } | null },
  context: string,
): RpcOutcome<T> {
  if (result.error) {
    const reason = result.error.code
      ? `${result.error.code}: ${result.error.message ?? "unknown"}`
      : result.error.message ?? "unknown";
    // Server-side only. The visitor never sees this; they get a retryable 503.
    console.error(`[rpc-unavailable] ${context}: ${reason}`);
    return { kind: "unavailable", reason };
  }
  if (result.data === null || result.data === undefined) return { kind: "empty" };
  return { kind: "ok", data: result.data };
}
