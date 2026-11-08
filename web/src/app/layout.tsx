import type { Metadata } from "next";
import { Barlow, IBM_Plex_Mono, Newsreader } from "next/font/google";
import { Shell } from "@/components/shell";
import "./globals.css";

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500"],
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
    "PERC is an independent perpetual-futures interface built on Percolator. Read-only on this host. Not an official product.",
  openGraph: {
    title: "PERC",
    description: "An independent perpetual-futures interface built on Percolator. Read-only. No deposits.",
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
      className={`dark ${barlow.variable} ${newsreader.variable} ${plex.variable}`}
    >
      <body className="min-h-dvh antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(sessionStorage.getItem("perc-entered")==="1")document.documentElement.dataset.entered="1"}catch(e){document.documentElement.dataset.entered="1"}`,
          }}
        />
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
