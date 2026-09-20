import { createHmac, timingSafeEqual } from "node:crypto";
import { getAuthSecret } from "./auth-secret";

export function signPublicToken(id: string) {
  return createHmac("sha256", getAuthSecret()).update(id).digest("base64url").slice(0, 32);
}

export function verifyPublicToken(id: string, token: string) {
  const expected = signPublicToken(id);
  const actual = Buffer.from(token);
  const target = Buffer.from(expected);
  return actual.length === target.length && timingSafeEqual(actual, target);
}
