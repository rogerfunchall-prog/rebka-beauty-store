import { timingSafeEqual } from "node:crypto";

export const LOCAL_ADMIN_OPEN_ID = "rebka-local-admin";

type LocalAdminCredentials = {
  email: string;
  password: string;
};

function readCredentials(): LocalAdminCredentials {
  const email = process.env.REBKA_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.REBKA_ADMIN_PASSWORD;
  if (!email || !password) throw new Error("As credenciais administrativas ainda não foram configuradas.");
  return { email, password };
}

function matches(left: string, right: string) {
  const leftValue = Buffer.from(left);
  const rightValue = Buffer.from(right);
  return leftValue.length === rightValue.length && timingSafeEqual(leftValue, rightValue);
}

export function validateLocalAdminLogin(email: string, password: string) {
  const configured = readCredentials();
  return matches(email.trim().toLowerCase(), configured.email) && matches(password, configured.password);
}
