import { createClient } from "./server";
import { redirect } from "next/navigation";

/**
 * Récupère l'utilisateur connecté (ou null).
 * Utilisable dans les Server Components et Server Actions.
 */
export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;
  return user;
}

/**
 * Vérifie que l'utilisateur est connecté ET admin.
 * Redirige vers /admin/login sinon.
 * À appeler en haut de chaque page/action admin.
 */
export async function requireAdmin() {
  const user = await getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const role = (user.user_metadata as { role?: string } | null)?.role;
  if (role !== "admin") {
    // Connecté mais pas admin → on déconnecte et redirige
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/admin/login?error=not_admin");
  }

  return user;
}
