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
  description: "Push an example mark. See what one asset can pay. This host takes no deposit.",
  openGraph: {
    title: "PERC",
    description: "Push an example mark. See what one asset can pay. This host takes no deposit.",
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
