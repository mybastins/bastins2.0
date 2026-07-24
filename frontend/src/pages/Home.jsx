import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const PANELS = [
  {
    image: '/images/hero-oversized.jpg',
    tag: 'NEW SEASON',
    title: 'OVERSIZED\nCOLLECTION',
    cta: 'Shop Now',
    link: '/category/Oversized Tees',
    accent: 'silver',
  },
  {
    image: '/images/hero-brand.jpg',
    tag: 'SS 2024',
    title: "BASTIN'S\nCLOTHING",
    cta: null,
    link: null,
    accent: 'neon',
    textOnly: true,
  },
  {
    image: '/images/hero-graphic.png',
    tag: 'BOLD PRINTS',
    title: 'GRAPHIC\nTEES',
    cta: 'Explore',
    link: '/category/Graphic Tees',
    accent: 'silver',
  },
  {
    image: '/images/hero-design.jpg',
    tag: 'MAKE IT YOURS',
    title: 'DESIGN\nYOUR OWN',
    cta: 'Start Designing',
    link: '/design',
    accent: 'neon',
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">

      {/* ── HERO: 4-Panel Grid ── */}
      <section className="pt-16 w-full h-[70vh] md:h-screen grid grid-cols-2 md:grid-cols-4">
        {PANELS.map((panel, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: i * 0.15 }}
            className="relative overflow-hidden group"
          >
            {/* Background image */}
            <img
              src={panel.image}
              alt={panel.title}
              className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
            />

            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors duration-500" />

            {/* Vertical divider line */}
            {i < 3 && (
              <div className="absolute right-0 top-0 bottom-0 w-px bg-white/20 z-20" />
            )}

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-between p-3 md:p-8">
              {/* Top tag */}
              <div>
                <span
                  className="text-[9px] md:text-xs font-bold tracking-[0.2em] uppercase"
                  style={{ color: panel.accent === 'neon' ? '#C8F135' : '#C0C0C0' }}
                >
                  {panel.tag}
                </span>
              </div>

              {/* Bottom content */}
              <div>
                <h2 className="text-sm sm:text-lg md:text-xl lg:text-3xl xl:text-4xl font-black leading-tight tracking-tighter text-white mb-2 md:mb-5 whitespace-pre-line break-words">
                  {panel.title}
                </h2>

                {panel.cta && panel.link && (
                  <Link to={panel.link} className="relative z-20 inline-block">
                    <motion.div
                      whileHover={{ x: 6 }}
                      className="inline-flex items-center gap-3 group/btn"
                    >
                      <span className="text-sm font-bold tracking-widest uppercase text-white border-b border-white/40 pb-0.5 group-hover/btn:border-white transition-colors">
                        {panel.cta}
                      </span>
                      <span
                        className="text-lg transition-colors"
                        style={{ color: panel.accent === 'neon' ? '#C8F135' : '#C0C0C0' }}
                      >
                        →
                      </span>
                    </motion.div>
                  </Link>
                )}

                {/* Panel 2: brand statement instead of CTA */}
                {panel.textOnly && (
                  <p className="text-xs tracking-[0.2em] uppercase text-white/40">
                    Gen Z Fashion · Est. 2024
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </section>

      {/* ── TICKER STRIP ── */}
      <div className="border-y border-white/10 py-3 overflow-hidden bg-black">
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          className="flex gap-12 whitespace-nowrap"
        >
          {Array(8).fill(["NEW SEASON DROP", "FREE SHIPPING", "CUSTOM DESIGNS", "GEN Z FASHION", "OVERSIZED FITS", "GRAPHIC TEES"]).flat().map((t, i) => (
            <span key={i} className="text-xs font-bold tracking-[0.3em] uppercase text-white/30">
              {t} <span className="text-[#C8F135] mx-4">✦</span>
            </span>
          ))}
        </motion.div>
      </div>

      {/* ── CATEGORIES ── */}
      <section className="py-10 px-6 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="mb-6 md:mb-10">
            <p className="text-xs tracking-[0.3em] uppercase text-[#C0C0C0] mb-2">Browse</p>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter">CATEGORIES</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10">
            {[
              { name: 'Solid Plain T-shirts',     img: '/images/collection-solids.png' },
              { name: 'Graphic Printed T-shirts', img: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400&fit=crop&q=80' },
              { name: 'Oversized T-shirts',       img: '/images/collection-oversized.png' },
              { name: 'Hoodies',                  img: '/images/collection-hoodies.png' },
            ].map((cat) => (
              <Link key={cat.name} to="/collections">
                <motion.div whileHover="hover" className="relative aspect-square overflow-hidden group bg-black">
                  <img src={cat.img} alt={cat.name}
                    className="w-full h-full object-cover opacity-50 group-hover:opacity-70 group-hover:scale-105 transition-all duration-500" />
                  <div className="absolute inset-0 flex items-end p-5">
                    <div>
                      <p className="text-xs tracking-[0.2em] uppercase text-[#C0C0C0] mb-1">Shop</p>
                      <p className="text-xl font-black tracking-tight text-white">{cat.name}</p>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── FULL-WIDTH CTA ── */}
      <section className="mt-10 relative overflow-hidden">
        <img
          src="/images/cta-design-your-own.png"
          alt="Design Your Own"
          className="w-full h-96 object-cover opacity-40"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <p className="text-xs tracking-[0.4em] uppercase mb-4" style={{ color: '#C8F135' }}>
            Exclusive Feature
          </p>
          <h2 className="text-3xl md:text-5xl lg:text-7xl font-black tracking-tighter text-white mb-4 md:mb-6 px-4">
            DESIGN YOUR OWN TEE
          </h2>
          <Link to="/design">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="bg-white text-black font-black px-10 py-4 text-sm tracking-widest uppercase hover:bg-[#C8F135] transition-colors"
            >
              Start Designing →
            </motion.button>
          </Link>
        </div>
      </section>

    </div>
  )
}
