export const OLIST_API_BASE_URL = "https://api.tiny.com.br/public-api/v3";
export const OLIST_OAUTH_BASE_URL = "https://accounts.tiny.com.br/realms/tiny/protocol/openid-connect";
export const OLIST_ACCOUNT_KEY = "primary";
const OLIST_WEBHOOK_BASE_URL = "https://www.rebka.com.br/api/olist/webhooks";

type OlistConfig = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  tokenEncryptionKey: string;
};

function required(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new OlistConfigurationError(`${name} não está configurada.`);
  return value;
}

export class OlistConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OlistConfigurationError";
  }
}

export function getOlistConfig(): OlistConfig {
  return {
    clientId: required("TINY_CLIENT_ID"),
    clientSecret: required("TINY_CLIENT_SECRET"),
    redirectUri: required("TINY_OAUTH_REDIRECT_URI"),
    tokenEncryptionKey: required("TINY_TOKEN_ENCRYPTION_KEY"),
  };
}

export function getOlistConfigStatus() {
  return {
    configured: Boolean(
      process.env.TINY_CLIENT_ID?.trim() &&
        process.env.TINY_CLIENT_SECRET?.trim() &&
        process.env.TINY_OAUTH_REDIRECT_URI?.trim() &&
        process.env.TINY_TOKEN_ENCRYPTION_KEY?.trim()
    ),
    redirectUri: process.env.TINY_OAUTH_REDIRECT_URI?.trim() || null,
    webhookConfigured: Boolean(process.env.TINY_WEBHOOK_SECRET?.trim()),
  };
}

export function getOlistWebhookEndpoint() {
  const secret = required("TINY_WEBHOOK_SECRET");
  return `${OLIST_WEBHOOK_BASE_URL}?token=${encodeURIComponent(secret)}`;
}
