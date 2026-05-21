import { createContext, useContext, useState } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })
  const [token, setToken] = useState(() => localStorage.getItem('token'))

  async function login(email, password) {
    const { data } = await axios.post('/api/auth/login', { email, password })
    setUser(data.user)
    setToken(data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    localStorage.setItem('token', data.token)
    return data
  }

  async function register(name, email, password) {
    const { data } = await axios.post('/api/auth/register', { name, email, password })
    setUser(data.user)
    setToken(data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    localStorage.setItem('token', data.token)
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
