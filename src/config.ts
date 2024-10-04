export enum SitePages {
  HOME = "/",
  SIGNUP = "/signup",
  LOGIN = "/login",
  TASK = "/task",
}

export const SUPABASE_ANON_KEY = import.meta.env
  .VITE_SUPABASE_ANON_KEY as string;
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
export const SERVER_URL = import.meta.env.VITE_SERVER_URL as string;
