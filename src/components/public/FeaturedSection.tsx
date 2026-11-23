import Link from "next/link";
import type { PublicRealisation } from "@/lib/db/public";

export function FeaturedSection({ items }: { items: PublicRealisation[] }) {
  if (!items.length) return null;

  return (
    <section className="pbd-featured">
      <div className="pbd-featured-head">
        <h2>
          <span className="pbd-star">★</span> À la <em>une</em>
        </h2>
        <Link href="/realisations" className="pbd-btn ghost">
          Toutes les réalisations
        </Link>
      </div>

      <div className="pbd-featured-grid">
        {items.map((r) => (
          <Link
            key={r.id}
            href={`/realisations/${r.slug}`}
            className="pbd-card"
          >
            <div className="pbd-card-badges">
              {r.categorie && (
                <span className="pbd-badge">{r.categorie.nom}</span>
              )}
              <span className="pbd-badge featured">★ À la une</span>
            </div>
            {r.cover && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={r.cover} alt={r.titre} loading="lazy" />
            )}
            <div className="pbd-card-info">
              <h3>{r.titre}</h3>
              <div className="pbd-meta">
                {[r.lieu, r.annee].filter(Boolean).join(" · ") || "—"}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
