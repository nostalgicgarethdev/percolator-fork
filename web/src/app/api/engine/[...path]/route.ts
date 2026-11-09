import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const CLOSED = true;
const BASE = process.env.FORK_ENGINE_URL ?? "http://127.0.0.1:43124";

async function proxy(request: NextRequest, path: string[]) {
  const target = `${BASE}/${path.join("/")}`;
  try {
    const headers = new Headers();
    if (request.method !== "GET" && request.method !== "HEAD") {
      headers.set("content-type", "application/json");
    }
    const response = await fetch(target, {
      method: request.method,
      headers,
      body:
        request.method === "GET" || request.method === "HEAD"
          ? undefined
          : await request.text(),
      cache: "no-store",
      signal: AbortSignal.timeout(2000),
    });
    const text = await response.text();
    return new NextResponse(text, {
      status: response.status,
      headers: { "content-type": "application/json" },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          "Local engine is not reachable. The page stays read-only until fork-engine is running on this machine.",
        detail: error instanceof Error ? error.message : "connection failed",
      },
      { status: 503 },
    );
  }
}

type Context = { params: Promise<{ path: string[] }> };

function closed() {
  return NextResponse.json({ error: "PERC is closed for now." }, { status: 503 });
}

export async function GET(request: NextRequest, context: Context) {
  if (CLOSED) return closed();
  const { path } = await context.params;
  return proxy(request, path);
}

export async function POST(request: NextRequest, context: Context) {
  if (CLOSED) return closed();
  const { path } = await context.params;
  return proxy(request, path);
}
