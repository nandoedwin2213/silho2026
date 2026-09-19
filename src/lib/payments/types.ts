export type PaymentProviderStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | "ERROR" | "PENDING_CONFIGURATION";

export interface PaymentProvider {
  name: string;
  isConfigured(): boolean;
  createPayment(input: {
    orderId: string;
    amount: number;
    currency: string;
    clientTransactionId: string;
    description: string;
    customer: { name: string; email?: string; phone?: string };
  }): Promise<{ redirectUrl?: string; providerRef?: string; status: PaymentProviderStatus }>;
  confirmPayment(input: { providerTransactionId: string; clientTransactionId: string }): Promise<{ status: PaymentProviderStatus; raw: unknown }>;
  parseWebhook(req: Request): Promise<{ clientTransactionId: string; providerTransactionId: string; status: PaymentProviderStatus; raw: unknown }>;
}
