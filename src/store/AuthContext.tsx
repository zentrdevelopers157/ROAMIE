import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase, isSupabaseEnabled } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<string | null>
  signIn: (email: string, password: string) => Promise<string | null>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseEnabled()) {
      setLoading(false)
      return
    }

    // Check active session
    supabase!.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase!.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string): Promise<string | null> => {
    if (!isSupabaseEnabled()) return 'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env'

    const { error } = await supabase!.auth.signUp({ email, password })
    return error?.message ?? null
  }

  const signIn = async (email: string, password: string): Promise<string | null> => {
    if (!isSupabaseEnabled()) return 'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env'

    const { error } = await supabase!.auth.signInWithPassword({ email, password })
    return error?.message ?? null
  }

  const signOut = async () => {
    if (!isSupabaseEnabled()) return
    await supabase!.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
