import { createClient } from "@supabase/supabase-js";
import { config } from "../config/index.js";

// Cliente Supabase para operações administrativas (usando service key)
export const supabase = createClient(
  config.supabase.url,
  config.supabase.serviceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Cliente Supabase para autenticação (usando anon key)
export const supabaseAuth = createClient(
  config.supabase.url,
  config.supabase.anonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export default supabase;
