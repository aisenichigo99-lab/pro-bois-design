import Link from "next/link";

export function SavoirFaireSection() {
  return (
    <section id="savoir" className="pbd-section pbd-right">
      <p className="pbd-k">Savoir-faire</p>
      <h2>L'art de l'assemblage</h2>
      <div className="pbd-grid-3">
        <div className="pbd-card-soft">
          <div className="pbd-n">01</div>
          <h3>Agencement</h3>
          <p>
            Cuisines, dressings et bibliothèques ajustés au millimètre à votre
            espace.
          </p>
        </div>
        <div className="pbd-card-soft">
          <div className="pbd-n">02</div>
          <h3>Escaliers</h3>
          <p>Limons, marches et garde-corps en chêne, hêtre ou noyer massif.</p>
        </div>
        <div className="pbd-card-soft">
          <div className="pbd-n">03</div>
          <h3>Mobilier</h3>
          <p>
            Tables, bureaux et pièces uniques, finitions huilées ou vernies.
          </p>
        </div>
      </div>
    </section>
  );
}

export function AtelierSection() {
  return (
    <section id="atelier" className="pbd-section pbd-right">
      <p className="pbd-k">L'atelier</p>
      <h2>Du croquis à la pose</h2>
      <p className="pbd-lead">
        Conception 3D, sélection des essences, taille, finition puis
        installation : un seul interlocuteur, du premier trait au dernier coup
        de ponçage.
      </p>
    </section>
  );
}

export function ContactSection() {
  return (
    <section id="contact" className="pbd-section">
      <p className="pbd-k">Contact</p>
      <h2>
        Parlons de
        <br />
        votre projet
      </h2>
      <p className="pbd-lead">
        Devis gratuit sous 48 h. Décrivez-nous votre envie, nous lui donnons
        forme.
      </p>
      <div style={{ marginTop: 34 }}>
        <a href="mailto:contact@probois-design.com" className="pbd-btn">
          contact@probois-design.com
        </a>
      </div>
    </section>
  );
}
