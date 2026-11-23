import { NextRequest, NextResponse } from "next/server";
import { uploadToCloudinary, cloudinary } from "@/lib/cloudinary";
import { getUser } from "@/lib/supabase/auth";

// Limite raisonnable (Next.js body limit par défaut = 4 MB, à augmenter)
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

/**
 * POST /api/upload
 * Reçoit un fichier via FormData (champ "file").
 * Retourne { url, public_id, width, height }.
 * Protégé : admin uniquement.
 */
export async function POST(req: NextRequest) {
  // 🔒 Vérifie que l'utilisateur est admin
  const user = await getUser();
  const role = (user?.user_metadata as { role?: string } | null)?.role;
  if (!user || role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  // Lecture du fichier
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "Aucun fichier" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Format non supporté (JPG, PNG, WebP, AVIF)" },
      { status: 400 },
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "Fichier trop volumineux (max 10 MB)" },
      { status: 400 },
    );
  }

  // Upload vers Cloudinary
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadToCloudinary(buffer);

    return NextResponse.json({
      url: result.url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return NextResponse.json(
      { error: "Échec de l'upload vers Cloudinary" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/upload
 * Body JSON : { public_id: string }
 * Supprime l'image de Cloudinary.
 * Protégé : admin uniquement.
 */
export async function DELETE(req: NextRequest) {
  const user = await getUser();
  const role = (user?.user_metadata as { role?: string } | null)?.role;
  if (!user || role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  let body: { public_id?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  if (!body.public_id) {
    return NextResponse.json({ error: "public_id requis" }, { status: 400 });
  }

  try {
    await cloudinary.uploader.destroy(body.public_id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return NextResponse.json(
      { error: "Échec de la suppression" },
      { status: 500 },
    );
  }
}

// ⚠️ Nécessaire pour recevoir des fichiers jusqu'à 10 MB
export const maxDuration = 60;
