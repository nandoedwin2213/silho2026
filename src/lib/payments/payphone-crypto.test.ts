import { createDecipheriv } from "node:crypto";
import { describe, expect, it } from "vitest";
import { encryptCardHolder } from "./payphone-crypto";

describe("PayPhone card holder encryption", () => {
  it("encrypts with AES-256-CBC and a zero IV", () => {
    process.env.PAYPHONE_CODING_PASSWORD = "fixed-test-password";
    const encrypted = encryptCardHolder("Ana María SILHO");
    const key = Buffer.from(process.env.PAYPHONE_CODING_PASSWORD, "utf8").subarray(0, 32).toString("latin1").padEnd(32, "\0");
    const decipher = createDecipheriv("aes-256-cbc", Buffer.from(key, "latin1"), Buffer.alloc(16));
    const clear = Buffer.concat([decipher.update(Buffer.from(encrypted, "base64")), decipher.final()]).toString("utf8");
    expect(clear).toBe("Ana María SILHO");
  });
});
