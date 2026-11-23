"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/auth";
import { RealisationFormSchema } from "@/lib/validators/realisation";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type ActionResult = { error?: string; ok?: boolean };

function revalidateAll(slug?: string) {
  revalidatePath("/admin/realisations");
  revalidatePath("/realisations");
  if (slug) revalidatePath(`/realisations/${slug}`);
}

/** Crée une réalisation */
export async function createRealisation(
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireAdmin();
  const supabase = await createClient();

  // Parse
  const raw = {
    titre: formData.get("titre"),
    slug: formData.get("slug"),
    description_courte: formData.get("description_courte"),
    description_longue: formData.get("description_longue"),
    categorie_id: formData.get("categorie_id"),
    annee: formData.get("annee") || undefined,
    lieu: formData.get("lieu"),
    dimensions: formData.get("dimensions"),
    duree_realisation: formData.get("duree_realisation"),
    statut: formData.get("statut") || "brouillon",
    a_la_une: formData.get("a_la_une") === "on",
    seo_title: formData.get("seo_title"),
    seo_description: formData.get("seo_description"),
    tags: JSON.parse(String(formData.get("tags") || "[]")),
    photos: JSON.parse(String(formData.get("photos") || "[]")),
  };

  const parsed = RealisationFormSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.errors[0];
    return { error: `${first.path.join(".")}: ${first.message}` };
  }

  const v = parsed.data;

  // Insert réalisation
  const { data: created, error } = await supabase
    .from("realisations")
    .insert({
      titre: v.titre,
      slug: v.slug,
      description_courte: v.description_courte || null,
      description_longue: v.description_longue || null,
      categorie_id: v.categorie_id,
      annee: v.annee ?? null,
      lieu: v.lieu || null,
      dimensions: v.dimensions || null,
      duree_realisation: v.duree_realisation || null,
      statut: v.statut,
      a_la_une: v.a_la_une,
      seo_title: v.seo_title || null,
      seo_description: v.seo_description || null,
      created_by: user.id,
    })
    .select("id, slug")
    .single();

  if (error || !created) {
    if (error?.code === "23505") {
      return { error: "Ce slug existe déjà. Choisis-en un autre." };
    }
    return { error: error?.message || "Erreur création" };
  }

  // Photos
  if (v.photos.length) {
    await supabase.from("realisation_photos").insert(
      v.photos.map((p, i) => ({
        realisation_id: created.id,
        url: p.url,
        public_id: p.public_id,
        alt: p.alt || v.titre,
        ordre: i,
        is_cover: i === 0,
        width: p.width,
        height: p.height,
      })),
    );
  }

  // Tags
  if (v.tags.length) {
    await supabase.from("realisation_tags").insert(
      v.tags.map((tag_id) => ({
        realisation_id: created.id,
        tag_id,
      })),
    );
  }

  // Audit
  await supabase.from("audit_log").insert({
    user_id: user.id,
    user_email: user.email,
    action: "create",
    entity: "realisation",
    entity_id: created.id,
    after_data: v as unknown as Record<string, unknown>,
  });

  revalidateAll(created.slug);
  redirect(`/admin/realisations/${created.id}?ok=1`);
}

/** Met à jour une réalisation */
export async function updateRealisation(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireAdmin();
  const supabase = await createClient();

  const raw = {
    titre: formData.get("titre"),
    slug: formData.get("slug"),
    description_courte: formData.get("description_courte"),
    description_longue: formData.get("description_longue"),
    categorie_id: formData.get("categorie_id"),
    annee: formData.get("annee") || undefined,
    lieu: formData.get("lieu"),
    dimensions: formData.get("dimensions"),
    duree_realisation: formData.get("duree_realisation"),
    statut: formData.get("statut") || "brouillon",
    a_la_une: formData.get("a_la_une") === "on",
    seo_title: formData.get("seo_title"),
    seo_description: formData.get("seo_description"),
    tags: JSON.parse(String(formData.get("tags") || "[]")),
    photos: JSON.parse(String(formData.get("photos") || "[]")),
  };

  const parsed = RealisationFormSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.errors[0];
    return { error: `${first.path.join(".")}: ${first.message}` };
  }
  const v = parsed.data;

  // Update réalisation
  const { error } = await supabase
    .from("realisations")
    .update({
      titre: v.titre,
      slug: v.slug,
      description_courte: v.description_courte || null,
      description_longue: v.description_longue || null,
      categorie_id: v.categorie_id,
      annee: v.annee ?? null,
      lieu: v.lieu || null,
      dimensions: v.dimensions || null,
      duree_realisation: v.duree_realisation || null,
      statut: v.statut,
      a_la_une: v.a_la_une,
      seo_title: v.seo_title || null,
      seo_description: v.seo_description || null,
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { error: "Ce slug existe déjà." };
    }
    return { error: error.message };
  }

  // Photos : delete + reinsert (simple et fiable)
  await supabase.from("realisation_photos").delete().eq("realisation_id", id);
  if (v.photos.length) {
    await supabase.from("realisation_photos").insert(
      v.photos.map((p, i) => ({
        realisation_id: id,
        url: p.url,
        public_id: p.public_id,
        alt: p.alt || v.titre,
        ordre: i,
        is_cover: i === 0,
        width: p.width,
        height: p.height,
      })),
    );
  }

  // Tags : delete + reinsert
  await supabase.from("realisation_tags").delete().eq("realisation_id", id);
  if (v.tags.length) {
    await supabase
      .from("realisation_tags")
      .insert(v.tags.map((tag_id) => ({ realisation_id: id, tag_id })));
  }

  await supabase.from("audit_log").insert({
    user_id: user.id,
    user_email: user.email,
    action: "update",
    entity: "realisation",
    entity_id: id,
    after_data: v as unknown as Record<string, unknown>,
  });

  revalidateAll(v.slug);
  return { ok: true };
}

