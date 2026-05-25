import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { motion } from 'framer-motion'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { totalItems, setIsOpen } = useCart()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-white/10">
      <div className="max-w-full px-6 h-16 flex items-center justify-between">

        {/* Left: Nav links */}
        <div className="hidden md:flex items-center gap-8">
          {[['/', 'HOME'], ['/collections', 'COLLECTIONS'], ['/category/Oversized Tees', 'OVERSIZED'], ['/category/Graphic Tees', 'GRAPHIC'], ['/design', 'DESIGN YOURS']].map(([to, label]) => (
            <Link
              key={to}
              to={to}
              className="text-xs font-bold tracking-widest text-white/60 hover:text-white transition-colors"
            >
              {label}
            </Link>
          ))}
          {user?.role === 'admin' && (
            <Link to="/admin" className="text-xs font-bold tracking-widest transition-colors" style={{ color: '#C8F135' }}>
              ADMIN
            </Link>
          )}
        </div>

        {/* Center: Logo */}
        <Link to="/" className="absolute left-1/2 -translate-x-1/2 text-xl font-black tracking-tighter text-white">
          BASTIN<span style={{ color: '#C8F135' }}>'S</span>
        </Link>

        {/* Right: Actions */}
        <div className="flex items-center gap-5 ml-auto">
          <Link to="/track" className="text-xs font-bold tracking-widest text-white/60 hover:text-white transition-colors hidden md:block">
            TRACK ORDER
          </Link>

          {user ? (
            <>
              <span className="text-xs font-bold tracking-widest text-white/60 hidden md:block">
                {user.name.split(' ')[0].toUpperCase()}
              </span>
              <button onClick={handleLogout} className="text-xs font-bold tracking-widest text-white/40 hover:text-white transition-colors hidden md:block">
                LOGOUT
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-xs font-bold tracking-widest text-white/60 hover:text-white transition-colors">
                SIGN IN
              </Link>
              <Link to="/register" className="text-xs font-bold tracking-widest text-white/60 hover:text-white transition-colors hidden md:block">
                SIGN UP
              </Link>
            </>
          )}

          {/* Cart */}
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
  )
}
