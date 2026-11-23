import { Slab } from "@/components/slab";
import { Story } from "@/components/story";
import { TokenCa } from "@/components/token-ca";

export function Home() {
  return (
    <main className="mx-auto w-full max-w-6xl px-5 pt-2 pb-16 sm:px-8">
      <p className="px-1 pt-6 max-w-xl text-[15px] leading-relaxed text-white/55">
        An independent, read-only desk on Anatoly Yakovenko&apos;s open-source perps engine. This
        host does not trade.
      </p>
      <Slab />
      <Story />
      <TokenCa />
    </main>
  );
}
