"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/(admin)/admin/actions";

const items = [
  { href: "/admin", label: "Tableau de bord", icon: "📊" },
  { href: "/admin/realisations", label: "Réalisations", icon: "🖼️" },
  { href: "/admin/medias", label: "Médias", icon: "📁" },
  { href: "/admin/journal", label: "Journal", icon: "📝" },
  { href: "/admin/parametres", label: "Paramètres", icon: "⚙️" },
];

export function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 border-r border-neutral-800 bg-neutral-950 min-h-screen p-4 flex flex-col">
      <div className="mb-8 px-2">
        <Link href="/admin" className="text-lg font-light tracking-wide">
          Pro <span className="text-amber-500 font-semibold">Bois</span> Design
        </Link>
        <p className="text-[10px] uppercase tracking-widest text-neutral-600 mt-1">
          Admin
        </p>
      </div>

      <nav className="flex-1 space-y-1">
        {items.map((it) => {
          const active =
            it.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
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
  );
}
