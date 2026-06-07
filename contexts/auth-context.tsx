"use client"

import { createContext, useContext, useState, useCallback, useEffect, useMemo, type ReactNode } from 'react'
import type { User, AuthState } from '@/types'
import { loginUser, registerUser } from '@/lib/api/auth'

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
    isLoading: true,
  })

  useEffect(() => {
    try {
      const token = localStorage.getItem(STORAGE_KEY)
      const userRaw = localStorage.getItem(STORAGE_USER_KEY)
      if (token && userRaw) {
        const user = JSON.parse(userRaw) as User
        setState({ user, isAuthenticated: true, isLoading: false })
        return
      }
    } catch {
      // ignore
    }
    setState({ user: null, isAuthenticated: false, isLoading: false })
  }, [])

  const persistSession = useCallback((token: string, email: string, name: string) => {
    const user: User = {
      id: `user-${Date.now()}`,
      name: name || email.split('@')[0] || 'Usuario',
      email,
    }
    localStorage.setItem(STORAGE_KEY, token)
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user))
    setState({ user, isAuthenticated: true, isLoading: false })
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true }))
    try {
      const data = await loginUser(email, password) as { token?: string; accessToken?: string }
      const token = data?.token ?? data?.accessToken
      if (!token) throw new Error('No se recibió token')
      persistSession(token, email, email.split('@')[0])
      return true
    } catch {
      setState(prev => ({ ...prev, isLoading: false }))
      return false
    }
  }, [persistSession])

  const register = useCallback(async (name: string, email: string, password: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true }))
    try {
      const data = await registerUser(name, email, password) as { token?: string; accessToken?: string }
      const token = data?.token ?? data?.accessToken
      if (!token) throw new Error('No se recibió token')
      persistSession(token, email, name)
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
