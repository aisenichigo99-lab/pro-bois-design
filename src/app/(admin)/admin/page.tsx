import { requireAdmin } from "@/lib/supabase/auth";
import { logout } from "./actions";

export const metadata = { title: "Dashboard — Admin Pro Bois Design" };

export default async function AdminDashboard() {
  const user = await requireAdmin();

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-start justify-between mb-12 flex-wrap gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-amber-500 mb-2">
              Administration
            </p>
            <h1 className="text-3xl font-light">
              Bienvenue, <span className="text-amber-500">{user.email}</span>
            </h1>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-lg border border-neutral-800 px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-900 hover:text-red-400 hover:border-red-900/50 transition"
            >
              Se déconnecter
            </button>
          </form>
        </header>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-8">
          <h2 className="text-lg font-medium mb-3">🧱 Brick #3 validée</h2>
          <p className="text-sm text-neutral-400 leading-relaxed">
            L'authentification et la protection des routes sont en place.
            <br />
            Les prochaines briques vont construire le dashboard :
          </p>
          <ul className="mt-6 space-y-2 text-sm text-neutral-400">
            <li>⬜ Brick #4 — Upload images Cloudinary</li>
            <li>⬜ Brick #5 — CRUD réalisations (liste + formulaire)</li>
            <li>⬜ Brick #6 — Galerie publique</li>
            <li>⬜ Brick #7 — Page détail + SEO</li>
            <li>⬜ Brick #8 — À la une + analytics</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
