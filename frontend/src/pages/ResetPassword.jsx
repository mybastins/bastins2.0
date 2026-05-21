import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import toast from 'react-hot-toast'

export default function ResetPassword() {
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { resetPassword } = useAuth()
  const { darkMode } = useTheme()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await resetPassword(email, newPassword)
      toast.success('Password reset successfully!')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Reset failed')
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
          <h1 className="text-2xl font-black">Reset Password 🔐</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="your@email.com"
              className={`w-full px-4 py-3 rounded-xl ${darkMode ? 'bg-white/10 border border-white/20 text-white placeholder-white/40' : 'bg-gray-50 border border-gray-200'} outline-none focus:border-primary text-sm`} />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">New Password</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required placeholder="New password"
              className={`w-full px-4 py-3 rounded-xl ${darkMode ? 'bg-white/10 border border-white/20 text-white placeholder-white/40' : 'bg-gray-50 border border-gray-200'} outline-none focus:border-primary text-sm`} />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/80 transition-colors disabled:opacity-50">
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm">
          <Link to="/login" className="text-primary hover:underline">Back to Login</Link>
        </div>
      </motion.div>
    </div>
  )
}
