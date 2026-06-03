"use client"

import { createContext, useContext, useState, useCallback, useEffect, useMemo, type ReactNode } from 'react'
import type { User, AuthState } from '@/types'

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
}

const STORAGE_KEY = 'finanzas-auth-token'
const STORAGE_USER_KEY = 'finanzas-auth-user'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
  })

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_USER_KEY)
      const savedToken = localStorage.getItem(STORAGE_KEY)

      if (savedUser && savedToken) {
        setState({
          user: JSON.parse(savedUser) as User,
          isAuthenticated: true,
          isLoading: false,
        })
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(STORAGE_USER_KEY)
    }
  }, [])

  const persistSession = useCallback((email: string, fallbackName: string) => {
    const user: User = {
      id: `demo-user-${Date.now()}`,
      name: fallbackName || email.split('@')[0] || 'Usuario',
      email,
    }

    localStorage.setItem(STORAGE_KEY, 'demo-token')
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user))

    setState({ user, isAuthenticated: true, isLoading: false })
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true }))

    try {
      if (!email.trim() || !password.trim()) {
        setState(prev => ({ ...prev, isLoading: false }))
        return false
      }

      persistSession(email.trim(), email.split('@')[0])
      return true
    } catch {
      setState(prev => ({ ...prev, isLoading: false }))
      return false
    }
  }, [persistSession])

  const register = useCallback(async (name: string, email: string, password: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true }))

    try {
      if (!name.trim() || !email.trim() || !password.trim()) {
        setState(prev => ({ ...prev, isLoading: false }))
        return false
      }

      persistSession(email.trim(), name.trim())
      return true
    } catch {
      setState(prev => ({ ...prev, isLoading: false }))
      return false
    }
  }, [persistSession])

  const logout = useCallback(async () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(STORAGE_USER_KEY)
    } finally {
      setState({ user: null, isAuthenticated: false, isLoading: false })
    }
  }, [])

  const value = useMemo(() => ({ ...state, login, register, logout }), [state, login, register, logout])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
