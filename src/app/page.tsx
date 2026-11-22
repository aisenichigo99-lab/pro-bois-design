import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";

async function ConnectionStatus() {
  const supabase = await createClient();

  const { data: categories, error } = await supabase
    .from("categories")
    .select("nom, slug");

  return (
    <>
      {/* Test Supabase */}
      <div className="rounded-xl border border-neutral-800 p-6 text-left space-y-3">
        <div className="flex items-center gap-2">
          <span className={error ? "text-red-400" : "text-emerald-400"}>
            {error ? "❌" : "✅"}
          </span>
          <span className="font-medium">Supabase</span>
        </div>

        {error ? (
          <p className="text-red-400 text-sm">Erreur : {error.message}</p>
        ) : (
          <p className="text-emerald-400 text-sm">
            Connecté — {categories?.length ?? 0} catégorie(s) trouvée(s)
          </p>
        )}
      </div>
    </>
  );
}

export default function Home() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-8 bg-neutral-950 text-neutral-100">
      <div className="text-center max-w-lg w-full">
        <h1 className="text-3xl font-light mb-2">🧱 Brick #1 — Fondations</h1>

        <p className="text-neutral-400 text-sm mb-8">
          Vérification des connexions
        </p>

        <Suspense
          fallback={
            <div className="rounded-xl border border-neutral-800 p-6">
              <p className="text-yellow-400">⏳ Connexion à Supabase...</p>
            </div>
          }
        >
          <ConnectionStatus />
        </Suspense>

        {/* Test Cloudinary */}
        <div className="rounded-xl border border-neutral-800 p-6 text-left mt-4">
          <div className="flex items-center gap-2">
            <span className={cloudName ? "text-emerald-400" : "text-red-400"}>
              {cloudName ? "✅" : "❌"}
            </span>

            <span className="font-medium">Cloudinary</span>
          </div>

          <p className="text-sm text-neutral-400 mt-1">
            {cloudName
              ? `Cloud : ${cloudName}`
              : "Clé manquante dans .env.local"}
          </p>
        </div>
      </div>
    </main>
  );
}
