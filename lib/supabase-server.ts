import { createClient } from "@supabase/supabase-js"

// Server-side Supabase client (for API routes)
// Uses service role key for full admin access
export const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)
