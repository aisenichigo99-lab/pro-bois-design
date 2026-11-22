"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/**
 * Connexion admin.
 * Reçoit formData(email, password) et redirige vers /admin en cas de succès.
 * En cas d'erreur, renvoie { error: "..." } au composant client.
 */
export async function login(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Email et mot de passe requis." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return { error: "Identifiants invalides." };
  }

  // Vérifie que l'utilisateur a le rôle admin
  const role = (data.user.user_metadata as { role?: string } | null)?.role;
  if (role !== "admin") {
    await supabase.auth.signOut();
    return { error: "Ce compte n'a pas les droits admin." };
  }

  redirect("/admin");
}

/**
 * Déconnexion puis redirection vers le login.
 */
export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
