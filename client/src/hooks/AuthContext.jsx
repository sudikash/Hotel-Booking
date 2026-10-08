import { createContext, useContext, useEffect, useState } from 'react'
import { apiRequest } from '../services/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    apiRequest('/auth/me')
      .then((result) => { if (active) setUser(result.user) })
      .catch(() => { if (active) setUser(null) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const signOut = async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' })
    } catch {}
    try {
      localStorage.removeItem('auth_token')
    } catch {}
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider.')
  return context
}