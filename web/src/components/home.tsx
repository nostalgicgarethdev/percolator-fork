import { Slab } from "@/components/slab";
import { TokenCa } from "@/components/token-ca";

export function Home() {
  return (
    <main className="mx-auto w-full max-w-6xl px-5 pt-2 pb-16 sm:px-8">
      <Slab />
      <TokenCa />
    </main>
  );
}
