import type { ReactNode } from "react";
import "./public.css";
import { PublicHeader } from "@/components/public/PublicHeader";
export const metadata = {
  title: {
    default: "Pro Bois Design — Menuiserie d'art",
    template: "%s — Pro Bois Design",
  },
  description:
    "Menuiserie sur mesure : cuisines, escaliers, dressings et mobilier d'exception.",
};

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="pbd-public">
      <PublicHeader />
      {children}
      <footer className="pbd-footer">
        <span>© 2026 Pro Bois Design</span>
        <span>Menuiserie d'art &amp; agencement</span>
      </footer>
    </div>
  );
}
