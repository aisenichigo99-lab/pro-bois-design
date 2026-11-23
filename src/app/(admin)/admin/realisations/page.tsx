import Link from "next/link";
import { requireAdmin } from "@/lib/supabase/auth";
import { listRealisations } from "@/lib/db/realisations";
import { RealisationsTable } from "./_components/RealisationsTable";
export const metadata = { title: "Réalisations — Admin" };

export default async function RealisationsListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; statut?: string }>;
}) {
  await requireAdmin();
  const { q, statut } = await searchParams;
  const items = await listRealisations({ search: q, statut });

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-amber-500 mb-2">
              Admin
            </p>
            <h1 className="text-3xl font-light">Réalisations</h1>
            <p className="text-sm text-neutral-500 mt-1">
              {items.length} réalisation{items.length > 1 ? "s" : ""}
            </p>
          </div>
          <Link
            href="/admin/realisations/nouvelle"
            className="rounded-lg bg-amber-500 text-neutral-950 font-medium px-5 py-2.5 text-sm hover:bg-amber-400 transition"
          >
            + Nouvelle réalisation
          </Link>
        </header>

        {/* Filtres */}
        <form
          className="flex flex-wrap gap-3 mb-6"
          action="/admin/realisations"
        >
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Rechercher par titre…"
            className="flex-1 min-w-[200px] rounded-lg bg-neutral-900 border border-neutral-800 px-4 py-2.5 text-sm outline-none focus:border-amber-500 transition"
          />
          <select
            name="statut"
            defaultValue={statut ?? "all"}
            className="rounded-lg bg-neutral-900 border border-neutral-800 px-4 py-2.5 text-sm outline-none focus:border-amber-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="brouillon">Brouillons</option>
            <option value="publie">Publiés</option>
            <option value="archive">Archivés</option>
          </select>
          <button className="rounded-lg border border-neutral-700 px-4 py-2.5 text-sm hover:bg-neutral-900 transition">
            Filtrer
          </button>
        </form>

        <RealisationsTable items={items} />
      </div>
    </main>
  );
}
