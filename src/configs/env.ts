import { Cluster } from "@solana/web3.js";

export const SUPABASE_ANON_KEY = import.meta.env
  .VITE_SUPABASE_ANON_KEY as string;
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
export const SERVER_URL = import.meta.env.VITE_SERVER_URL as string;
export const APP_URL = import.meta.env.VITE_APP_URL as string;
export const SOLANA_RPC = import.meta.env.VITE_SOLANA_RPC as Cluster;
