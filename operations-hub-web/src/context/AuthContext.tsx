import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

type AuthContextValue = {
  isAuthenticated: boolean
  userName: string | null
  login: (username: string, password: string) => boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const STORAGE_KEY = 'operations-hub.auth'
const USER_KEY = 'operations-hub.user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem(STORAGE_KEY) === 'true',
  )
  const [userName, setUserName] = useState<string | null>(
    () => localStorage.getItem(USER_KEY),
  )

  const login = (username: string, password: string) => {
    const ok = username === 'admin' && password === 'admin'
    if (ok) {
      setIsAuthenticated(true)
      setUserName(username)
      localStorage.setItem(STORAGE_KEY, 'true')
      localStorage.setItem(USER_KEY, username)
    }
    return ok
  }

  const logout = () => {
    setIsAuthenticated(false)
    setUserName(null)
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(USER_KEY)
  }

  const value = useMemo(
    () => ({ isAuthenticated, userName, login, logout }),
    [isAuthenticated, userName],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider.')
  }
  return context
}
