"use client";

import Link, { type LinkProps } from "next/link";
import type { ReactNode } from "react";
import { track, type AnalyticsEvent } from "@/lib/analytics";

export function TrackedLink({ event, params, children, ...props }: LinkProps & { event: AnalyticsEvent; params?: Record<string, string | number | boolean>; children: ReactNode; className?: string }) {
  return <Link {...props} onClick={() => track(event, params)}>{children}</Link>;
}
