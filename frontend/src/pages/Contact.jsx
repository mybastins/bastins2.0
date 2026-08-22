import { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setSent(true)
    toast.success('Message sent! We\'ll get back to you soon.')
    setForm({ name: '', email: '', subject: '', message: '' })
    setTimeout(() => setSent(false), 3000)
  }

  const inputClass = "w-full bg-zinc-900 border border-white/10 text-white px-4 py-3 text-sm focus:border-[#C8F135] outline-none transition-colors placeholder-white/20"

  return (
    <div className="min-h-screen bg-black text-white pt-16">
      <div className="max-w-5xl mx-auto px-6 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs tracking-[0.4em] uppercase text-[#C8F135] mb-4">Get In Touch</p>
          <h1 className="text-6xl font-black tracking-tighter mb-12">CONTACT US</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {[['name','Your Name','text'],['email','Email Address','email'],['subject','Subject','text']].map(([name, label, type]) => (
                <div key={name}>
                  <label className="text-xs text-white/40 tracking-widest uppercase block mb-1">{label}</label>
                  <input type={type} value={form[name]} onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
                    placeholder={label} required className={inputClass} />
                </div>
              ))}
              <div>
                <label className="text-xs text-white/40 tracking-widest uppercase block mb-1">Message</label>
                <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="Your message..." required rows={5} className={inputClass + ' resize-none'} />
              </div>
              <button type="submit" className="w-full bg-white text-black font-black py-4 text-xs tracking-widest uppercase hover:bg-[#C8F135] transition-colors">
                SEND MESSAGE →
              </button>
            </form>

            {/* Info */}
            <div className="space-y-8">
              {[
                { label: 'Email', value: 'mybastins@gmail.com', icon: '✉' },
                { label: 'WhatsApp', value: '+91 96772 31919', icon: '💬' },
                { label: 'Hours', value: 'Mon–Sat, 10am–6pm IST', icon: '🕐' },
                { label: 'Response Time', value: 'Within 24 hours', icon: '⚡' }
              ].map(item => (
                <div key={item.label} className="flex gap-4 items-start">
                  <div className="text-2xl">{item.icon}</div>
                  <div>
                    <p className="text-xs tracking-[0.25em] uppercase text-white/30 mb-1">{item.label}</p>
                    <p className="text-white font-semibold">{item.value}</p>
                  </div>
                </div>
              ))}
              <div className="border-t border-white/10 pt-8">
                <p className="text-xs tracking-[0.25em] uppercase text-white/30 mb-3">Follow Us</p>
                <div className="flex gap-4 text-white/60 text-sm font-bold">
                  <a href="#" className="hover:text-[#C8F135] transition-colors">INSTAGRAM</a>
                  <a href="#" className="hover:text-[#C8F135] transition-colors">TWITTER</a>
                  <a href="#" className="hover:text-[#C8F135] transition-colors">YOUTUBE</a>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
