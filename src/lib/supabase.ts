import { Session, createClient } from "@supabase/supabase-js";

import { APP_URL, SUPABASE_ANON_KEY, SUPABASE_URL } from "@/configs/env";
import { SITE_PAGES } from "@/configs/routes";

// Create a single supabase client for interacting with the database
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/** Get the user session if authenticated, otherwise null */
export async function getUserSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();
  if (!error) {
    return data.session;
  } else {
    throw error;
  }
}

export async function login(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    throw error;
  }
}

export async function signup(email: string, password: string) {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${APP_URL}${SITE_PAGES.ACCOUNT}`,
    },
  });
  if (error) {
    throw error;
  }
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}
