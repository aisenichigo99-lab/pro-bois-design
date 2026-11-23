"use client";

import type { ReactNode } from "react";
import { AdminSidebar } from "./AdminSidebar";

export function AdminShell({
  email,
  children,
}: {
  email: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-neutral-950 text-neutral-100">
      <AdminSidebar email={email} />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
