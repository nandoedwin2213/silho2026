import type { PaymentStatus } from "@prisma/client";
import type { PaymentProviderStatus } from "./types";

export function toPaymentStatus(providerStatus: PaymentProviderStatus): PaymentStatus {
  switch (providerStatus) {
    case "PENDING":
    case "PENDING_CONFIGURATION":
      return "PENDING";
    case "APPROVED":
      return "APPROVED";
    case "REJECTED":
      return "REJECTED";
    case "CANCELLED":
      return "CANCELLED";
    case "ERROR":
      return "ERROR";
  }
}
