import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      toast.success('Welcome back!')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full bg-zinc-900 border border-white/10 text-white px-4 py-3 text-sm focus:border-[#C8F135] outline-none transition-colors placeholder-white/20"

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#C8F135]/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-block">
            <img src="/logo.png" alt="BASTIN'S" className="h-12 w-auto object-contain mx-auto" />
          </Link>
          <p className="text-xs tracking-[0.3em] uppercase text-white/30 mt-2">Member Sign In</p>
        </div>

        {/* Card */}
        <div className="border border-white/10 p-8 bg-zinc-950">
          <h1 className="text-2xl font-black tracking-tight mb-1">WELCOME BACK</h1>
          <p className="text-white/30 text-sm mb-8">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold tracking-[0.2em] uppercase text-white/40 block mb-1.5">Email / Username</label>
              <input
                type="text" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com or admin" required autoComplete="username"
                className={inputClass}
              />
            </div>

            <div>
              <label className="text-xs font-bold tracking-[0.2em] uppercase text-white/40 block mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required autoComplete="current-password"
                  className={inputClass + ' pr-12'}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white/30 hover:text-white transition-colors font-bold tracking-wider">
                  {showPass ? 'HIDE' : 'SHOW'}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link to="/reset-password" className="text-xs text-white/30 hover:text-[#C8F135] transition-colors tracking-wider">
                Forgot password?
              </Link>
            </div>

            <motion.button
              type="submit" whileTap={{ scale: 0.97 }} disabled={loading}
              className="w-full bg-white text-black font-black py-4 text-xs tracking-widest uppercase hover:bg-[#C8F135] transition-colors disabled:opacity-40 mt-2"
            >
              {loading ? 'SIGNING IN...' : 'SIGN IN →'}
            </motion.button>
          </form>
        </div>

        {/* Sign up link */}
        <div className="text-center mt-5 text-sm">
          <span className="text-white/30">Don't have an account? </span>
          <Link to="/register" className="font-black text-white hover:text-[#C8F135] transition-colors tracking-wider">
            CREATE ACCOUNT
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
