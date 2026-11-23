import type { Metadata } from "next";
import { Home } from "@/components/home";

export const metadata: Metadata = {
  title: "PERC — independent, read-only Percolator desk",
  description:
    "An independent read of Anatoly Yakovenko's open-source perps engine. This host does not take deposits or run live trading. The source is public.",
};

export default function HomePage() {
  return <Home />;
}
