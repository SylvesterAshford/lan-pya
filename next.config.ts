import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  allowedDevOrigins: ["127.0.0.1"],
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // public/fonts holds the self-hosted Padauk files. Their names carry the
  // version, so they can be cached like hashed assets.
  // Images in public/ are not versioned by name, so they get a day rather than
  // a year. Without this they are served max-age=0, and every page load spent a
  // round trip per image asking whether it had changed (PERF.md #11).
  async headers() {
    const day = { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" };
    return [
      { source: "/fonts/:file*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
      ...["/art/:file*", "/brand/:file*", "/partners/:file*", "/lan-pya-logo.jpg", "/lan-pya-social.png", "/favicon.svg"].map((source) => ({ source, headers: [day] })),
    ];
  },
};

// Messages are compiled at build time, so the browser gets next-intl's small
// format-only runtime instead of the ICU message parser, which every page
// loaded for the two sign-in forms (PERF.md #13).
const withNextIntl = createNextIntlPlugin({
  requestConfig: "./i18n/request.ts",
  experimental: { messages: { path: "./messages", format: "json", locales: "infer", precompile: true } },
});

export default withNextIntl(nextConfig);
