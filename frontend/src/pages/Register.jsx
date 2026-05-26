import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    if (password.length < 6) return toast.error('Password must be at least 6 characters')
    if (password !== confirm) return toast.error('Passwords do not match')
    setLoading(true)
    try {
      await register(name, email, password)
      toast.success('Account created! Welcome to BASTIN\'S')
      navigate('/')
    } catch (err) {
      toast.error(String(err.response?.data?.error || 'Registration failed'))
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full bg-zinc-900 border border-white/10 text-white px-4 py-3 text-sm focus:border-[#C8F135] outline-none transition-colors placeholder-white/20"

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-12">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#C8F135]/5 rounded-full blur-3xl" />
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
          <p className="text-xs tracking-[0.3em] uppercase text-white/30 mt-2">Create Account</p>
        </div>

        {/* Card */}
        <div className="border border-white/10 p-8 bg-zinc-950">
          <h1 className="text-2xl font-black tracking-tight mb-1">JOIN BASTIN'S</h1>
          <p className="text-white/30 text-sm mb-8">Create your free account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold tracking-[0.2em] uppercase text-white/40 block mb-1.5">Full Name</label>
              <input
                type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="Your Name" required autoComplete="name"
                className={inputClass}
              />
            </div>

            <div>
              <label className="text-xs font-bold tracking-[0.2em] uppercase text-white/40 block mb-1.5">Email Address</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" required autoComplete="email"
                className={inputClass}
              />
            </div>

            <div>
              <label className="text-xs font-bold tracking-[0.2em] uppercase text-white/40 block mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 6 characters" required autoComplete="new-password"
                  className={inputClass + ' pr-12'}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white/30 hover:text-white transition-colors font-bold tracking-wider">
                  {showPass ? 'HIDE' : 'SHOW'}
                </button>
              </div>
              {/* Password strength bar */}
              {password.length > 0 && (
                <div className="flex gap-1 mt-2">
                  {[1,2,3,4].map(i => (
                    <div key={i} className={`flex-1 h-0.5 transition-colors ${
                      password.length >= i * 3
                        ? i <= 2 ? 'bg-yellow-500' : i === 3 ? 'bg-blue-400' : 'bg-[#C8F135]'
                        : 'bg-white/10'
                    }`} />
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-bold tracking-[0.2em] uppercase text-white/40 block mb-1.5">Confirm Password</label>
              <input
                type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                placeholder="Re-enter password" required autoComplete="new-password"
                className={inputClass + (confirm && confirm !== password ? ' border-red-500/50' : confirm && confirm === password ? ' border-[#C8F135]/50' : '')}
              />
              {confirm && confirm !== password && (
                <p className="text-xs text-red-400 mt-1">Passwords don't match</p>
              )}
            </div>

            <motion.button
              type="submit" whileTap={{ scale: 0.97 }} disabled={loading}
              className="w-full bg-white text-black font-black py-4 text-xs tracking-widest uppercase hover:bg-[#C8F135] transition-colors disabled:opacity-40 mt-2"
            >
              {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT →'}
            </motion.button>
          </form>
        </div>

        {/* Sign in link */}
        <div className="text-center mt-5 text-sm">
          <span className="text-white/30">Already have an account? </span>
          <Link to="/login" className="font-black text-white hover:text-[#C8F135] transition-colors tracking-wider">
            SIGN IN
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
