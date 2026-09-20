export type AnalyticsEvent =
  | "whatsapp_click"
  | "cta_reservar_click"
  | "booking_step"
  | "booking_submit"
  | "payment_redirect"
  | "lead_submit"
  | "route_selector_result"
  | "checkout_submit";

export function track(event: AnalyticsEvent, params: Record<string, string | number | boolean> = {}) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event, ...params });
  window.gtag?.("event", event, params);
}

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
    gtag?: (command: string, event: string, params?: Record<string, string | number | boolean>) => void;
  }
}
