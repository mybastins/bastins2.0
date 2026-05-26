import { createContext, useContext, useState } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user')
      if (!saved || saved === 'undefined' || saved === 'null') return null
      const parsed = JSON.parse(saved)
      if (parsed && typeof parsed === 'object' && parsed.id) return parsed
      return null
    } catch { return null }
  })

  const [token, setToken] = useState(() => {
    try { return localStorage.getItem('token') || null } catch { return null }
  })

  async function login(email, password) {
    const { data } = await axios.post('/api/auth/login', { email, password })
    if (data.user) {
      setUser(data.user)
      localStorage.setItem('user', JSON.stringify(data.user))
    }
    if (data.token) {
      setToken(data.token)
      localStorage.setItem('token', data.token)
    }
    return data
  }

  async function register(name, email, password) {
    const { data } = await axios.post('/api/auth/register', { name, email, password })
    if (data.user) {
      setUser(data.user)
      localStorage.setItem('user', JSON.stringify(data.user))
    }
    if (data.token) {
      setToken(data.token)
      localStorage.setItem('token', data.token)
    }
    return data
  }

  async function resetPassword(email, newPassword) {
    const { data } = await axios.post('/api/auth/reset-password', { email, newPassword })
    return data
  }

  function logout() {
    setUser(null)
    setToken(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  const authAxios = axios.create()
  authAxios.interceptors.request.use(config => {
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  })

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, resetPassword, authAxios }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
