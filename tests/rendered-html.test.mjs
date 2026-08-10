import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the Lan Pya application shell and sharing metadata", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Lan Pya — From Map to Proof<\/title>/i);
  assert.match(html, /name="description" content="A career roadmap and evidence platform/i);
  assert.match(html, /property="og:image" content="http:\/\/localhost:3000\/lan-pya-social\.png"/i);
  assert.match(html, /aria-label="Loading Lan Pya"/i);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("keeps the hackathon proof loop and trust labels in source", async () => {
  const [page, layout, css, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  for (const label of ["Choose", "Build", "Prove", "Connect"]) {
    assert.match(page, new RegExp(`\\b${label}\\b`));
  }
  assert.match(page, /deterministic checks and simulated AI-style feedback/i);
  assert.match(page, /not expert verification/i);
  assert.match(page, /private by default/i);
  assert.match(page, /Ready now/);
  assert.match(page, /Build toward/);
  assert.match(page, /Explore/);

  assert.match(layout, /lan-pya-social\.png/);
  assert.match(css, /--navy:\s*#0f172a/i);
  assert.match(css, /--teal:\s*#0f766e/i);
  assert.match(css, /--yellow:\s*#f59e0b/i);
  assert.match(packageJson, /"name": "lan-pya-hackathon-prototype"/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);

  await Promise.all([
    access(new URL("../public/lan-pya-logo.jpg", import.meta.url)),
    access(new URL("../public/lan-pya-screen-board.png", import.meta.url)),
    access(new URL("../public/lan-pya-social.png", import.meta.url)),
  ]);
  await assert.rejects(
    access(new URL("../app/_sites-preview/SkeletonPreview.tsx", import.meta.url)),
  );
});
