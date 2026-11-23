import { createClient } from "@/lib/supabase/server";
import type { RealisationFormValues } from "@/lib/validators/realisation";

const LIST_SELECT = `
  id, slug, titre, description_courte, statut, annee, lieu,
  a_la_une, ordre_affichage, updated_at, published_at,
  categorie:categories(slug, nom, couleur),
  photos:realisation_photos(id, url, public_id, is_cover, ordre)
`;

const DETAIL_SELECT = `
  *,
  categorie:categories(slug, nom),
  photos:realisation_photos(id, url, public_id, alt, ordre, is_cover, width, height),
  tags:realisation_tags(tag:tags(id, slug, nom, type))
`;

export async function listRealisations(opts?: {
  search?: string;
  statut?: string;
}) {
  const supabase = await createClient();

  let q = supabase
    .from("realisations")
    .select(LIST_SELECT)
    .order("updated_at", { ascending: false });

  if (opts?.statut && opts.statut !== "all") {
    q = q.eq("statut", opts.statut);
  }

  if (opts?.search?.trim()) {
    q = q.ilike("titre", `%${opts.search.trim()}%`);
  }

  const { data, error } = await q;

  if (error) throw error;

  return (data ?? []).map((item) => ({
    ...item,
    categorie: Array.isArray(item.categorie)
      ? (item.categorie[0] ?? null)
      : item.categorie,
  }));
}
export async function getRealisation(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("realisations")
    .select(DETAIL_SELECT)
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function getCategoriesForForm() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, nom")
    .eq("actif", true)
    .order("ordre");
  if (error) throw error;
  return data ?? [];
}

export async function getTagsForForm() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tags")
    .select("id, slug, nom, type")
    .order("type")
    .order("ordre");
  if (error) throw error;
  return data ?? [];
}

export type RealisationListItem = Awaited<
  ReturnType<typeof listRealisations>
>[number];
