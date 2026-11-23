import { CA_LIVE } from "@/lib/token";

/** Mint strip and mint section stay dark while CA_LIVE is false. */
export function TokenCaBar() {
  if (!CA_LIVE) return null;
  return null;
}

export function TokenCa() {
  if (!CA_LIVE) return null;
  return null;
}
