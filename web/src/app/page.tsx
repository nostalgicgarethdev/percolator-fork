import type { Metadata } from "next";
import { Home } from "@/components/home";

export const metadata: Metadata = {
  title: "PERC — independent perpetuals desk",
  description:
    "PERC is an independent perpetual-futures interface built on Percolator. Read-only on this host. No deposits and no public trading.",
};

export default function HomePage() {
  return <Home />;
}
