export enum SitePages {
  HOME = "/",
  SIGNUP = "/signup",
  LOGIN = "/login",
  TASK = "/task",
}

export const SUPABASE_ANON_KEY = import.meta.env.PROD
  ? ""
  : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";
export const SUPABASE_URL = import.meta.env.PROD
  ? ""
  : "http://192.168.2.10:54321";
