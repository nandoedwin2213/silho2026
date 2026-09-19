import { payphone } from "./payphone";
import type { PaymentProvider } from "./types";

const providers: Record<string, PaymentProvider> = { payphone };

export function getPaymentProvider(name: string) {
  return providers[name.toLowerCase()];
}
