import { createClient } from "@/lib/supabase/server";

const PUBLIC_LIST_SELECT = `
  id, slug, titre, description_courte, annee, lieu,
  a_la_une, ordre_affichage, published_at,
  categorie:categories(slug, nom),
  photos:realisation_photos(url, alt, is_cover, ordre),
  tags:realisation_tags(tag:tags(slug, nom, type))
`;

/**
 * Liste toutes les réalisations PUBLIÉES (RLS filtre déjà).
 * Utilisée par la galerie publique + le sitemap.
 */
export async function listPublishedRealisations() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("realisations")
    .select(PUBLIC_LIST_SELECT)
    .order("a_la_une", { ascending: false })
    .order("published_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(normalize);
}

/**
 * Récupère une réalisation publiée par son slug.
 */
export async function getPublishedBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("realisations")
    .select(
      `
      *,
      categorie:categories(slug, nom),
      photos:realisation_photos(url, alt, ordre, is_cover, width, height),
      tags:realisation_tags(tag:tags(slug, nom, type))
    `,
    )
    .eq("slug", slug)
    .eq("statut", "publie")
    .single();

  if (error) return null;
  return data;
}

/**
 * Catégories actives + tags, pour les filtres.
 */
export async function getFilterOptions() {
  const supabase = await createClient();
  const [cats, tags] = await Promise.all([
    supabase
      .from("categories")
      .select("slug, nom")
      .eq("actif", true)
      .order("ordre"),
    supabase
      .from("tags")
      .select("slug, nom, type")
      .order("type")
      .order("ordre"),
  ]);
  return {
    categories: cats.data ?? [],
    tags: tags.data ?? [],
  };
}

/**
 * Normalise une réalisation pour le front public :
 * - cover = 1ère photo is_cover ou 1ère photo
 * - gallery = toutes les photos triées par ordre
 * - essences/finitions extraits des tags
 */
export function normalize(r: any) {
  const photos = (r.photos ?? []).sort(
    (a: any, b: any) => (a.ordre ?? 0) - (b.ordre ?? 0),
  );
  const cover =
    photos.find((p: any) => p.is_cover)?.url ?? photos[0]?.url ?? null;
  const tags = (r.tags ?? []).map((t: any) => t.tag).filter(Boolean);
  return {
    id: r.id,
    slug: r.slug,
    titre: r.titre,
    description_courte: r.description_courte ?? "",
    annee: r.annee,
    lieu: r.lieu ?? "",
    a_la_une: r.a_la_une,
    published_at: r.published_at,
    categorie: r.categorie ?? null,
    cover,
    photos,
    tags,
    essences: tags
      .filter((t: any) => t.type === "essence")
      .map((t: any) => t.slug),
    finitions: tags
      .filter((t: any) => t.type === "finition")
      .map((t: any) => t.slug),
  };
}

export type PublicRealisation = ReturnType<typeof normalize>;
