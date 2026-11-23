import { requireAdmin } from "@/lib/supabase/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "./SettingsForm";

export const metadata = { title: "Paramètres — Admin" };

export default async function ParametresPage() {
  const user = await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase.from("settings").select("key, value");
  const settings: Record<string, Record<string, unknown>> = {};
  (data ?? []).forEach((s) => {
    settings[s.key] = s.value as Record<string, unknown>;
  });

  return (
    <AdminShell email={user.email ?? ""}>
      <main className="p-6 md:p-10">
        <div className="max-w-3xl mx-auto">
          <header className="mb-8">
            <p className="text-xs uppercase tracking-widest text-amber-500 mb-2">
              Admin
            </p>
            <h1 className="text-3xl font-light">Paramètres</h1>
            <p className="text-sm text-neutral-500 mt-1">
              Configuration globale du site
            </p>
          </header>
          <SettingsForm initial={settings} />
        </div>
      </main>
    </AdminShell>
  );
}
