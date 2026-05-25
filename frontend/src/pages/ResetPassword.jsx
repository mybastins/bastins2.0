import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function ResetPassword() {
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { resetPassword } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    if (newPassword.length < 6) return toast.error('Password must be at least 6 characters')
    setLoading(true)
    try {
      await resetPassword(email, newPassword)
      toast.success('Password reset! Please sign in.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Reset failed')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full bg-zinc-900 border border-white/10 text-white px-4 py-3 text-sm focus:border-[#C8F135] outline-none transition-colors placeholder-white/20"

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#C8F135]/5 rounded-full blur-3xl" />
      </div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10">

        <div className="text-center mb-10">
          <Link to="/" className="text-3xl font-black tracking-tighter">
            BASTIN<span style={{ color: '#C8F135' }}>'S</span>
          </Link>
          <p className="text-xs tracking-[0.3em] uppercase text-white/30 mt-2">Reset Password</p>
        </div>

        <div className="border border-white/10 p-8 bg-zinc-950">
          <h1 className="text-2xl font-black tracking-tight mb-1">RESET PASSWORD</h1>
          <p className="text-white/30 text-sm mb-8">Enter your email and a new password</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold tracking-[0.2em] uppercase text-white/40 block mb-1.5">Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" required className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-bold tracking-[0.2em] uppercase text-white/40 block mb-1.5">New Password</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                placeholder="Min. 6 characters" required className={inputClass} />
            </div>
            <motion.button type="submit" whileTap={{ scale: 0.97 }} disabled={loading}
              className="w-full bg-white text-black font-black py-4 text-xs tracking-widest uppercase hover:bg-[#C8F135] transition-colors disabled:opacity-40 mt-2">
              {loading ? 'RESETTING...' : 'RESET PASSWORD →'}
            </motion.button>
          </form>
        </div>

        <div className="text-center mt-5">
          <Link to="/login" className="text-xs text-white/30 hover:text-[#C8F135] transition-colors tracking-widest uppercase">
            ← Back to Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
