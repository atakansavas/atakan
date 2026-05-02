import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = typeof body?.email === "string" ? body.email.trim() : "";
    const theme = typeof body?.theme === "string" ? body.theme : null;
    const kitId = typeof body?.kitId === "string" ? body.kitId : null;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { ok: false, error: "invalid_email" },
        { status: 400 },
      );
    }

    const queue = 100 + Math.floor(Math.random() * 800);

    console.log("[mesai/waitlist]", { email, theme, kitId, queue });

    return NextResponse.json({ ok: true, queue });
  } catch {
    return NextResponse.json(
      { ok: false, error: "server_error" },
      { status: 500 },
    );
  }
}
