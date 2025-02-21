import { decodeJwt } from "jose";

import {
  getSupabaseAuthSession,
  getSupabaseAuthUser,
  supabaseLogout,
} from "@/lib/supabase";
import { CodeLoginResponse } from "@/types/api.types";

export async function isUserLoggedIn() {
  return (await getAccessToken()) !== null;
}

export async function getAccessToken(): Promise<{
  token: string;
  loginMethod: "code-login" | "supabase";
} | null> {
  // if code login session exists and has not expired, return the jwt
  const codeLoginSession = getCodeLoginSession();
  if (codeLoginSession) {
    const now = new Date();
    const expiresAt = new Date(codeLoginSession.expiresAt);
    if (now <= expiresAt)
      return { token: codeLoginSession.jwt, loginMethod: "code-login" };
    void logout();
  }

  // if user is logged in with supabase, return the access token
  const session = await getSupabaseAuthSession();
  if (session) return { token: session.access_token, loginMethod: "supabase" };

  // if no valid session exists, return null
  return null;
}

export async function getAuthUserId(): Promise<string | null> {
  const accessToken = await getAccessToken();

  if (!accessToken) return null;

  if (accessToken.loginMethod === "code-login") {
    const payload = verifyJwtToken(accessToken.token);
    return payload.userId as string;
  } else if (accessToken.loginMethod === "supabase") {
    const user = await getSupabaseAuthUser();
    return user?.id ?? null;
  }

  return null;
}

export function saveCodeLoginSession(sessionJson: string) {
  localStorage.setItem("code-login-session", sessionJson);
}

function getCodeLoginSession(): CodeLoginResponse | null {
  const sessionJson = localStorage.getItem("code-login-session");
  if (!sessionJson) return null;
  return JSON.parse(sessionJson) as CodeLoginResponse;
}

export async function logout() {
  if (getCodeLoginSession()) {
    localStorage.removeItem("code-login-session");
  } else {
    await supabaseLogout();
  }
}

function verifyJwtToken(token: string) {
  const payload = decodeJwt(token);
  return payload;
}
