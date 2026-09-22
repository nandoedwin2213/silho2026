"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function SiteChrome({ children, header, footer, adminSession, assessmentDiscount }: { children: ReactNode; header: ReactNode; footer: ReactNode; adminSession: boolean; assessmentDiscount: number }) {
  const isAdminRoute = usePathname().startsWith("/admin");
  const showPublicChrome = !isAdminRoute && !adminSession;
  return <>{showPublicChrome && <div className="bg-navy px-6 py-2 text-center text-xs text-white/80"><span>Precios exclusivos web en todos los tratamientos y -{assessmentDiscount}% en tu valoración pagando en línea · </span><Link href="/tratamientos" className="font-semibold text-gold-light underline-offset-2 hover:underline">Ver tratamientos</Link></div>}{showPublicChrome && header}<div className="flex-1">{children}</div>{showPublicChrome && footer}</>;
}
