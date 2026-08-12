import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

const PRIVATE_HOST = /^(localhost|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|\[?::1\]?)/i;
const hosts = new Set(["github.com", "vercel.app", "netlify.app", "pages.dev"]);
const allowed = (raw: string) => { const url = new URL(raw); return url.protocol === "https:" && !PRIVATE_HOST.test(url.hostname) && [...hosts].some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`)); };

Deno.test("allows supported HTTPS hosts", () => {
  assertEquals(allowed("https://github.com/learner/project"), true);
  assertEquals(allowed("https://lan-pya.vercel.app"), true);
});

Deno.test("blocks private, insecure, and lookalike hosts", () => {
  assertEquals(allowed("http://github.com/learner/project"), false);
  assertEquals(allowed("https://127.0.0.1/project"), false);
  assertEquals(allowed("https://github.com.attacker.test/project"), false);
});
