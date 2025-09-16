// lib/supabaseServer.ts
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-side client with service role key
export const supabaseServer = createClient<Database>(supabaseUrl, supabaseServiceRoleKey);
