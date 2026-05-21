"use client"

import { apiRequest } from "@/lib/api-client"
import { supabase } from "@/lib/supabase/client"
import type { RealtimeChannel, User } from "@supabase/supabase-js"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

export type AuthProfile = {
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

type ProfileResponse = {
  user: User | null
  profile: AuthProfile | null
}

let profileSyncChannel: RealtimeChannel | null = null
let profileSyncUserId: string | null = null

function stopProfileSync() {
  if (profileSyncChannel) {
    supabase.removeChannel(profileSyncChannel)
  }

  profileSyncChannel = null
  profileSyncUserId = null
}

function startProfileSync(userId: string | null, refreshAuth: () => Promise<void>) {
  if (!userId) {
    stopProfileSync()
    return
  }

  if (profileSyncUserId === userId && profileSyncChannel) return

  stopProfileSync()
  profileSyncUserId = userId
  profileSyncChannel = supabase
    .channel(`profile-role-sync:${userId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "profiles",
        filter: `id=eq.${userId}`,
      },
      () => {
        refreshAuth().catch(() => null)
      }
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "user_roles",
        filter: `user_id=eq.${userId}`,
      },
      () => {
        refreshAuth().catch(() => null)
      }
    )
    .subscribe()
}

interface AuthState {
  user: User | null
  profile: AuthProfile | null
  role: string | null
  roles: string[]
  loading: boolean
  initialized: boolean
  authListenerStarted: boolean
  setUser: (user: User | null) => void
  setProfile: (profile: AuthProfile | null) => void
  setRole: (role: string | null) => void
  setRoles: (roles: string[]) => void
  setLoading: (loading: boolean) => void
  initAuth: () => Promise<void>
  refreshAuth: () => Promise<void>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
  user: null,
  profile: null,
  role: null,
  roles: [],
  loading: true,
  initialized: false,
  authListenerStarted: false,

  setUser: (user) => set({ user }),
  setProfile: (profile) =>
    set({
      profile,
      role: profile?.active_role ?? profile?.role ?? null,
      roles: profile?.roles?.length
        ? profile.roles
        : profile?.role
          ? [profile.role]
          : [],
    }),
  setRole: (role) => set({ role }),
  setRoles: (roles) => set({ roles }),
  setLoading: (loading) => set({ loading }),

  initAuth: async () => {
    try {
      await get().refreshAuth()

      if (get().authListenerStarted) return

      set({ authListenerStarted: true })

      supabase.auth.onAuthStateChange((event, session) => {
        const nextUser = session?.user ?? null
        const currentUser = get().user

        if (event === "SIGNED_OUT" || !nextUser) {
          stopProfileSync()
          set({
            user: null,
            profile: null,
            role: null,
            roles: [],
            initialized: true,
            loading: false,
          })
          return
        }

        if (currentUser?.id === nextUser.id) {
          startProfileSync(nextUser.id, get().refreshAuth)
          set({
            user: nextUser,
            initialized: true,
            loading: false,
          })
          return
        }

        set({
          user: nextUser,
            profile: null,
            role: null,
            roles: [],
          initialized: true,
          loading: Boolean(nextUser),
        })

        if (nextUser) {
          startProfileSync(nextUser.id, get().refreshAuth)
          fetchProfile(nextUser.id).then((nextProfile) => {
            set({
              profile: nextProfile,
              role: nextProfile?.active_role ?? nextProfile?.role ?? "user",
              roles: nextProfile?.roles?.length
                ? nextProfile.roles
                : nextProfile?.role
                  ? [nextProfile.role]
                  : [],
              loading: false,
            })
          })
        }
      })
    } catch (error) {
      console.error("Auth init error:", error)
      stopProfileSync()
      set({
        user: null,
        profile: null,
        role: null,
        roles: [],
        initialized: true,
        loading: false,
      })
    }
  },

  refreshAuth: async () => {
    const current = get()

    if (!current.initialized && !current.user) {
      set({ loading: true })
    }

    try {
      const data = await apiRequest<ProfileResponse>("/api/auth/me")

      if (data.profile?.status === "suspended") {
        stopProfileSync()
        set({
          user: null,
          profile: null,
          role: null,
          roles: [],
          initialized: true,
          loading: false,
        })
        return
      }

      startProfileSync(data.user?.id ?? null, get().refreshAuth)
      set({
        user: data.user,
        profile: data.profile,
        role: data.profile?.active_role ?? data.profile?.role ?? null,
        roles: data.profile?.roles?.length
          ? data.profile.roles
          : data.profile?.role
            ? [data.profile.role]
            : [],
        initialized: true,
        loading: false,
      })
      return
    } catch {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const user = session?.user ?? null
      const profile = user ? await fetchProfile(user.id) : null

      startProfileSync(user?.id ?? null, get().refreshAuth)
      set({
        user,
        profile,
        role: profile?.active_role ?? profile?.role ?? null,
        roles: profile?.roles?.length
          ? profile.roles
          : profile?.role
            ? [profile.role]
            : [],
        initialized: true,
        loading: false,
      })
    }
  },

  signOut: async () => {
    await apiRequest("/api/auth/logout", {
      method: "POST",
    }).catch(() => null)
    await supabase.auth.signOut().catch(() => null)
    stopProfileSync()
    set({
      user: null,
      profile: null,
      role: null,
      roles: [],
      initialized: true,
      loading: false,
    })
    window.location.assign("/login")
  },
}),
    {
      name: "lch-auth-profile",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        profile: state.profile,
        role: state.role,
        roles: state.roles,
      }),
    }
  )
)

async function fetchProfile(userId: string): Promise<AuthProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, role, active_role, status, avatar_url, created_at, updated_at")
    .eq("id", userId)
    .single()

  if (error || !data) {
    return null
  }

  const { data: roles } = await supabase
    .from("user_roles")
    .select("role_name")
    .eq("user_id", userId)

  return {
    ...data,
    roles: roles?.map((role) => role.role_name) ?? [data.active_role ?? data.role],
  }
}
