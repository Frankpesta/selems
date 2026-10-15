import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Instrument_Sans } from "next/font/google";
import "./globals.css";

const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  display: "swap",
  variable: "--font-bodoni",
});

const instrument = Instrument_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-instrument",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://selemsexclusivehotel.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Hotel in Akure | Selems Exclusive Hotel & Suites",
    template: "%s",
  },
  applicationName: "Selems Exclusive Hotel & Suites",
};

export const viewport: Viewport = {
  themeColor: "#17222D",
  colorScheme: "light",
};

// Root layout stays free of cookies/headers so public pages can be static.
// Convex Auth providers live in the /admin layout only (docs/03).
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-NG" className={`${bodoni.variable} ${instrument.variable}`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
