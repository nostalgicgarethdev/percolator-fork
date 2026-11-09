import type { Metadata } from "next";
import { IBM_Plex_Mono, Instrument_Sans, Instrument_Serif } from "next/font/google";
import { Closed } from "@/components/closed";
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
  title: "PERC is closed",
  description: "PERC is closed for now. The desk is off while it gets worked on.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "PERC is closed",
    description: "Closed for now. The desk is off while it gets worked on.",
    images: ["/brand/perc-square-1024.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  void children;
  return (
    <html
      lang="en"
      className={`dark ${sans.variable} ${serif.variable} ${plex.variable}`}
    >
      <body className="min-h-dvh antialiased">
        <Closed />
      </body>
    </html>
  );
}
