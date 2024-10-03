import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/config";
import { createClient } from "@supabase/supabase-js";

// Create a single supabase client for interacting with your database
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function isUserAuthenticated(): Promise<boolean> {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (!error) {
      if (!data.session) return Promise.resolve(false);
      else return Promise.resolve(true);
    } else {
      console.error(error.message);
      return Promise.reject(error);
    }
  } catch (err) {
    console.error("isUserAuthenticated:", err);
    return Promise.reject(err as Error);
  }
}
