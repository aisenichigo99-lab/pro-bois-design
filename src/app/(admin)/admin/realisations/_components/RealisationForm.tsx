"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ImageUploader,
  type UploadedImage,
} from "@/components/admin/ImageUploader";

type Categorie = { id: string; nom: string };
type Tag = { id: string; nom: string; type: string };
type Photo = UploadedImage & { id?: string };

type InitialValues = {
  id?: string;
  titre?: string;
  slug?: string;
  description_courte?: string;
  description_longue?: string;
  categorie_id?: string;
  annee?: number | null;
  lieu?: string;
  dimensions?: string;
  duree_realisation?: string;
  statut?: string;
  a_la_une?: boolean;
  seo_title?: string;
  seo_description?: string;
  tags?: string[];
  photos?: Photo[];
};

type Props = {
  categories: Categorie[];
  tags: Tag[];
  initial?: InitialValues;
  action: (formData: FormData) => Promise<{ error?: string; ok?: boolean }>;
  submitLabel: string;
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function RealisationForm({
  categories,
  tags,
  initial = {},
  action,
  submitLabel,
}: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>(initial.photos ?? []);
  const [selectedTags, setSelectedTags] = useState<string[]>(
    initial.tags ?? [],
  );
  const [slug, setSlug] = useState(initial.slug ?? "");
  const [slugLocked, setSlugLocked] = useState(!!initial.id);
  const [titre, setTitre] = useState(initial.titre ?? "");

  function onTitreChange(v: string) {
    setTitre(v);
    if (!slugLocked) setSlug(slugify(v));
  }

  function toggleTag(id: string) {
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    formData.set("tags", JSON.stringify(selectedTags));
    formData.set(
      "photos",
      JSON.stringify(
        photos.map((p) => ({
          url: p.url,
          public_id: p.public_id,
          width: p.width,
          height: p.height,
          alt: p.alt || titre,
        })),
      ),
    );
    const res = await action(formData);
    if (res?.error) {
      setError(res.error);
      setLoading(false);
      return;
    }
    if (initial.id) {
      // édition → message ok
      setLoading(false);
      router.refresh();
    }
    // création → redirect() est géré côté action
  }

  const tagsByType = tags.reduce<Record<string, Tag[]>>((acc, t) => {
    (acc[t.type] = acc[t.type] || []).push(t);
    return acc;
  }, {});

  return (
    <form action={handleSubmit} className="space-y-6">
      {error && (
        <div className="text-sm text-red-400 bg-red-950/30 border border-red-900/50 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {/* Infos principales */}
      <section className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-4">
        <h2 className="text-sm uppercase tracking-wider text-neutral-400">
          Informations
        </h2>

        <div>
          <label className="block text-xs text-neutral-400 mb-1.5">
            Titre *
          </label>
          <input
            name="titre"
            required
            value={titre}
            onChange={(e) => onTitreChange(e.target.value)}
            className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-4 py-2.5 text-sm outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs text-neutral-400 mb-1.5">
            Slug (URL) *
          </label>
          <div className="flex gap-2">
            <input
              name="slug"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="flex-1 rounded-lg bg-neutral-950 border border-neutral-800 px-4 py-2.5 text-sm font-mono outline-none focus:border-amber-500"
            />
            <button
              type="button"
              onClick={() => setSlugLocked((l) => !l)}
              className="text-xs px-3 rounded-lg border border-neutral-700 hover:bg-neutral-800"
            >
              {slugLocked ? "🔒" : "🔓"}
            </button>
          </div>
          <p className="text-xs text-neutral-600 mt-1">
            /realisations/{slug || "…"}
          </p>
        </div>

        <div>
          <label className="block text-xs text-neutral-400 mb-1.5">
            Description courte
          </label>
          <textarea
            name="description_courte"
            rows={2}
            maxLength={300}
            defaultValue={initial.description_courte ?? ""}
            className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-4 py-2.5 text-sm outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs text-neutral-400 mb-1.5">
            Description longue
          </label>
          <textarea
            name="description_longue"
            rows={6}
            defaultValue={initial.description_longue ?? ""}
            className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-4 py-2.5 text-sm outline-none focus:border-amber-500"
          />
        </div>
      </section>

      {/* Détails */}
      <section className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <h2 className="text-sm uppercase tracking-wider text-neutral-400 col-span-full">
          Détails du projet
        </h2>

        <div>
          <label className="block text-xs text-neutral-400 mb-1.5">
            Catégorie *
          </label>
          <select
            name="categorie_id"
            required
            defaultValue={initial.categorie_id ?? ""}
            className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-4 py-2.5 text-sm outline-none focus:border-amber-500"
          >
            <option value="" disabled>
              Sélectionner…
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-neutral-400 mb-1.5">Année</label>
          <input
            name="annee"
            type="number"
            min={2000}
            max={2100}
            defaultValue={initial.annee ?? ""}
            className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-4 py-2.5 text-sm outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs text-neutral-400 mb-1.5">Lieu</label>
          <input
            name="lieu"
            defaultValue={initial.lieu ?? ""}
            className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-4 py-2.5 text-sm outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs text-neutral-400 mb-1.5">
            Dimensions
          </label>
          <input
            name="dimensions"
            defaultValue={initial.dimensions ?? ""}
            placeholder="220 × 90 × 75 cm"
            className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-4 py-2.5 text-sm outline-none focus:border-amber-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs text-neutral-400 mb-1.5">
            Durée de réalisation
          </label>
          <input
            name="duree_realisation"
            defaultValue={initial.duree_realisation ?? ""}
            placeholder="6 semaines"
            className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-4 py-2.5 text-sm outline-none focus:border-amber-500"
          />
        </div>
      </section>

      {/* Tags */}
      <section className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-3">
        <h2 className="text-sm uppercase tracking-wider text-neutral-400">
          Tags
        </h2>
        {Object.entries(tagsByType).map(([type, list]) => (
          <div key={type}>
            <p className="text-xs text-neutral-500 uppercase mb-2">{type}</p>
            <div className="flex flex-wrap gap-2">
              {list.map((t) => {
                const active = selectedTags.includes(t.id);
                return (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => toggleTag(t.id)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition ${
                      active
                        ? "bg-amber-500 text-neutral-950 border-amber-500 font-medium"
                        : "border-neutral-700 text-neutral-300 hover:border-neutral-500"
                    }`}
                  >
                    {t.nom}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      {/* Photos */}
      <section className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-3">
        <h2 className="text-sm uppercase tracking-wider text-neutral-400">
          Photos
        </h2>
        <ImageUploader images={photos} onChange={setPhotos} maxFiles={12} />
      </section>

      {/* Publication */}
      <section className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-4">
        <h2 className="text-sm uppercase tracking-wider text-neutral-400">
          Publication
        </h2>

        <div>
          <label className="block text-xs text-neutral-400 mb-1.5">
            Statut
          </label>
          <select
            name="statut"
            defaultValue={initial.statut ?? "brouillon"}
            className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-4 py-2.5 text-sm outline-none focus:border-amber-500"
          >
            <option value="brouillon">Brouillon</option>
            <option value="publie">Publié</option>
            <option value="archive">Archivé</option>
          </select>
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="a_la_une"
            defaultChecked={initial.a_la_une ?? false}
            className="w-4 h-4 accent-amber-500"
          />
          <span className="text-sm">Mettre à la une ★</span>
        </label>
      </section>

      {/* SEO */}
      <section className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-4">
        <h2 className="text-sm uppercase tracking-wider text-neutral-400">
          SEO (optionnel)
        </h2>
        <div>
          <label className="block text-xs text-neutral-400 mb-1.5">
            Meta title
          </label>
          <input
            name="seo_title"
            defaultValue={initial.seo_title ?? ""}
            maxLength={60}
            className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-4 py-2.5 text-sm outline-none focus:border-amber-500"
          />
        </div>
        <div>
          <label className="block text-xs text-neutral-400 mb-1.5">
            Meta description
          </label>
          <textarea
            name="seo_description"
            rows={2}
            maxLength={160}
            defaultValue={initial.seo_description ?? ""}
            className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-4 py-2.5 text-sm outline-none focus:border-amber-500"
          />
        </div>
      </section>

      <div className="flex items-center gap-3 sticky bottom-4 bg-neutral-950/80 backdrop-blur p-3 rounded-xl border border-neutral-800">
        <button
          type="button"
          onClick={() => router.push("/admin/realisations")}
          className="rounded-lg border border-neutral-700 px-4 py-2.5 text-sm hover:bg-neutral-900 transition"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-amber-500 text-neutral-950 font-medium px-6 py-2.5 text-sm hover:bg-amber-400 transition disabled:opacity-50"
        >
          {loading ? "Enregistrement…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
