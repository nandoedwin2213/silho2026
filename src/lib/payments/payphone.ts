import type { PaymentProvider, PaymentProviderStatus } from "./types";

const endpoint = "https://pay.payphonetodoesposible.com";

function mapStatus(value: unknown): PaymentProviderStatus {
  const status = String(value ?? "").toUpperCase();
  if (status.includes("APPROV") || status === "3") return "APPROVED";
  if (status.includes("CANCEL")) return "CANCELLED";
  if (status.includes("REJECT")) return "REJECTED";
  if (status.includes("ERROR")) return "ERROR";
  return "PENDING";
}

export const payphone: PaymentProvider = {
  name: "payphone",
  isConfigured: () => Boolean(process.env.PAYPHONE_TOKEN && process.env.PAYPHONE_STORE_ID),
  async createPayment(input) {
    if (!this.isConfigured()) return { status: "PENDING_CONFIGURATION" };
    const response = await fetch(`${endpoint}/api/button/Prepare`, {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.PAYPHONE_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: Math.round(input.amount * 100),
        amountWithoutTax: Math.round(input.amount * 100),
        currency: input.currency,
        clientTransactionId: input.clientTransactionId,
        storeId: process.env.PAYPHONE_STORE_ID,
        responseUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payphone/response`,
        cancellationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payphone/response?cancelled=true`,
      }),
    });
    if (!response.ok) throw new Error(`PayPhone Prepare failed: ${response.status}`);
    const raw = await response.json();
    return { redirectUrl: raw.link ?? raw.url, providerRef: String(raw.id ?? ""), status: mapStatus(raw.status) };
  },
  async confirmPayment(input) {
    if (!this.isConfigured()) return { status: "PENDING_CONFIGURATION", raw: {} };
    const response = await fetch(`${endpoint}/api/button/V2/Confirm`, {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.PAYPHONE_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ id: input.providerTransactionId, clientTxId: input.clientTransactionId }),
    });
    const raw = await response.json();
    return { status: response.ok ? mapStatus(raw.status ?? raw.transactionStatus) : "ERROR", raw };
  },
  async parseWebhook(req) {
    const raw = await req.json();
    return {
      clientTransactionId: String(raw.clientTransactionId ?? raw.clientTxId ?? ""),
      providerTransactionId: String(raw.id ?? raw.transactionId ?? ""),
      status: mapStatus(raw.status ?? raw.transactionStatus),
      raw,
    };
  },
};
