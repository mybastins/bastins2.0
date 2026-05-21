import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'
import ProductCard from '../components/ProductCard'
import { useTheme } from '../context/ThemeContext'

export default function Home() {
  const [products, setProducts] = useState([])
  const { darkMode } = useTheme()

  useEffect(() => {
    axios.get('/api/products/all').then(r => setProducts(r.data.slice(0, 4))).catch(() => {})
  }, [])

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-light text-black'}`}>
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 overflow-hidden">
          <div className="blob absolute top-20 left-20 w-96 h-96 bg-primary/20 blur-3xl" />
          <div className="blob absolute bottom-20 right-20 w-80 h-80 bg-accent/20 blur-3xl" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-block bg-accent text-black text-xs font-bold px-4 py-2 rounded-full mb-6">
              NEW COLLECTION 2024 🔥
            </div>
            <h1 className="text-6xl md:text-8xl font-black leading-none mb-6 tracking-tighter">
              <span className="text-primary">BASTIN'S</span>
              <br />
              <span className="text-accent">CLOTHING</span>
            </h1>
            <p className={`text-lg md:text-xl mb-8 max-w-xl mx-auto ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>
              Gen Z fashion that speaks louder than words. Custom tees, bold designs, your style — your rules.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link to="/collections" className="bg-primary text-white font-bold px-8 py-4 rounded-full text-lg hover:bg-primary/80 transition-all hover:scale-105">
                Shop Now
              </Link>
              <Link to="/design" className="border-2 border-accent text-accent font-bold px-8 py-4 rounded-full text-lg hover:bg-accent hover:text-black transition-all hover:scale-105">
                Design Yours
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-4xl font-black mb-2 text-center">Shop by <span className="text-primary">Category</span></h2>
          <p className={`text-center mb-12 ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>Find your aesthetic</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Oversized Tees', 'Graphic Tees', 'Vintage', 'Minimal'].map((cat, i) => (
              <Link key={cat} to={`/category/${cat}`}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className={`rounded-2xl p-6 text-center ${darkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-white hover:bg-gray-50'} border ${darkMode ? 'border-white/10' : 'border-black/10'} transition-colors cursor-pointer`}
                >
                  <div className="text-4xl mb-3">
                    {['👕', '🎨', '🕰️', '✨'][i]}
                  </div>
                  <div className="font-bold text-sm">{cat}</div>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Featured Products */}
      <section className="py-10 px-4 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-4xl font-black mb-2 text-center">Featured <span className="text-accent">Drops</span></h2>
          <p className={`text-center mb-12 ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>Our hottest picks right now</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <ProductCard product={p} />
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/collections" className="bg-primary text-white font-bold px-8 py-3 rounded-full hover:bg-primary/80 transition-colors">
              View All Products
            </Link>
          </div>
        </motion.div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-primary to-purple-600 rounded-3xl p-12 text-center text-white">
          <h2 className="text-4xl font-black mb-4">Design Your Own Tee 🎨</h2>
          <p className="text-lg opacity-90 mb-8">Upload your art, pick your colors, and wear something truly yours.</p>
          <Link to="/design" className="bg-accent text-black font-black px-8 py-4 rounded-full text-lg hover:scale-105 transition-transform inline-block">
            Start Designing →
          </Link>
        </div>
      </section>
    </div>
  )
}
