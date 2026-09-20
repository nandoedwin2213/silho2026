"use client";

import { MessageCircle } from "lucide-react";
import { track } from "@/lib/analytics";

export function whatsappHref(number: string, service?: string) {
  const text = service ? `Hola SILHO, quiero información sobre ${service}.` : "Hola SILHO, quiero información.";
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

export function WhatsAppButton({
  number,
  service,
  variant = "floating",
}: {
  number: string;
  service?: string;
  variant?: "floating" | "inline";
}) {
  return (
    <a
      href={whatsappHref(number, service)}
      target="_blank"
      rel="noreferrer"
      onClick={() => track("whatsapp_click", { service: service ?? "" })}
      className={variant === "floating"
        ? "fixed bottom-5 right-5 z-40 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105"
        : "inline-flex items-center gap-2 rounded-full border border-[#25D366]/30 px-5 py-3 text-sm font-semibold text-[#168c43] transition hover:bg-[#25D366]/10"}
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle className="size-5" />
      {variant === "inline" && "Consultar por WhatsApp"}
    </a>
  );
}
