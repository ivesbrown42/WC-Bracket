import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export interface UserProfile {
  id: string
  display_name: string
  favorite_team_id: string | null
}

interface AuthState {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  initialize: () => Promise<void>
  signInWithEmail: (email: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const { data } = await supabase
    .from('profiles')
    .select('id, display_name, favorite_team_id')
    .eq('id', userId)
    .maybeSingle()
  return data ?? null
}

export const useAuthStore = create<AuthState>((set, get) => {
  // Set up the listener at store creation time — never misses an event,
  // including the SIGNED_IN that fires during the magic-link redirect.
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_OUT') {
      set({ user: null, profile: null, loading: false })
      return
    }
    const user = session?.user ?? null
    if (user) {
      const profile = await fetchProfile(user.id)
      set({ user, profile, loading: false })
    } else {
      set({ user: null, profile: null, loading: false })
    }
  })

  return {
    user: null,
    profile: null,
    loading: true,

    // Called once in App on mount — catches the session if it was already
    // established before onAuthStateChange fired (e.g. page refresh).
    initialize: async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user ?? null
      const profile = user ? await fetchProfile(user.id) : null
      set({ user, profile, loading: false })
    },

    refreshProfile: async () => {
      const { user } = get()
      if (!user) return
      const profile = await fetchProfile(user.id)
      set({ profile })
    },

    signInWithEmail: async (email: string) => {
      const redirectTo = window.location.origin + (import.meta.env.BASE_URL ?? '/')
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo },
      })
      return { error: error?.message ?? null }
    },

    signOut: async () => {
      await supabase.auth.signOut()
    },
  }
})
