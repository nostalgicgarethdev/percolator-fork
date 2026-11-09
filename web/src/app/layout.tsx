import type { Metadata } from "next";
import { IBM_Plex_Mono, Instrument_Sans, Instrument_Serif } from "next/font/google";
import { Shell } from "@/components/shell";
import "./globals.css";

const sans = Instrument_Sans({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const serif = Instrument_Serif({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["400"],
});

const plex = IBM_Plex_Mono({
  variable: "--font-plex",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.percolator.beer"),
  title: "PERC — independent perpetuals desk",
  description:
    "See how a perpetual desk is put together. This host is read-only: no engine, no deposits, no public trading.",
  openGraph: {
    title: "PERC",
    description: "A read-only look at a perpetual desk. No deposits and no public trading on this host.",
    images: ["/brand/perc-square-1024.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${sans.variable} ${serif.variable} ${plex.variable}`}
    >
      <body className="min-h-dvh antialiased">
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
