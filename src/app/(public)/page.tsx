import "./home.css";
import { ThreeHero } from "@/components/public/ThreeHero";
import { FeaturedSection } from "@/components/public/FeaturedSection";
import {
  SavoirFaireSection,
  AtelierSection,
  ContactSection,
} from "@/components/public/HomeSections";
import {
  getFeaturedRealisations,
  getLatestRealisations,
} from "@/lib/db/public";

export default async function HomePage() {
  // Récupère les "à la une", sinon fallback sur les dernières publiées
  let featured = await getFeaturedRealisations(3);
  if (!featured.length) {
    featured = await getLatestRealisations(3);
  }

  return (
    <main className="pbd-home">
      <ThreeHero />

      <section className="pbd-hero">
        <div className="pbd-hero-inner">
          <p className="pbd-k">Menuiserie sur mesure</p>
          <h1>
            Le bois, <em>sculpté</em>
            <br />
            avec passion.
          </h1>
          <p className="pbd-lead">
            Cuisines, escaliers, dressings et mobilier d'exception : chaque
            pièce est dessinée, taillée et assemblée à la main dans notre
            atelier.
          </p>
          <div className="pbd-hero-cta">
            <Link href="/realisations" className="pbd-btn">
              Voir les réalisations
            </Link>
            <a
              href="mailto:contact@probois-design.com"
              className="pbd-btn ghost"
            >
              Demander un devis
            </a>
          </div>
        </div>
        <p className="pbd-hero-scroll">↓ FAITES DÉFILER</p>
      </section>

      <FeaturedSection items={featured} />

      <SavoirFaireSection />
      <AtelierSection />
      <ContactSection />
    </main>
  );
}

import Link from "next/link";
