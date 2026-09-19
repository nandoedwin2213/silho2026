"use client";

import { usePathname } from "next/navigation";
import { AdminShell } from "./_components";

export function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  return usePathname() === "/admin/login" ? <>{children}</> : <AdminShell>{children}</AdminShell>;
}
