import { LoginForm } from "./LoginForm";
import { getUser } from "@/lib/supabase/auth";
import { redirect } from "next/navigation";

export const metadata = { title: "Connexion — Admin Pro Bois Design" };

export default async function LoginPage() {
  // Si déjà connecté en admin → redirige vers le dashboard
  const user = await getUser();
  if (user && (user.user_metadata as { role?: string })?.role === "admin") {
    redirect("/admin");
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-neutral-950 text-neutral-100">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-light tracking-wide">
            Pro <span className="text-amber-500 font-semibold">Bois</span>{" "}
            Design
          </h1>
          <p className="text-sm text-neutral-500 mt-2">Espace administration</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
