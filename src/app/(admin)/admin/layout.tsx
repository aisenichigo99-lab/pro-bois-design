import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  // Le layout ne fait rien de spécial pour l'instant,
  // il sera enrichi en Brick #5 (sidebar, navigation…)
  return <>{children}</>;
}
