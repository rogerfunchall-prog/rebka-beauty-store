import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { getOlistConfig, OlistConfigurationError } from "./config";

const ALGORITHM = "aes-256-gcm";

function getEncryptionKey() {
  const value = getOlistConfig().tokenEncryptionKey;
  if (!/^[a-fA-F0-9]{64}$/.test(value)) {
    throw new OlistConfigurationError("TINY_TOKEN_ENCRYPTION_KEY deve conter 64 caracteres hexadecimais.");
  }
  return Buffer.from(value, "hex");
}

export function encryptOlistSecret(value: string) {
  const key = getEncryptionKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString("base64url"), tag.toString("base64url"), ciphertext.toString("base64url")].join(".");
}

export function decryptOlistSecret(payload: string) {
  const [ivEncoded, tagEncoded, ciphertextEncoded] = payload.split(".");
  if (!ivEncoded || !tagEncoded || !ciphertextEncoded) {
    throw new Error("Token Olist persistido em formato inválido.");
  }
  const decipher = createDecipheriv(ALGORITHM, getEncryptionKey(), Buffer.from(ivEncoded, "base64url"));
  decipher.setAuthTag(Buffer.from(tagEncoded, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(ciphertextEncoded, "base64url")), decipher.final()]).toString("utf8");
}
