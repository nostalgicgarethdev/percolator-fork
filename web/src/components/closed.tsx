import { Mark } from "@/components/mark";

export function Closed() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col justify-center px-6 py-16">
      <Mark className="size-8 text-foreground" />
      <p className="mt-8 text-[13px] text-muted-foreground">PERC</p>
      <h1 className="mt-3 text-[clamp(2.6rem,7vw,4.4rem)] leading-[0.95] font-semibold tracking-[-0.05em]">
        Closed for now.
      </h1>
      <p className="mt-5 text-[17px] leading-relaxed text-muted-foreground">
        The desk is off while it gets worked on. Nothing here takes a deposit.
      </p>
    </main>
  );
}
