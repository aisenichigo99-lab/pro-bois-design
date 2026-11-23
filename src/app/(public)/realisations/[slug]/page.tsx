import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublishedBySlug } from "@/lib/db/public";
import { TrackView } from "@/components/public/TrackView";
import { QuoteButton } from "@/components/public/QuoteButton";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const r = await getPublishedBySlug(slug);
  if (!r) return { title: "Réalisation introuvable" };
  const cover =
    r.photos?.find((p: any) => p.is_cover)?.url ?? r.photos?.[0]?.url;
  return {
    title: r.seo_title || r.titre,
    description: r.seo_description || r.description_courte || undefined,
    openGraph: {
      title: r.seo_title || r.titre,
      description: r.seo_description || r.description_courte || undefined,
      images: cover ? [{ url: cover }] : [],
      type: "article",
    },
  };
}

export default async function RealisationDetailPage({ params }: Props) {
  const { slug } = await params;
  const r = await getPublishedBySlug(slug);
  if (!r) notFound();

  const photos = (r.photos ?? []).sort(
    (a: any, b: any) => (a.ordre ?? 0) - (b.ordre ?? 0),
  );
  const cover = photos.find((p: any) => p.is_cover)?.url ?? photos[0]?.url;

  return (
    <main>
      <TrackView realisationId={r.id} />
      <section className="pbd-detail-hero">
        <p className="pbd-k">
          <Link
            href="/realisations"
            style={{ color: "inherit", textDecoration: "none" }}
          >
            ← Réalisations
          </Link>
          {r.categorie ? ` / ${r.categorie.nom}` : ""}
        </p>
        <h1>{r.titre}</h1>
        <p className="pbd-detail-meta">
          {[r.lieu, r.annee, r.dimensions, r.duree_realisation]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </section>

      <section className="pbd-detail-content">
        {cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt={r.titre} className="pbd-detail-cover" />
        )}

        {r.description_longue && (
          <div className="pbd-detail-text">{r.description_longue}</div>
        )}

        {photos.length > 1 && (
          <div className="pbd-detail-gallery">
            {photos.map((p: any, i: number) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={p.url} alt={p.alt || r.titre} loading="lazy" />
            ))}
          </div>
        )}

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <QuoteButton realisationId={r.id} />
          <Link href="/realisations" className="pbd-btn ghost">
            ← Toutes les réalisations
          </Link>
        </div>
      </section>
    </main>
  );
}
