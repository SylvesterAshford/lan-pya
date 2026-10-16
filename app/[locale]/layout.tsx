import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { preload } from "react-dom";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { ServiceWorkerRegistration } from "@/components/pwa/service-worker-registration";
import "../globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-ui",
});

// Padauk (Myanmar glyphs only) is self-hosted in public/fonts and declared in
// globals.css rather than loaded with next/font: next/font preloads a font on
// every page of the layout, so English pages fetched 80 KB of Burmese font
// that competed with the CSS on slow connections (PERF.md #6). Only Burmese
// pages preload it now. The files are versioned by name: replace a file under
// a new name, because /fonts is cached for a year.
const PADAUK = ["/fonts/padauk-myanmar-400.v1.woff2", "/fonts/padauk-myanmar-700.v1.woff2"];

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Lan Pya — From Map to Proof",
  description:
    "A bilingual career roadmap and evidence platform helping Myanmar learners turn one next step into trusted proof.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/favicon.svg", apple: "/favicon.svg" },
  openGraph: {
    title: "Lan Pya — From Map to Proof",
    description: "Choose a direction, build real work, prove it, and connect.",
    images: ["/lan-pya-social.png"],
  },
  twitter: { card: "summary_large_image", images: ["/lan-pya-social.png"] },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f172a",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();
  if (locale === "my") PADAUK.forEach((href) => preload(href, { as: "font", type: "font/woff2", crossOrigin: "anonymous" }));

  return (
    <html lang={locale} data-scroll-behavior="smooth">
      <body className={`${plusJakartaSans.variable} ${plusJakartaSans.className}`}>
        <NextIntlClientProvider messages={messages}>
          {children}
          <ServiceWorkerRegistration />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
