"use client";

import { useEffect, useRef } from "react";

/**
 * Envoie un événement de tracking au serveur (une seule fois par session).
 * @param realisationId UUID de la réalisation
 * @param event 'view' | 'quote_click' | 'share' | 'favorite'
 */
export function useTrack(
  realisationId: string | undefined,
  event: "view" | "quote_click" | "share" | "favorite" = "view",
) {
  const fired = useRef(false);

  useEffect(() => {
    if (!realisationId || fired.current) return;
    // Dédoublonne : n'envoie qu'une fois par session par réalisation
    const key = `pbd_tracked_${event}_${realisationId}`;
    if (sessionStorage.getItem(key)) return;

    fired.current = true;
    sessionStorage.setItem(key, "1");

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        realisation_id: realisationId,
        event_type: event,
      }),
    }).catch(() => {
      // silencieux : on ne casse jamais l'UX pour un event
    });
  }, [realisationId, event]);
}

/**
 * Envoie un événement à la volée (ex: clic sur "Demander un devis").
 */
export function trackEvent(
  realisationId: string,
  event: "view" | "quote_click" | "share" | "favorite",
) {
  fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ realisation_id: realisationId, event_type: event }),
  }).catch(() => {});
}
