// Re-checks every link in lib/domain/learning-resources.ts.
//
//   npm run check:resources            all links
//   npm run check:resources -- frontend-quality api-design   some stages
//
// Videos are checked through YouTube's oEmbed endpoint, which answers only for
// public, embeddable videos, and the channel it names must match `source`. The
// running time is read from the watch page and compared with `minutes`. Pages
// must load (after redirects) with a 2xx status. Anything off is listed with
// the reason; the exit code is 1 if anything failed.
import { LEARNING_RESOURCES } from "../lib/domain/learning-resources.ts";

const only = process.argv.slice(2);
// Some sites turn away one user agent and not the other, so a page that fails
// with the first is tried again with the second before it counts as broken.
const agents = [
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36",
  "Mozilla/5.0 (compatible; LanPyaLinkCheck/1.0)",
];

const jobs = [];
for (const [stage, topics] of Object.entries(LEARNING_RESOURCES)) {
  if (only.length && !only.includes(stage)) continue;
  for (const { topic, resources } of topics) for (const resource of resources) jobs.push({ stage, topic, resource });
}

async function get(url, agent = agents[0]) {
  for (let attempt = 0; ; attempt++) {
    try {
      const headers = { "user-agent": agent, "accept-language": "en-US,en;q=0.9" };
      return await fetch(url, { headers, redirect: "follow", signal: AbortSignal.timeout(20000) });
    } catch (error) {
      if (attempt === 2) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }
}

async function check({ resource }) {
  const { url, source, minutes } = resource;
  const youtube = url.match(/youtube\.com\/(?:watch\?v=|playlist\?list=)([\w-]+)/);
  if (youtube) {
    const oembed = await get(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url)}`);
    if (!oembed.ok) return `not available (oEmbed ${oembed.status})`;
    const { author_name: author, title } = await oembed.json();
    const problems = [];
    if (author.trim() !== source) problems.push(`channel is "${author}", not "${source}"`);
    if (minutes && url.includes("watch?v=")) {
      const html = await (await get(url)).text();
      const seconds = Number(html.match(/"lengthSeconds":"(\d+)"/)?.[1] ?? 0);
      const actual = Math.max(1, Math.round(seconds / 60));
      if (seconds && Math.abs(actual - minutes) > Math.max(2, minutes * 0.15)) problems.push(`runs ${actual} min, not ${minutes}`);
    }
    return problems.length ? `${problems.join("; ")} [${title}]` : null;
  }
  let response = await get(url);
  if (!response.ok) response = await get(url, agents[1]);
  if (!response.ok) return `HTTP ${response.status}`;
  return null;
}

let failed = 0;
for (let i = 0; i < jobs.length; i += 8) {
  const batch = jobs.slice(i, i + 8);
  const results = await Promise.all(batch.map((job) => check(job).catch((error) => `error: ${error.message}`)));
  results.forEach((problem, index) => {
    if (!problem) return;
    failed++;
    const { stage, topic, resource } = batch[index];
    console.log(`FAIL ${stage} / ${topic}\n     ${resource.url}\n     ${problem}`);
  });
}
console.log(`${jobs.length - failed} of ${jobs.length} links OK`);
process.exit(failed ? 1 : 0);
