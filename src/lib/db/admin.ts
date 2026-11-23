import { createClient } from "@/lib/supabase/server";

export async function getGlobalStats() {
  const supabase = await createClient();

  const [total, published, drafts, archived] = await Promise.all([
    supabase.from("realisations").select("*", { count: "exact", head: true }),
    supabase
      .from("realisations")
      .select("*", { count: "exact", head: true })
      .eq("statut", "publie"),
    supabase
      .from("realisations")
      .select("*", { count: "exact", head: true })
      .eq("statut", "brouillon"),
    supabase
      .from("realisations")
      .select("*", { count: "exact", head: true })
      .eq("statut", "archive"),
  ]);

  return {
    total: total.count ?? 0,
    published: published.count ?? 0,
    drafts: drafts.count ?? 0,
    archived: archived.count ?? 0,
  };
}

export async function getTopRealisations(limit = 5) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("realisation_stats")
    .select("id, titre, slug, vues, clics_devis, partages")
    .order("vues", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getRecentAudit(limit = 10) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("audit_log")
    .select("id, user_email, action, entity, entity_id, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}
