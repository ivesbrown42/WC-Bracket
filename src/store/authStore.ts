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
  signUp: (email: string, password: string) => Promise<{ error: string | null; userId: string | null }>
  signInWithEmail: (email: string) => Promise<{ error: string | null }>
  signInWithPassword: (email: string, password: string) => Promise<{ error: string | null }>
  setPassword: (password: string) => Promise<{ error: string | null }>
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
  // Set `user` SYNCHRONOUSLY (before the profile fetch) so nothing that reads
  // the store ever sees a "signed-in but user still null" gap.
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
      set({ user: null, profile: null, loading: false })
      return
    }
    const user = session?.user ?? null
    set({ user, loading: false })
    if (user) fetchProfile(user.id).then((profile) => set({ profile }))
    else set({ profile: null })
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

    signUp: async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) return { error: error.message, userId: null }
      // No session means Supabase still requires email confirmation — surface
      // that clearly instead of letting the UI silently bounce to /login.
      if (!data.session) {
        return {
          error:
            'Email confirmation is still on. Turn off "Confirm email" in Supabase → Auth → Providers → Email.',
          userId: null,
        }
      }
      set({ user: data.user, loading: false }) // sync — ready before navigate
      return { error: null, userId: data.user?.id ?? null }
    },

    signInWithEmail: async (email: string) => {
      const redirectTo = window.location.origin + (import.meta.env.BASE_URL ?? '/')
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo },
      })
      return { error: error?.message ?? null }
    },

    signInWithPassword: async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (error) return { error: error.message }
      // Set user synchronously so navigate() right after won't race the listener.
      if (data.user) {
        set({ user: data.user, loading: false })
        fetchProfile(data.user.id).then((profile) => set({ profile }))
      }
      return { error: null }
    },

    setPassword: async (password: string) => {
      const { error } = await supabase.auth.updateUser({ password })
      return { error: error?.message ?? null }
    },

    signOut: async () => {
      await supabase.auth.signOut()
    },
  }
})
