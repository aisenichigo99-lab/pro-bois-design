import { redirect } from "next/navigation";

export default function HomePage() {
  // Pour l'instant, la home redirige vers la galerie.
  // À remplacer en Brick #8 par la vraie home avec Three.js.
  redirect("/realisations");
}
