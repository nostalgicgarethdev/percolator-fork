import type { Metadata } from "next";
import localFont from "next/font/local";
import { Shell } from "@/components/shell";
import "./globals.css";

const sans = localFont({
  src: "../fonts/InstrumentSans-variable.ttf",
  variable: "--font-barlow",
  weight: "400 600",
  display: "swap",
});

const serif = localFont({
  src: "../fonts/InstrumentSerif-Regular.ttf",
  variable: "--font-newsreader",
  weight: "400",
  display: "swap",
});

const plex = localFont({
  src: [
    { path: "../fonts/IBMPlexMono-Regular.ttf", weight: "400", style: "normal" },
    { path: "../fonts/IBMPlexMono-Medium.ttf", weight: "500", style: "normal" },
  ],
  variable: "--font-plex",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.percolator.beer"),
  title: "PERC — independent, read-only Percolator desk",
  description:
    "An independent read of Anatoly Yakovenko's open-source perps engine. This host does not take deposits or run live trading. The source is public.",
  openGraph: {
    title: "PERC",
    description:
      "An independent, read-only desk on Toly's open-source Percolator engine. No live trading on this host.",
    images: ["/brand/perc-logo-1024.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "PERC",
    description:
      "An independent, read-only desk on Toly's open-source Percolator engine. No live trading on this host.",
    images: ["/brand/perc-logo-1024.png"],
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
      suppressHydrationWarning
    >
      <body className="min-h-dvh antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(sessionStorage.getItem('perc-entered')==='1')document.documentElement.dataset.entered='1'}catch(e){}",
          }}
        />
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
