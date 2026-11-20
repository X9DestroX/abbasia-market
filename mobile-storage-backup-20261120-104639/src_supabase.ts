import { createClient } from "@supabase/supabase-js";
import { getAppStorageItem, setAppStorageItem, removeAppStorageItem } from "@/storage";

const authStorage = {
  getItem: getAppStorageItem,
  setItem: setAppStorageItem,
  removeItem: removeAppStorageItem,
};

// Public client configuration only. Never place a service-role or database key here.
const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  "https://vwtauiwvezkzuqdfihck.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_ow2X9peiirvHFldFfLrD0w_cWL4Ju5D";

export const API_URL = (
  process.env.EXPO_PUBLIC_API_URL || "https://abbasia-shop.vercel.app"
).replace(/\/$/, "");

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: authStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
