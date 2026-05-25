import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function About() {
  return (
    <div className="min-h-screen bg-black text-white pt-16">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs tracking-[0.4em] uppercase text-[#C8F135] mb-4">Our Story</p>
          <h1 className="text-6xl font-black tracking-tighter mb-10">ABOUT<br />BASTIN'S</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-16">
            <div className="space-y-6 text-white/60 leading-relaxed">
              <p>BASTIN'S was born from a simple idea: fashion should speak louder than words. Founded in 2024, we set out to create a t-shirt brand that truly resonates with the Gen Z generation — bold, authentic, and unapologetically you.</p>
              <p>We believe clothing is more than fabric. It's your identity, your mood, your message to the world. Every piece we create is designed with that philosophy at heart.</p>
              <p>From oversized streetwear staples to limited-edition graphic drops, our collections are built for those who refuse to blend in.</p>
            </div>
            <div className="space-y-6 text-white/60 leading-relaxed">
              <p>Our design process starts with culture — music, art, street life, and the internet. We translate what's happening right now into wearable pieces that feel current, fresh, and timeless at once.</p>
              <p>Every BASTIN'S tee is made with premium cotton and printed with high-quality inks that last wash after wash. We don't compromise on quality because you shouldn't have to.</p>
              <p>Welcome to the family. Wear your vibe.</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-px bg-white/10 mb-16">
            {[['2024', 'Founded'], ['8+', 'Collections'], ['500+', 'Happy Customers']].map(([val, label]) => (
              <div key={label} className="bg-black p-8 text-center">
                <p className="text-4xl font-black text-[#C8F135] mb-1">{val}</p>
                <p className="text-xs tracking-[0.25em] uppercase text-white/40">{label}</p>
              </div>
            ))}
          </div>

          <div className="border border-white/10 p-10 text-center">
            <h2 className="text-3xl font-black mb-4">WEAR YOUR VIBE</h2>
            <p className="text-white/50 mb-6">Explore our latest collections and find your style.</p>
            <Link to="/collections" className="bg-white text-black font-black px-8 py-3 text-xs tracking-widest uppercase hover:bg-[#C8F135] transition-colors">
              SHOP NOW →
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
