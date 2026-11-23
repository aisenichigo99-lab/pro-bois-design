import type { ReactNode } from "react";
import { getUser } from "@/lib/supabase/auth";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-neutral-950 text-neutral-100">
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
