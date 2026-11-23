import { requireAdmin } from "@/lib/supabase/auth";
import { getCategoriesForForm, getTagsForForm } from "@/lib/db/realisations";
import { RealisationForm } from "../_components/RealisationForm";
import { createRealisation } from "../actions";

export const metadata = { title: "Nouvelle réalisation — Admin" };

export default async function NouvelleRealisationPage() {
  await requireAdmin();
  const [categories, tags] = await Promise.all([
    getCategoriesForForm(),
    getTagsForForm(),
  ]);

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <p className="text-xs uppercase tracking-widest text-amber-500 mb-2">
            Admin
          </p>
          <h1 className="text-3xl font-light">Nouvelle réalisation</h1>
        </header>
        <RealisationForm
          categories={categories}
          tags={tags}
          action={createRealisation}
          submitLabel="Créer la réalisation"
        />
      </div>
    </main>
  );
}
