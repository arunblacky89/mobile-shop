import { cookies } from "next/headers";

import { apiGet } from "./api";

const ACCESS_COOKIE = "access_token";
const REFRESH_COOKIE = "refresh_token";

export async function login(username: string, password: string): Promise<void> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"}/api/auth/token/`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      cache: "no-store",
    },
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "Invalid credentials");
  }

  const data = (await res.json()) as { access: string; refresh: string };
  const store = await cookies();
  store.set(ACCESS_COOKIE, data.access, { httpOnly: false, sameSite: "lax", path: "/" });
  store.set(REFRESH_COOKIE, data.refresh, { httpOnly: false, sameSite: "lax", path: "/" });
}

export async function logout(): Promise<void> {
  const store = await cookies();
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
}

export async function getAccessToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(ACCESS_COOKIE)?.value;
}

export async function fetchWithAuth<T>(path: string): Promise<T> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error("Not authenticated");
  }
  return apiGet<T>(path, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

