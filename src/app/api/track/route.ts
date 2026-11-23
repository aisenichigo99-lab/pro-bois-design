import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const ALLOWED_EVENTS = ["view", "quote_click", "share", "favorite"] as const;
type EventType = (typeof ALLOWED_EVENTS)[number];

/**
 * POST /api/track
 * Body: { realisation_id, event_type, referrer? }
 * Public : pas d'auth requise (les visites viennent des visiteurs).
 * Utilise le service role pour bypasser RLS en écriture.
 */
export async function POST(req: NextRequest) {
  let body: {
    realisation_id?: string;
    event_type?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  if (
    !body.realisation_id ||
    !body.event_type ||
    !ALLOWED_EVENTS.includes(body.event_type as EventType)
  ) {
    return NextResponse.json(
      { error: "Paramètres invalides" },
      { status: 400 },
    );
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("realisation_events").insert({
    realisation_id: body.realisation_id,
    event_type: body.event_type,
    referrer: req.headers.get("referer") ?? null,
    user_agent: req.headers.get("user-agent") ?? null,
  });

  if (error) {
    console.error("track insert error:", error);
    return NextResponse.json({ error: "Erreur insertion" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
