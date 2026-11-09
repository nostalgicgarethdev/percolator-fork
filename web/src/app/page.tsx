import type { Metadata } from "next";
import { Home } from "@/components/home";

export const metadata: Metadata = {
  title: "PERC — independent perpetuals desk",
  description: "Push an example mark. See what one asset can pay. This host takes no deposit.",
};

export default function HomePage() {
  return <Home />;
}
