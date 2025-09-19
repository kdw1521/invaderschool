import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createReadonlyClient } from "@/lib/supabase/server";

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const supabase = createReadonlyClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return <>{children}</>;
}
