"use client";

import { useState } from "react";
import { login } from "../actions";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await login(formData);
    // Si login réussit, redirect() a été lancé → on n'arrive pas ici.
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <form
      action={handleSubmit}
      className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 backdrop-blur"
    >
      <div>
        <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-2">
          Email
        </label>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-4 py-3 text-sm outline-none focus:border-amber-500 transition"
          placeholder="admin@probois-design.com"
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-2">
          Mot de passe
        </label>
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-4 py-3 text-sm outline-none focus:border-amber-500 transition"
          placeholder="••••••••"
        />
      </div>

      {error && (
        <div className="text-sm text-red-400 bg-red-950/30 border border-red-900/50 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-amber-500 text-neutral-950 font-medium py-3 text-sm hover:bg-amber-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
