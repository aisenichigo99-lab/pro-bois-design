"use client";

import { useCallback, useRef, useState } from "react";

export type UploadedImage = {
  url: string;
  public_id: string;
  width?: number;
  height?: number;
  alt?: string;
};

type ImageUploaderProps = {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  maxFiles?: number;
};

export function ImageUploader({
  images,
  onChange,
  maxFiles = 10,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      setError(null);
      const list = Array.from(files);

      if (images.length + list.length > maxFiles) {
        setError(`Maximum ${maxFiles} images.`);
        return;
      }

      setUploading(true);
      const uploaded: UploadedImage[] = [];

      for (const file of list) {
        const fd = new FormData();
        fd.append("file", file);

        try {
          const res = await fetch("/api/upload", {
            method: "POST",
            body: fd,
          });
          const data = await res.json();

          if (!res.ok) {
            setError(data.error || "Erreur d'upload");
            continue;
          }
          uploaded.push(data);
        } catch {
          setError("Erreur réseau pendant l'upload");
        }
      }

      setUploading(false);
      if (uploaded.length) {
        onChange([...images, ...uploaded]);
      }
    },
    [images, maxFiles, onChange],
  );

  async function handleRemove(public_id: string) {
    // Confirmation légère
    if (!confirm("Supprimer cette image ? Elle sera retirée de Cloudinary.")) {
      return;
    }

    // Suppression côté Cloudinary
    try {
      await fetch("/api/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public_id }),
      });
    } catch {
      // On supprime quand même côté UI
    }

    onChange(images.filter((i) => i.public_id !== public_id));
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) uploadFiles(e.target.files);
    e.target.value = ""; // reset pour pouvoir réuploader le même fichier
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files);
  }

  return (
    <div className="space-y-4">
      {/* Zone de drop */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={[
          "rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition",
          dragOver
            ? "border-amber-500 bg-amber-500/10"
            : "border-neutral-800 bg-neutral-900/30 hover:border-neutral-700",
          uploading && "opacity-60 pointer-events-none",
        ].join(" ")}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          className="hidden"
          onChange={onInputChange}
        />
        <div className="text-3xl mb-2">🖼️</div>
        <p className="text-sm text-neutral-300">
          {uploading
            ? "Upload en cours…"
            : "Glissez vos images ici ou cliquez pour choisir"}
        </p>
        <p className="text-xs text-neutral-500 mt-1">
          JPG, PNG, WebP, AVIF — max 10 MB — {images.length}/{maxFiles}
        </p>
      </div>

      {error && (
        <div className="text-sm text-red-400 bg-red-950/30 border border-red-900/50 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {/* Grille previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((img, idx) => (
            <div
              key={img.public_id}
              className="group relative aspect-square rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.alt || `Image ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              {idx === 0 && (
                <span className="absolute top-2 left-2 text-[10px] uppercase tracking-wider bg-amber-500 text-neutral-950 px-2 py-0.5 rounded-full font-semibold">
                  Couverture
                </span>
              )}
              <button
                type="button"
                onClick={() => handleRemove(img.public_id)}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-neutral-950/80 text-neutral-300 hover:bg-red-600 hover:text-white transition flex items-center justify-center text-xs"
                aria-label="Supprimer"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
