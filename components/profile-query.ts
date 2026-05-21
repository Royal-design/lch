import { apiRequest } from "@/lib/api-client"

export type CurrentProfile = {
  id: string
  full_name: string
  email: string
  phone: string | null
  role: string
  active_role?: string | null
  roles?: string[]
  status: "active" | "suspended"
  avatar_url: string | null
  created_at?: string
  updated_at?: string
}

export async function fetchCurrentProfile() {
  const data = await apiRequest<{ profile: CurrentProfile }>("/api/profile")
  return data.profile
}
