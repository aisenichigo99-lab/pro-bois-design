import { listPublishedRealisations, getFilterOptions } from "@/lib/db/public";
import { GalleryClient } from "@/components/public/GalleryClient";

export const metadata = {
  title: "Réalisations",
  description:
    "Découvrez nos réalisations en menuiserie d'art : cuisines, escaliers, dressings et mobilier sur mesure.",
};

export default async function RealisationsPage() {
  const [items, options] = await Promise.all([
    listPublishedRealisations(),
    getFilterOptions(),
  ]);

  return (
    <main>
      <GalleryClient
        items={items}
        categories={options.categories}
        tags={options.tags}
      />
    </main>
  );
}
