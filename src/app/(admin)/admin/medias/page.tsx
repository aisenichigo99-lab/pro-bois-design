import { requireAdmin } from "@/lib/supabase/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { MediasClient } from "./MediasClient";

export const metadata = { title: "Médias — Admin" };

export default async function MediasPage() {
  const user = await requireAdmin();
  return (
    <AdminShell email={user.email ?? ""}>
      <MediasClient />
    </AdminShell>
  );
}
