import { cookies } from "next/headers";
import { randomUUID } from "crypto";

const CART_COOKIE = "cart_session";

/**
 * Read the cart session cookie (safe to call from Server Components).
 * Returns the session ID or undefined if none exists.
 */
export async function getCartSession(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(CART_COOKIE)?.value;
}

/**
 * Get or create the cart session cookie.
 * ⚠️ Can ONLY be called from a Server Action or Route Handler
 * (cookies().set is not allowed during render).
 */
export async function getOrCreateCartSession(): Promise<string> {
  const store = await cookies();
  const existing = store.get(CART_COOKIE)?.value;
  if (existing) return existing;
  const id = randomUUID();
  store.set(CART_COOKIE, id, { httpOnly: false, sameSite: "lax", path: "/" });
  return id;
}

