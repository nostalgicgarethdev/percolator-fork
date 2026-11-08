import type { Metadata } from "next";
import { Desk } from "@/components/desk";

export const metadata: Metadata = {
  title: "Terminal — PERC",
  description:
    "Read-only desk for the Percolator v16 risk engine. No deposits on this host.",
};

export default function TerminalPage() {
  return <Desk />;
}
