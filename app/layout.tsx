import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lan Pya — From Map to Proof",
  description:
    "A career roadmap and evidence platform helping Myanmar youth turn one next step into trusted proof.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "Lan Pya — From Map to Proof",
    description:
      "Choose a direction, build real work, prove what you can do, and connect to the next opportunity.",
    images: [{ url: "/lan-pya-social.png", width: 1200, height: 630, alt: "Lan Pya — From Map to Proof" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lan Pya — From Map to Proof",
    description:
      "A focused career proof loop for Myanmar youth.",
    images: ["/lan-pya-social.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
