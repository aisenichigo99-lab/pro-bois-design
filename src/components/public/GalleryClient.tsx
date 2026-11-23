"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { PublicRealisation } from "@/lib/db/public";

type Props = {
  items: PublicRealisation[];
  categories: { slug: string; nom: string }[];
  tags: { slug: string; nom: string; type: string }[];
};

type State = {
  cat: string;
  essence: string;
  sort: "featured" | "recent" | "oldest" | "az";
  search: string;
};

const INITIAL: State = {
  cat: "all",
  essence: "all",
  sort: "featured",
  search: "",
};

export function GalleryClient({ items, categories, tags }: Props) {
  const essences = tags.filter((t) => t.type === "essence");

  const [state, setState] = useState<State>(INITIAL);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [modal, setModal] = useState<PublicRealisation | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Lire l'URL au mount (filtres partageables)
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setState({
      cat: p.get("cat") || "all",
      essence: p.get("bois") || "all",
      sort: (p.get("sort") as State["sort"]) || "featured",
      search: p.get("q") || "",
    });
    try {
      const raw = localStorage.getItem("pbd_favs");
      if (raw) setFavorites(JSON.parse(raw));
    } catch {}
  }, []);

  // Sync URL
  useEffect(() => {
    const p = new URLSearchParams();
    if (state.cat !== "all") p.set("cat", state.cat);
    if (state.essence !== "all") p.set("bois", state.essence);
    if (state.sort !== "featured") p.set("sort", state.sort);
    if (state.search.trim()) p.set("q", state.search.trim());
    const qs = p.toString();
    window.history.replaceState(
      {},
      "",
      qs ? `?${qs}` : window.location.pathname,
    );
  }, [state]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }

  function toggleFav(id: string) {
    setFavorites((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      try {
        localStorage.setItem("pbd_favs", JSON.stringify(next));
      } catch {}
      showToast(
        prev.includes(id) ? "Retiré des favoris" : "Ajouté aux favoris ♥",
      );
      return next;
    });
  }

  const filtered = useMemo(() => {
    let list = items.slice();
    if (state.cat !== "all")
      list = list.filter((r) => r.categorie?.slug === state.cat);
    if (state.essence !== "all")
      list = list.filter((r) => r.essences.includes(state.essence));
    if (state.search.trim()) {
      const q = state.search.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.titre.toLowerCase().includes(q) ||
          (r.description_courte || "").toLowerCase().includes(q) ||
          (r.lieu || "").toLowerCase().includes(q) ||
          (r.categorie?.nom || "").toLowerCase().includes(q),
      );
    }
    switch (state.sort) {
      case "recent":
        list.sort((a, b) =>
          (b.published_at ?? "").localeCompare(a.published_at ?? ""),
        );
        break;
      case "oldest":
        list.sort((a, b) =>
          (a.published_at ?? "").localeCompare(b.published_at ?? ""),
        );
        break;
      case "az":
        list.sort((a, b) => a.titre.localeCompare(b.titre));
        break;
      default:
        list.sort((a, b) => {
          if (a.a_la_une && !b.a_la_une) return -1;
          if (!a.a_la_une && b.a_la_une) return 1;
          return (b.published_at ?? "").localeCompare(a.published_at ?? "");
        });
    }
    return list;
  }, [items, state]);

  const total = items.length;

  return (
    <>
      <section className="pbd-page-hero">
        <p className="pbd-k">Portfolio</p>
        <h1>
          Nos <em>réalisations</em>
        </h1>
        <p className="pbd-lead">
          Chaque pièce raconte une histoire : celle d'une essence choisie, d'un
          geste précis, d'un espace transformé.
        </p>
        <div className="pbd-counter">
          <strong>{total}</strong>
          <span>pièces uniques façonnées à l'atelier</span>
        </div>
      </section>

      <div className="pbd-filters-wrap">
        <div className="pbd-filters-inner">
          <div className="pbd-search">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              type="search"
              placeholder="Rechercher (titre, lieu…)"
              value={state.search}
              onChange={(e) => setState({ ...state, search: e.target.value })}
            />
          </div>
          <div className="pbd-chips">
            <button
              className={`pbd-chip ${state.cat === "all" ? "active" : ""}`}
              onClick={() => setState({ ...state, cat: "all" })}
            >
              Tout
            </button>
            {categories.map((c) => (
              <button
                key={c.slug}
                className={`pbd-chip ${state.cat === c.slug ? "active" : ""}`}
                onClick={() => setState({ ...state, cat: c.slug })}
              >
                {c.nom}
              </button>
            ))}
          </div>
          <div className="pbd-select-wrap">
            <select
              value={state.essence}
              onChange={(e) => setState({ ...state, essence: e.target.value })}
            >
              <option value="all">Toutes essences</option>
              {essences.map((e) => (
                <option key={e.slug} value={e.slug}>
                  {e.nom}
                </option>
              ))}
            </select>
          </div>
          <div className="pbd-select-wrap">
            <select
              value={state.sort}
              onChange={(e) =>
                setState({ ...state, sort: e.target.value as State["sort"] })
              }
            >
              <option value="featured">À la une</option>
              <option value="recent">Plus récentes</option>
              <option value="oldest">Plus anciennes</option>
              <option value="az">A → Z</option>
            </select>
          </div>
          <button className="pbd-reset" onClick={() => setState(INITIAL)}>
            Réinitialiser
          </button>
        </div>
      </div>

      <section className="pbd-gallery-wrap">
        <div className="pbd-gallery-head">
          <h2>Toutes les réalisations</h2>
          <span className="pbd-result-count">
            <b>{filtered.length}</b> résultat(s)
          </span>
        </div>
        <div className="pbd-gallery">
          {filtered.length === 0 ? (
            <div className="pbd-empty">
              <h3>Aucune réalisation ne correspond</h3>
              <p>
                Essayez d'élargir vos critères ou de réinitialiser les filtres.
              </p>
            </div>
          ) : (
            filtered.map((r) => {
              const isFav = favorites.includes(r.id);
              return (
                <article
                  key={r.id}
                  className="pbd-card"
                  onClick={() => setModal(r)}
                >
                  <div className="pbd-card-badges">
                    {r.categorie && (
                      <span className="pbd-badge">{r.categorie.nom}</span>
                    )}
                    {r.a_la_une && (
                      <span className="pbd-badge featured">★ À la une</span>
                    )}
                  </div>
                  <button
                    className={`pbd-card-fav ${isFav ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFav(r.id);
                    }}
                    aria-label="Favori"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill={isFav ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </button>
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
                </article>
              );
            })
          )}
        </div>
      </section>

      {modal && (
        <div
          className="pbd-modal"
          onClick={(e) => e.target === e.currentTarget && setModal(null)}
        >
          <div className="pbd-modal-inner">
            <button
              className="pbd-modal-close"
              onClick={() => setModal(null)}
              aria-label="Fermer"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
            {modal.cover && (
              <div className="pbd-modal-hero">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={modal.cover} alt={modal.titre} />
              </div>
            )}
            <div className="pbd-modal-body">
              {modal.categorie && (
                <p className="pbd-k">{modal.categorie.nom}</p>
              )}
              <h2>{modal.titre}</h2>
              <p className="pbd-desc">{modal.description_courte}</p>
              <div className="pbd-specs">
                {modal.lieu && (
                  <div>
                    <div className="pbd-spec-label">Lieu</div>
                    <div className="pbd-spec-value">{modal.lieu}</div>
                  </div>
                )}
                {modal.annee && (
                  <div>
                    <div className="pbd-spec-label">Année</div>
                    <div className="pbd-spec-value">{modal.annee}</div>
                  </div>
                )}
                {modal.essences.length > 0 && (
                  <div>
                    <div className="pbd-spec-label">Essence</div>
                    <div className="pbd-spec-value">
                      {modal.essences
                        .map((s) => tags.find((t) => t.slug === s)?.nom)
                        .filter(Boolean)
                        .join(", ")}
                    </div>
                  </div>
                )}
              </div>
              <div className="pbd-modal-actions">
                <Link href={`/realisations/${modal.slug}`} className="pbd-btn">
                  Voir la fiche complète
                </Link>
                <a
                  href="mailto:contact@probois-design.com"
                  className="pbd-btn ghost"
                >
                  Demander un devis
                </a>
              </div>
              {modal.photos.length > 1 && (
                <div className="pbd-modal-gallery">
                  {modal.photos.map((p, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={p.url}
                      alt={p.alt || modal.titre}
                      loading="lazy"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className={`pbd-toast ${toast ? "show" : ""}`}>{toast}</div>
    </>
  );
}
