import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { motion, AnimatePresence } from 'framer-motion'

const NAV_LINKS = [
  ['/', 'HOME'],
  ['/collections', 'COLLECTIONS'],
  ['/category/Oversized Tees', 'OVERSIZED'],
  ['/category/Graphic Tees', 'GRAPHIC'],
  ['/design', 'DESIGN YOURS'],
  ['/track', 'TRACK ORDER'],
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const { totalItems, setIsOpen } = useCart()
  const { wishlist } = useWishlist()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const isActive = path => pathname === path

  function handleLogout() {
    logout()
    setMenuOpen(false)
    navigate('/')
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-white/10">
        <div className="max-w-full px-4 md:px-6 h-16 grid grid-cols-[1fr_auto_1fr] items-center gap-2">

          {/* Left: Hamburger (mobile/tablet) | Nav links (desktop) */}
          <div className="flex items-center min-w-0 justify-self-start">
            {/* Hamburger button */}
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="xl:hidden flex flex-col justify-center items-center w-10 h-10 gap-[5px] flex-shrink-0"
              aria-label="Menu"
            >
              <span className={`block w-5 h-0.5 bg-white origin-center transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
              <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'opacity-0 scale-x-0' : ''}`} />
              <span className={`block w-5 h-0.5 bg-white origin-center transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
            </button>

            {/* Desktop nav */}
            <div className="hidden xl:flex items-center gap-6 xl:gap-8 min-w-0">
              {NAV_LINKS.slice(0, 5).map(([to, label]) => (
                <Link key={to} to={to}
                  className={`text-xs font-bold tracking-widest transition-colors whitespace-nowrap ${
                    isActive(to) ? 'text-[#C8F135]' : 'text-white/60 hover:text-white'
                  }`}>
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Center: Logo */}
          <Link to="/" className="justify-self-center flex-shrink-0">
            <img src="/logo.png" alt="BASTIN'S" className="h-7 md:h-8 w-auto object-contain" />
          </Link>

          {/* Right: Actions */}
          <div className="flex items-center gap-3 xl:gap-5 justify-self-end min-w-0">
            <Link to="/track" className={`text-xs font-bold tracking-widest transition-colors hidden xl:block whitespace-nowrap ${
              isActive('/track') ? 'text-[#C8F135]' : 'text-white/60 hover:text-white'
            }`}>
              TRACK ORDER
            </Link>
            {user?.role === 'admin' && (
              <Link to="/admin" className={`text-xs font-bold tracking-widest hidden xl:block transition-colors whitespace-nowrap ${
                isActive('/admin') ? 'text-[#C8F135]' : 'text-white/60 hover:text-white'
              }`}>
                DASHBOARD
              </Link>
            )}
            {user ? (
              <>
                <span className="text-xs font-bold tracking-widest text-white/60 hidden xl:block whitespace-nowrap">
                  {user.name?.split(' ')[0].toUpperCase()}
                </span>
                <button onClick={handleLogout} className="text-xs font-bold tracking-widest text-white/40 hover:text-white transition-colors hidden xl:block whitespace-nowrap">
                  LOGOUT
                </button>
              </>
            ) : (
              <Link to="/login" className={`text-xs font-bold tracking-widest transition-colors hidden xl:block whitespace-nowrap ${
                isActive('/login') ? 'text-[#C8F135]' : 'text-white/60 hover:text-white'
              }`}>
                SIGN IN
              </Link>
            )}

            {/* Wishlist icon */}
            <Link to="/wishlist" className="relative flex items-center group">
              <svg className="w-5 h-5 text-white/70 group-hover:text-[#C8F135] transition-colors"
                fill={wishlist.length > 0 ? '#C8F135' : 'none'}
                stroke={wishlist.length > 0 ? '#C8F135' : 'currentColor'} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z" />
              </svg>
              {wishlist.length > 0 && (
                <span className="absolute -top-2 -right-2 text-black text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center" style={{ background: '#C8F135' }}>
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart icon */}
            <button onClick={() => setIsOpen(true)} className="relative flex items-center gap-1.5 group">
              <svg className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 text-black text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center" style={{ background: '#C8F135' }}>
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 bg-black/70 z-40 xl:hidden"
            />

            {/* Slide-in drawer */}
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.28 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] bg-black border-r border-white/10 z-50 xl:hidden flex flex-col"
            >
              {/* Drawer header */}
              <div className="h-16 flex items-center justify-between px-5 border-b border-white/10 flex-shrink-0">
                <img src="/logo.png" alt="BASTIN'S" className="h-7 w-auto object-contain" />
                <button onClick={() => setMenuOpen(false)} className="text-white/40 hover:text-white p-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Links */}
              <div className="flex-1 overflow-y-auto py-2">
                {NAV_LINKS.map(([to, label], i) => (
                  <Link key={to} to={to} onClick={() => setMenuOpen(false)}
                    className={`flex items-center justify-between px-5 py-4 text-xs font-black tracking-widest uppercase hover:text-white hover:bg-white/5 border-b border-white/5 transition-colors group ${
                      isActive(to) ? 'text-[#C8F135]' : 'text-white/50'
                    }`}>
                    {label}
                    <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
                {user?.role === 'admin' && (
                  <Link to="/admin" onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-between px-5 py-4 text-xs font-black tracking-widest uppercase border-b border-white/5 hover:bg-white/5 transition-colors"
                    style={{ color: isActive('/admin') ? '#C8F135' : 'rgba(255,255,255,0.5)' }}>
                    ADMIN PANEL
                    <svg className="w-3 h-3" fill="none" stroke={isActive('/admin') ? '#C8F135' : 'rgba(255,255,255,0.5)'} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                )}
              </div>

              {/* Drawer footer: auth */}
              <div className="px-5 py-5 border-t border-white/10 flex-shrink-0">
                {user ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-white/30 tracking-wider">Signed in as</p>
                      <p className="text-sm font-black text-white tracking-wide">{user.name?.toUpperCase()}</p>
                    </div>
                    <button onClick={handleLogout}
                      className="text-xs font-black tracking-widest uppercase text-red-400 hover:text-red-300 border border-red-400/30 px-3 py-2 hover:border-red-400 transition-colors">
                      LOGOUT
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Link to="/login" onClick={() => setMenuOpen(false)}
                      className="flex-1 text-center text-xs font-black tracking-widest uppercase py-3 border border-white/20 text-white/60 hover:text-white hover:border-white transition-colors">
                      SIGN IN
                    </Link>
                    <Link to="/register" onClick={() => setMenuOpen(false)}
                      className="flex-1 text-center text-xs font-black tracking-widest uppercase py-3 bg-white text-black hover:bg-[#C8F135] transition-colors">
                      JOIN
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
