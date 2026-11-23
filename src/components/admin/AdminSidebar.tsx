"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { logout } from "@/app/(admin)/admin/actions";

const items = [
  { href: "/admin", label: "Tableau de bord", icon: "📊" },
  { href: "/admin/realisations", label: "Réalisations", icon: "🖼️" },
  { href: "/admin/medias", label: "Médias", icon: "📁" },
  { href: "/admin/journal", label: "Journal", icon: "📝" },
  { href: "/admin/parametres", label: "Paramètres", icon: "⚙️" },
];

export function AdminSidebar({
  email,
  open,
  onClose,
}: {
  email: string;
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  // Ferme le drawer au changement de route (mobile)
  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Ferme au clavier (Esc)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) {
      window.addEventListener("keydown", onKey);
      // Bloque le scroll body quand le drawer est ouvert
      document.body.style.overflow = "hidden";
      return () => {
        window.removeEventListener("keydown", onKey);
        document.body.style.overflow = "";
      };
    }
  }, [open, onClose]);

  return (
    <>
      {/* Overlay mobile */}
      <div
        onClick={onClose}
        className={`md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={[
          "z-50 flex flex-col bg-neutral-950 border-neutral-800",
          // Mobile : drawer
          "fixed inset-y-0 left-0 w-64 border-r p-4 transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full",
          // Desktop : statique, toujours visible
          "md:static md:translate-x-0 md:w-60 md:min-h-screen md:shrink-0",
        ].join(" ")}
        aria-label="Navigation admin"
      >
        {/* Header sidebar : logo + bouton fermer (mobile) */}
        <div className="mb-8 px-2 flex items-start justify-between">
          <div>
            <Link href="/admin" className="text-lg font-light tracking-wide">
              Pro <span className="text-amber-500 font-semibold">Bois</span>{" "}
              Design
            </Link>
            <p className="text-[10px] uppercase tracking-widest text-neutral-600 mt-1">
              Admin
            </p>
          </div>
          <button
            onClick={onClose}
            className="md:hidden text-neutral-400 hover:text-neutral-100 text-xl leading-none p-1"
            aria-label="Fermer le menu"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto">
          {items.map((it) => {
            const active =
              it.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(it.href);
            return (
              <Link
                key={it.href}
                href={it.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                  active
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                    : "text-neutral-400 hover:bg-neutral-900 hover:text-neutral-100"
                }`}
              >
                <span>{it.icon}</span>
                <span>{it.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-neutral-800 pt-4 mt-4">
          <p className="text-xs text-neutral-500 truncate mb-2 px-2">{email}</p>
          <form action={logout}>
            <button
              type="submit"
              className="w-full text-left text-xs px-3 py-2 rounded-lg text-neutral-400 hover:bg-red-950/40 hover:text-red-400 transition"
            >
              Se déconnecter
            </button>
          </form>
          <Link
            href="/"
            target="_blank"
            className="block text-xs px-3 py-2 rounded-lg text-neutral-500 hover:text-amber-400 transition mt-1"
          >
            ↗ Voir le site
          </Link>
        </div>
      </aside>
    </>
  );
}
