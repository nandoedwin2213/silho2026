export type PaymentProviderStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | "ERROR" | "PENDING_CONFIGURATION";

export interface PaymentProvider {
  name: string;
  isConfigured(): boolean;
  createPayment(input: {
    orderId?: string;
    amount: number;
    currency: string;
    clientTransactionId: string;
    description: string;
    customer: { name: string; email?: string; phone?: string };
  }): Promise<{ redirectUrl?: string; providerRef?: string; status: PaymentProviderStatus }>;
  chargeToken?(input: {
    cardToken: string;
    cardHolderEnc: string;
    documentId: string;
    phoneNumber: string;
    email: string;
    amount: number;
    currency: string;
    clientTransactionId: string;
    description: string;
  }): Promise<{ status: PaymentProviderStatus; providerTransactionId?: string; raw: unknown }>;
  confirmPayment(input: { providerTransactionId: string; clientTransactionId: string }): Promise<{ status: PaymentProviderStatus; raw: unknown }>;
  parseWebhook(req: Request): Promise<{ clientTransactionId: string; providerTransactionId: string; status: PaymentProviderStatus; raw: unknown }>;
}
