import Link from "next/link";

export function PublicHeader() {
  return (
    <header className="pbd-header">
      <Link href="/" className="pbd-logo">
        Pro&nbsp;<b>Bois</b>&nbsp;Design
      </Link>
      <nav className="pbd-nav">
        <Link href="/#savoir">Savoir-faire</Link>
        <Link href="/realisations" className="active">
          Réalisations
        </Link>
        <Link href="/#atelier">Atelier</Link>
        <Link href="/#contact">Contact</Link>
      </nav>
    </header>
  );
}
