import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import toast from 'react-hot-toast'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const { darkMode } = useTheme()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      toast.success('Welcome back!')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-black text-white' : 'bg-light text-black'} px-4`}>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
        className={`w-full max-w-md p-8 rounded-3xl ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-white border border-black/10'} shadow-2xl`}>
        <div className="text-center mb-8">
          <div className="text-3xl font-black mb-2"><span className="text-primary">BAST</span><span className="text-accent">INS</span></div>
          <h1 className="text-2xl font-black">Welcome back 👋</h1>
          <p className={`text-sm mt-1 ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>Login to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder="you@example.com"
              className={`w-full px-4 py-3 rounded-xl ${darkMode ? 'bg-white/10 border border-white/20 text-white placeholder-white/40' : 'bg-gray-50 border border-gray-200'} outline-none focus:border-primary text-sm`} />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              placeholder="••••••••"
              className={`w-full px-4 py-3 rounded-xl ${darkMode ? 'bg-white/10 border border-white/20 text-white placeholder-white/40' : 'bg-gray-50 border border-gray-200'} outline-none focus:border-primary text-sm`} />
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/80 transition-colors disabled:opacity-50">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2 text-sm">
          <Link to="/reset-password" className="text-primary hover:underline block">Forgot password?</Link>
          <span className={darkMode ? 'text-white/50' : 'text-gray-500'}>Don't have an account? </span>
          <Link to="/register" className="text-primary font-semibold hover:underline">Register</Link>
        </div>
      </motion.div>
    </div>
  )
}
