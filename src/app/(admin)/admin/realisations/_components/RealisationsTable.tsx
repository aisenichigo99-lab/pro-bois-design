"use client";

import Link from "next/link";
import { useTransition } from "react";
import { StatusBadge } from "./StatusBadge";
import {
  deleteRealisation,
  toggleStatut,
  toggleFeatured,
  duplicateRealisation,
} from "../actions";

type Item = {
  id: string;
  slug: string;
  titre: string;
  statut: string;
  annee: number | null;
  lieu: string | null;
  a_la_une: boolean;
  updated_at: string;
  categorie: { slug: string; nom: string; couleur: string } | null;
  photos: { url: string; is_cover: boolean }[];
};

export function RealisationsTable({ items }: { items: Item[] }) {
  const [pending, start] = useTransition();

  function run(fn: () => Promise<unknown>) {
    start(() => {
      fn();
    });
  }

  if (!items.length) {
    return (
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-12 text-center text-neutral-500">
        Aucune réalisation. Crée la première !
      </div>
    );
  }

  return (
    <div
      className={`overflow-x-auto rounded-2xl border border-neutral-800 ${pending ? "opacity-60 pointer-events-none" : ""}`}
    >
      <table className="w-full text-sm">
        <thead className="bg-neutral-900/60 text-neutral-400 text-left">
          <tr>
            <th className="px-4 py-3 font-medium">Réalisation</th>
            <th className="px-4 py-3 font-medium">Statut</th>
            <th className="px-4 py-3 font-medium">Catégorie</th>
            <th className="px-4 py-3 font-medium text-center">À la une</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((r) => {
            const cover = r.photos.find((p) => p.is_cover) || r.photos[0];
            return (
              <tr
                key={r.id}
                className="border-t border-neutral-800/60 hover:bg-neutral-900/30"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={cover.url.replace(
                          "/upload/",
                          "/upload/w_120,h_120,c_fill/",
                        )}
                        alt=""
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-600">
                        —
                      </div>
                    )}
                    <div>
                      <Link
                        href={`/admin/realisations/${r.id}`}
                        className="font-medium hover:text-amber-400 transition"
                      >
                        {r.titre}
                      </Link>
                      <div className="text-xs text-neutral-500">
                        {r.annee ?? "—"} · {r.lieu ?? "—"}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge statut={r.statut} />
                </td>
                <td className="px-4 py-3 text-neutral-400">
                  {r.categorie?.nom ?? "—"}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => run(() => toggleFeatured(r.id, r.a_la_une))}
                    className={`text-lg transition ${r.a_la_une ? "text-amber-400" : "text-neutral-700 hover:text-neutral-500"}`}
                    title={r.a_la_une ? "Retirer de la une" : "Mettre à la une"}
                  >
                    ★
                  </button>
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <button
                    onClick={() => run(() => toggleStatut(r.id, r.statut))}
                    className="text-xs px-3 py-1.5 rounded-md border border-neutral-700 hover:bg-neutral-800 transition mr-2"
                  >
                    {r.statut === "publie" ? "Dépublier" : "Publier"}
                  </button>
                  <button
                    onClick={() => run(() => duplicateRealisation(r.id))}
                    className="text-xs px-3 py-1.5 rounded-md border border-neutral-700 hover:bg-neutral-800 transition mr-2"
                  >
                    Dupliquer
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Supprimer « ${r.titre} » ?`)) {
                        run(() => deleteRealisation(r.id));
                      }
                    }}
                    className="text-xs px-3 py-1.5 rounded-md border border-red-900/60 text-red-400 hover:bg-red-950/40 transition"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
