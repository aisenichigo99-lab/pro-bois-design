"use client";

import { useState } from "react";
import { saveSettings } from "./actions";

export function SettingsForm({
  initial,
}: {
  initial: Record<string, Record<string, unknown>>;
}) {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const site = initial.site ?? {};
  const seo = initial.seo_default ?? {};

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setSaved(false);
    const res = await saveSettings(formData);
    setLoading(false);
    if (res?.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {saved && (
        <div className="text-sm text-emerald-400 bg-emerald-950/30 border border-emerald-900/50 rounded-lg px-4 py-3">
          ✅ Paramètres enregistrés
        </div>
      )}

      <section className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-4">
        <h2 className="text-sm uppercase tracking-wider text-neutral-400">
          Site
        </h2>
        <div>
          <label className="block text-xs text-neutral-400 mb-1.5">
            Nom du site
          </label>
          <input
            name="site_nom"
            defaultValue={String(site.nom ?? "")}
            className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-4 py-2.5 text-sm outline-none focus:border-amber-500"
          />
        </div>
        <div>
          <label className="block text-xs text-neutral-400 mb-1.5">
            Email de contact
          </label>
          <input
            name="site_email"
            type="email"
            defaultValue={String(site.email ?? "")}
            className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-4 py-2.5 text-sm outline-none focus:border-amber-500"
          />
        </div>
      </section>

      <section className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-4">
        <h2 className="text-sm uppercase tracking-wider text-neutral-400">
          SEO par défaut
        </h2>
        <div>
          <label className="block text-xs text-neutral-400 mb-1.5">
            Meta title
          </label>
          <input
            name="seo_title"
            defaultValue={String(seo.title ?? "")}
            className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-4 py-2.5 text-sm outline-none focus:border-amber-500"
          />
        </div>
        <div>
          <label className="block text-xs text-neutral-400 mb-1.5">
            Meta description
          </label>
          <textarea
            name="seo_description"
            rows={3}
            defaultValue={String(seo.description ?? "")}
            className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-4 py-2.5 text-sm outline-none focus:border-amber-500"
          />
        </div>
      </section>

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-amber-500 text-neutral-950 font-medium px-6 py-2.5 text-sm hover:bg-amber-400 transition disabled:opacity-50"
      >
        {loading ? "Enregistrement…" : "Enregistrer"}
      </button>
    </form>
  );
}
