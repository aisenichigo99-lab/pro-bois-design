import { connection } from "next/server";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  getRealisation,
  getCategoriesForForm,
  getTagsForForm,
} from "@/lib/db/realisations";
import { RealisationForm } from "../_components/RealisationForm";
import { updateRealisation } from "../actions";

export const metadata = {
  title: "Éditer une réalisation — Admin",
};

export default async function EditRealisationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string }>;
}) {
  // Authentification obligatoire
  await requireAdmin();

  // Force le rendu à la demande
  await connection();

  const { id } = await params;
  const { ok } = await searchParams;

  const [r, categories, tags] = await Promise.all([
    getRealisation(id).catch(() => null),
    getCategoriesForForm(),
    getTagsForForm(),
  ]);

  if (!r) notFound();

  const initialPhotos = (r.photos ?? []).map(
    (p: (typeof r.photos)[number]) => ({
      url: p.url,
      public_id: p.public_id!,
      width: p.width ?? undefined,
      height: p.height ?? undefined,
      alt: p.alt ?? undefined,
    }),
  );

  const initialTags = (r.tags ?? [])
    .map((t: (typeof r.tags)[number]) => t.tag?.id)
    .filter((x: string | undefined): x is string => !!x);
  // Action wrapper : lie l'id
  const action = async (fd: FormData) => {
    "use server";
    return updateRealisation(id, fd);
  };
  const user = await requireAdmin();
  return (
    <AdminShell email={user.email ?? ""}>
      <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6 md:p-10">
        <div className="max-w-4xl mx-auto">
          <header className="mb-8">
            <p className="text-xs uppercase tracking-widest text-amber-500 mb-2">
              Admin
            </p>

            <h1 className="text-3xl font-light">Éditer : {r.titre}</h1>

            {ok && (
              <p className="text-sm text-emerald-400 mt-2">
                ✅ Modifications enregistrées
              </p>
            )}
          </header>

          <RealisationForm
            categories={categories}
            tags={tags}
            initial={{
              id: r.id,
              titre: r.titre,
              slug: r.slug,
              description_courte: r.description_courte ?? "",
              description_longue: r.description_longue ?? "",
              categorie_id: r.categorie_id ?? "",
              annee: r.annee,
              lieu: r.lieu ?? "",
              dimensions: r.dimensions ?? "",
              duree_realisation: r.duree_realisation ?? "",
              statut: r.statut,
              a_la_une: r.a_la_une,
              seo_title: r.seo_title ?? "",
              seo_description: r.seo_description ?? "",
              tags: initialTags,
              photos: initialPhotos,
            }}
            action={action}
            submitLabel="Enregistrer"
          />
        </div>
      </main>
    </AdminShell>
  );
}
