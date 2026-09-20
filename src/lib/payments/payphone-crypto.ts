import { createCipheriv } from "node:crypto";

function keyBytes() {
  const password = process.env.PAYPHONE_CODING_PASSWORD;
  if (!password) throw new Error("PAYPHONE_CODING_PASSWORD no configurado");
  return Buffer.from(password, "utf8").subarray(0, 32).toString("latin1").padEnd(32, "\0");
}

export function encryptCardHolder(name: string) {
  const cipher = createCipheriv("aes-256-cbc", Buffer.from(keyBytes(), "latin1"), Buffer.alloc(16));
  return Buffer.concat([cipher.update(name, "utf8"), cipher.final()]).toString("base64");
}