/** Supprime une réalisation */
export async function deleteRealisation(id: string): Promise<ActionResult> {
  const user = await requireAdmin();
  const supabase = await createClient();

  const { data: before } = await supabase
    .from("realisations")
    .select("titre, slug")
    .eq("id", id)
    .single();

  const { error } = await supabase.from("realisations").delete().eq("id", id);
  if (error) return { error: error.message };

  await supabase.from("audit_log").insert({
    user_id: user.id,
    user_email: user.email,
    action: "delete",
    entity: "realisation",
    entity_id: id,
    before_data: before ?? null,
  });

  revalidateAll(before?.slug);
  redirect("/admin/realisations");
}

/** Publier / dépublier */
export async function toggleStatut(
  id: string,
  currentStatut: string,
): Promise<ActionResult> {
  const user = await requireAdmin();
  const supabase = await createClient();

  const newStatut = currentStatut === "publie" ? "brouillon" : "publie";

  const { data: updated, error } = await supabase
    .from("realisations")
    .update({ statut: newStatut })
    .eq("id", id)
    .select("slug")
    .single();

  if (error) return { error: error.message };

  await supabase.from("audit_log").insert({
    user_id: user.id,
    user_email: user.email,
    action: newStatut === "publie" ? "publish" : "unpublish",
    entity: "realisation",
    entity_id: id,
  });

  revalidateAll(updated?.slug);
  return { ok: true };
}

/** Toggle à la une */
export async function toggleFeatured(
  id: string,
  current: boolean,
): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();

  const { data: updated, error } = await supabase
    .from("realisations")
    .update({ a_la_une: !current })
    .eq("id", id)
    .select("slug")
    .single();

  if (error) return { error: error.message };

  revalidateAll(updated?.slug);
  return { ok: true };
}

/** Dupliquer une réalisation */
export async function duplicateRealisation(id: string): Promise<ActionResult> {
  const user = await requireAdmin();
  const supabase = await createClient();

  const { data: src } = await supabase
    .from("realisations")
    .select("*")
    .eq("id", id)
    .single();
  if (!src) return { error: "Réalisation introuvable" };

  const newSlug = `${src.slug}-copie-${Date.now().toString(36)}`;

  const { data: created, error } = await supabase
    .from("realisations")
    .insert({
      titre: `${src.titre} (copie)`,
      slug: newSlug,
      description_courte: src.description_courte,
      description_longue: src.description_longue,
      categorie_id: src.categorie_id,
      annee: src.annee,
      lieu: src.lieu,
      dimensions: src.dimensions,
      duree_realisation: src.duree_realisation,
      statut: "brouillon",
      a_la_une: false,
      seo_title: src.seo_title,
      seo_description: src.seo_description,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !created) return { error: error?.message };

  // Copier photos
  const { data: photos } = await supabase
    .from("realisation_photos")
    .select("url, public_id, alt, ordre, is_cover, width, height")
    .eq("realisation_id", id);
  if (photos?.length) {
    await supabase
      .from("realisation_photos")
      .insert(photos.map((p) => ({ ...p, realisation_id: created.id })));
  }

  // Copier tags
  const { data: rtags } = await supabase
    .from("realisation_tags")
    .select("tag_id")
    .eq("realisation_id", id);
  if (rtags?.length) {
    await supabase
      .from("realisation_tags")
      .insert(
        rtags.map((t) => ({ realisation_id: created.id, tag_id: t.tag_id })),
      );
  }

  revalidatePath("/admin/realisations");
  return { ok: true };
}
