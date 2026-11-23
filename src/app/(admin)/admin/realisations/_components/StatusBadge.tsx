export function StatusBadge({ statut }: { statut: string }) {
  const map: Record<string, { label: string; className: string }> = {
    brouillon: {
      label: "Brouillon",
      className: "bg-neutral-800 text-neutral-300",
    },
    publie: {
      label: "Publié",
      className:
        "bg-emerald-900/40 text-emerald-400 border border-emerald-800/60",
    },
    archive: {
      label: "Archivé",
      className: "bg-neutral-900 text-neutral-500 border border-neutral-800",
    },
  };
  const s = map[statut] ?? map.brouillon;
  return (
    <span
      className={`inline-block text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-full ${s.className}`}
    >
      {s.label}
    </span>
  );
}
