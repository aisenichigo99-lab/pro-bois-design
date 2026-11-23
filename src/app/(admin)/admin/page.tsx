import Link from "next/link";
import { requireAdmin } from "@/lib/supabase/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  getGlobalStats,
  getTopRealisations,
  getRecentAudit,
} from "@/lib/db/admin";

export const metadata = { title: "Tableau de bord — Admin" };

export default async function AdminDashboard() {
  const user = await requireAdmin();
  const [stats, top, recent] = await Promise.all([
    getGlobalStats(),
    getTopRealisations(5),
    getRecentAudit(8),
  ]);

  return (
    <AdminShell email={user.email ?? ""}>
      <main className="p-6 md:p-10">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8">
            <p className="text-xs uppercase tracking-widest text-amber-500 mb-2">
              Administration
            </p>
            <h1 className="text-3xl font-light">Tableau de bord</h1>
            <p className="text-sm text-neutral-500 mt-1">
              Bienvenue, {user.email}
            </p>
          </header>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <StatCard label="Total" value={stats.total} />
            <StatCard
              label="Publiées"
              value={stats.published}
              color="emerald"
            />
            <StatCard label="Brouillons" value={stats.drafts} color="amber" />
            <StatCard label="Archivées" value={stats.archived} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6">
              <h2 className="text-sm uppercase tracking-wider text-neutral-400 mb-4">
                Top 5 réalisations (vues)
              </h2>
              {top.length === 0 ? (
                <p className="text-sm text-neutral-500">
                  Aucune donnée pour l'instant.
                </p>
              ) : (
                <ol className="space-y-3">
                  {top.map((r, i) => (
                    <li key={r.id} className="flex items-center gap-3 text-sm">
                      <span className="text-neutral-600 w-5">{i + 1}.</span>
                      <Link
                        href={`/admin/realisations/${r.id}`}
                        className="flex-1 truncate hover:text-amber-400"
                      >
                        {r.titre}
                      </Link>
                      <span className="text-xs text-neutral-500 whitespace-nowrap">
                        {r.vues} vue(s) · {r.clics_devis} devis
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </section>

            <section className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm uppercase tracking-wider text-neutral-400">
                  Activité récente
                </h2>
                <Link
                  href="/admin/journal"
                  className="text-xs text-amber-500 hover:underline"
                >
                  Tout voir →
                </Link>
              </div>
              {recent.length === 0 ? (
                <p className="text-sm text-neutral-500">Aucune activité.</p>
              ) : (
                <ul className="space-y-2">
                  {recent.map((log) => (
                    <li key={log.id} className="text-xs text-neutral-400">
                      <span className="text-neutral-500">
                        {new Date(log.created_at).toLocaleString("fr-FR")}
                      </span>{" "}
                      —{" "}
                      <span className="text-neutral-300">{log.user_email}</span>{" "}
                      a <span className="text-amber-400">{log.action}</span>{" "}
                      {log.entity}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <div className="mt-10 flex gap-3 flex-wrap">
            <Link
              href="/admin/realisations/nouvelle"
              className="rounded-lg bg-amber-500 text-neutral-950 font-medium px-5 py-2.5 text-sm hover:bg-amber-400 transition"
            >
              + Nouvelle réalisation
            </Link>
            <Link
              href="/admin/realisations"
              className="rounded-lg border border-neutral-700 px-5 py-2.5 text-sm hover:bg-neutral-900 transition"
            >
              Gérer les réalisations
            </Link>
          </div>
        </div>
      </main>
    </AdminShell>
  );
}

function StatCard({
  label,
  value,
  color = "neutral",
}: {
  label: string;
  value: number;
  color?: "neutral" | "emerald" | "amber";
}) {
  const colors = {
    neutral: "text-neutral-100",
    emerald: "text-emerald-400",
    amber: "text-amber-400",
  };
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5">
      <p className="text-xs uppercase tracking-wider text-neutral-500 mb-1">
        {label}
      </p>
      <p className={`text-3xl font-light ${colors[color]}`}>{value}</p>
    </div>
  );
}
