import { createClient } from "@/lib/supabase/server"

export async function getCurrentUserProfile() {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { supabase, user: null, profile: null }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, role, active_role, roles, status, avatar_url, created_at, updated_at")
    .eq("id", user.id)
    .single()

  return { supabase, user, profile }
}

export async function requireActiveUser() {
  const context = await getCurrentUserProfile()

  if (!context.user || !context.profile) {
    return { ...context, error: "Authentication required", status: 401 }
  }

  if (context.profile.status !== "active") {
    await context.supabase.auth.signOut()
    return { ...context, error: "This account has been suspended", status: 403 }
  }

  return { ...context, error: null, status: 200 }
}

export async function requireAdmin() {
  const context = await requireActiveUser()

  if (context.error) {
    return context
  }

  if ((context.profile?.active_role ?? context.profile?.role) !== "admin") {
    return { ...context, error: "Admin access required", status: 403 }
  }

  return context
}
