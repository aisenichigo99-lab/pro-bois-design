"use client";

import { useState } from "react";
import {
  ImageUploader,
  type UploadedImage,
} from "@/components/admin/ImageUploader";

export function MediasClient() {
  const [images, setImages] = useState<UploadedImage[]>([]);

  return (
    <main className="p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <p className="text-xs uppercase tracking-widest text-amber-500 mb-2">
            Médiathèque
          </p>
          <h1 className="text-3xl font-light">Upload d'images</h1>
          <p className="text-sm text-neutral-400 mt-2">
            Glissez vos images ou cliquez pour uploader vers Cloudinary.
          </p>
        </header>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 mb-6">
          <ImageUploader images={images} onChange={setImages} maxFiles={10} />
        </div>

        {images.length > 0 && (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6">
            <h2 className="text-sm font-medium mb-3 text-neutral-300">
              Métadonnées renvoyées ({images.length})
            </h2>
            <pre className="text-xs bg-neutral-950 rounded-lg p-4 overflow-auto text-neutral-400">
              {JSON.stringify(images, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </main>
  );
}
