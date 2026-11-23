"use client";

import { useTrack } from "@/lib/useTrack";

export function TrackView({ realisationId }: { realisationId: string }) {
  useTrack(realisationId, "view");
  return null;
}
