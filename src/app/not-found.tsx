import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-neutral-950 text-neutral-100 p-6">
      <p className="text-xs uppercase tracking-widest text-amber-500 mb-3">
        404
      </p>
      <h1 className="text-4xl font-light mb-4">Page introuvable</h1>
      <p className="text-sm text-neutral-400 mb-8 text-center max-w-sm">
        Cette page n'existe pas ou a été déplacée.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-amber-500 text-neutral-950 font-medium px-6 py-2.5 text-sm hover:bg-amber-400 transition"
      >
        Retour à l'accueil
      </Link>
    </main>
  );
}
