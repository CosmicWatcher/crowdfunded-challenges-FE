function removeTrailingSlash(url: string) {
  return url.replace(/\/$/, "");
}

export const SUPABASE_ANON_KEY = import.meta.env
  .VITE_SUPABASE_ANON_KEY as string;

export const SUPABASE_URL = removeTrailingSlash(
  import.meta.env.VITE_SUPABASE_URL as string,
);

export const SERVER_URL = removeTrailingSlash(
  import.meta.env.VITE_SERVER_URL as string,
);

export const APP_URL = removeTrailingSlash(
  import.meta.env.VITE_APP_URL as string,
);

export const JWT_PUBLIC_KEY = import.meta.env.VITE_JWT_PUBLIC_KEY as string;
