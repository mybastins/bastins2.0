import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={onChange}
      className="relative flex-shrink-0 w-14 h-8 rounded-full transition-colors duration-300"
      style={{ background: checked ? '#C8F135' : 'rgba(255,255,255,0.1)' }}
    >
      <motion.span
        className="absolute top-1 left-1 w-6 h-6 rounded-full bg-black"
        animate={{ x: checked ? 24 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  )
}

export default function AdminSettings() {
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [methods, setMethods] = useState({ cod: true, payu: false })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user?.role !== 'admin') { navigate('/admin/login'); return }
    axios.get('/api/settings/payment-methods')
      .then(({ data }) => setMethods(data))
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false))
  }, [user])

  async function toggle(key) {
    const next = { ...methods, [key]: !methods[key] }
    setMethods(next)
    setSaving(true)
    try {
      await axios.put('/api/settings/payment-methods', next, { headers: { Authorization: `Bearer ${token}` } })
      toast.success('Settings saved')
    } catch {
      setMethods(methods) // revert on failure
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (user?.role !== 'admin') return null

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-[#C8F135] mb-1">Admin</p>
            <h1 className="text-4xl font-black tracking-tight">SETTINGS</h1>
          </div>
          <button onClick={() => navigate('/admin')}
            className="text-xs font-bold tracking-widest border border-white/10 px-4 py-2 text-white/40 hover:text-white transition-colors">
            ← DASHBOARD
          </button>
        </div>

        {loading ? (
          <p className="text-white/30">Loading...</p>
        ) : (
          <div className="border border-white/10 p-6">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-white/40 mb-1">Payment Methods</p>
            <p className="text-xs text-white/20 mb-6">Control which payment options customers see at checkout.</p>

            <div className="space-y-5">
              <div className="flex items-center justify-between gap-4 pb-5 border-b border-white/10">
                <div>
                  <p className="text-sm font-black tracking-wide text-white">Cash on Delivery</p>
                  <p className="text-[10px] text-white/30 mt-0.5">Customer pays when the order is delivered.</p>
                </div>
                <Toggle checked={methods.cod} onChange={() => toggle('cod')} />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-black tracking-wide text-white">PayU (Online Payment)</p>
                  <p className="text-[10px] text-white/30 mt-0.5">Cards, UPI, and wallets via PayU. Requires PAYU_MERCHANT_KEY and PAYU_SALT to be configured on the server.</p>
                </div>
                <Toggle checked={methods.payu} onChange={() => toggle('payu')} />
              </div>
            </div>

            {!methods.cod && !methods.payu && (
              <p className="text-xs text-red-400 mt-6">Warning: no payment methods are enabled — customers won't be able to check out.</p>
            )}
            {saving && <p className="text-[10px] text-white/20 mt-6">Saving...</p>}
          </div>
        )}
      </div>
    </div>
  )
}
