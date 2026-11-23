"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { AdminSidebar } from "./AdminSidebar";

export function AdminShell({
  email,
  children,
}: {
  email: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 md:flex">
      <AdminSidebar email={email} open={open} onClose={() => setOpen(false)} />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Barre mobile : hamburger + titre compact */}
        <header className="md:hidden sticky top-0 z-30 flex items-center gap-3 px-4 py-3 bg-neutral-950/90 backdrop-blur border-b border-neutral-800">
          <button
            onClick={() => setOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-lg border border-neutral-800 text-neutral-300 hover:bg-neutral-900 transition"
            aria-label="Ouvrir le menu"
            aria-expanded={open}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
            >
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>
          <Link
            href="/admin"
            className="text-sm font-light tracking-wide truncate"
          >
            Pro <span className="text-amber-500 font-semibold">Bois</span>{" "}
            Design
            <span className="text-neutral-600 text-xs ml-2">Admin</span>
          </Link>
        </header>

        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
