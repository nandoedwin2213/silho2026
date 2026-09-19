"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function SiteChrome({ children, header, footer, adminSession }: { children: ReactNode; header: ReactNode; footer: ReactNode; adminSession: boolean }) {
  const isAdminRoute = usePathname().startsWith("/admin");
  const showPublicChrome = !isAdminRoute && !adminSession;
  return <>{showPublicChrome && header}<div className="flex-1">{children}</div>{showPublicChrome && footer}</>;
}
