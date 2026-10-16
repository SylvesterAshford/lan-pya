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
  async headers() {
    return [{ source: "/fonts/:file*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] }];
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
