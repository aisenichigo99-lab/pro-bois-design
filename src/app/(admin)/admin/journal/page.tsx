import { requireAdmin } from "@/lib/supabase/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { createClient } from "@/lib/supabase/server";
export const metadata = { title: "Journal — Admin" };

export default async function JournalPage() {
  const user = await requireAdmin();
  const supabase = await createClient();
  const { data: logs } = await supabase
    .from("audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <AdminShell email={user.email ?? ""}>
      <main className="p-6 md:p-10">
        <div className="max-w-5xl mx-auto">
          <header className="mb-8">
            <p className="text-xs uppercase tracking-widest text-amber-500 mb-2">
              Admin
            </p>
            <h1 className="text-3xl font-light">Journal d'activité</h1>
            <p className="text-sm text-neutral-500 mt-1">
              100 dernières actions enregistrées
            </p>
          </header>

          <div className="overflow-x-auto rounded-2xl border border-neutral-800">
            <table className="w-full text-sm">
              <thead className="bg-neutral-900/60 text-neutral-400 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Utilisateur</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                  <th className="px-4 py-3 font-medium">Entité</th>
                </tr>
              </thead>
              <tbody>
                {(logs ?? []).map((log) => (
                  <tr key={log.id} className="border-t border-neutral-800/60">
                    <td className="px-4 py-3 text-neutral-400 text-xs whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString("fr-FR")}
                    </td>
                    <td className="px-4 py-3 text-neutral-300">
                      {log.user_email ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-amber-400 text-xs uppercase tracking-wider">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-400 text-xs">
                      {log.entity}
                    </td>
                  </tr>
                ))}
                {(!logs || logs.length === 0) && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-10 text-center text-neutral-500"
                    >
                      Aucune activité enregistrée.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </AdminShell>
  );
}
