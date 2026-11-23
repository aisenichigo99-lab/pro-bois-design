"use client";

import { trackEvent } from "@/lib/useTrack";

export function QuoteButton({ realisationId }: { realisationId: string }) {
  return (
    <a
      href="mailto:contact@probois-design.com?subject=Demande%20de%20devis%20-%20Pro%20Bois%20Design"
      className="pbd-btn"
      onClick={() => trackEvent(realisationId, "quote_click")}
    >
      Demander un devis similaire
    </a>
  );
}
