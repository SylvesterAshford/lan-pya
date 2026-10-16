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
  // Home reads CHANGELOG.md at runtime for the "New this week" rail. Without
  // this, the file is not traced into the serverless bundle and the rail
  // silently disappears in production while working perfectly in dev.
  outputFileTracingIncludes: {
    "/[locale]/app/today": ["./CHANGELOG.md"],
  },
};

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

export default withNextIntl(nextConfig);
