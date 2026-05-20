import { createClient } from "@supabase/supabase-js"

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  const missingEnvVars = [
    !supabaseUrl && "NEXT_PUBLIC_SUPABASE_URL",
    !serviceRoleKey && "SUPABASE_SERVICE_ROLE_KEY",
  ].filter(Boolean)

  if (missingEnvVars.length) {
    console.error(
      `Supabase admin client is missing env vars: ${missingEnvVars.join(", ")}`
    )
    return null
  }

  return createClient(supabaseUrl!, serviceRoleKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
