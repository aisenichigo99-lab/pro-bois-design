"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/auth";
import { revalidatePath } from "next/cache";

export async function saveSettings(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const site = {
    nom: String(formData.get("site_nom") || ""),
    email: String(formData.get("site_email") || ""),
  };
  const seo = {
    title: String(formData.get("seo_title") || ""),
    description: String(formData.get("seo_description") || ""),
  };

  await supabase.from("settings").upsert([
    { key: "site", value: site },
    { key: "seo_default", value: seo },
  ]);

  revalidatePath("/admin/parametres");
  return { ok: true };
}
