import { apiRequest } from './client'

export interface AuthResponse {
  token?: string
  accessToken?: string
  jwt?: string
  user?: {
    id?: string
    name?: string
    email?: string
    role?: string
    [key: string]: unknown
  }
  usuario?: {
    id?: string
    name?: string
    email?: string
    role?: string
    [key: string]: unknown
  }
  message?: string
}

export async function registerUser(name: string, email: string, password: string) {
  return apiRequest('/api/v1/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, password }),
  })
}

export async function loginUser(email: string, password: string) {
  return apiRequest('/api/v1/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })
}

export async function logoutUser() {
  return apiRequest('/api/v1/auth/logout', {
    method: 'POST',
  })
}

export async function getAdminUsers() {
  return apiRequest('/api/v1/auth/admin/usuarios')
}
