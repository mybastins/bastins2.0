import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { motion } from 'framer-motion'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { totalItems, setIsOpen } = useCart()
  const { wishlist } = useWishlist()
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
        </div>

        {/* Center: Logo */}
        <Link to="/" className="absolute left-1/2 -translate-x-1/2">
          <img src="/logo.png" alt="BASTIN'S" className="h-8 w-auto object-contain" />
        </Link>

        {/* Right: Actions */}
        <div className="flex items-center gap-5 ml-auto">
          <Link to="/track" className="text-xs font-bold tracking-widest text-white/60 hover:text-white transition-colors hidden md:block">
            TRACK ORDER
          </Link>

          {user?.role === 'admin' && (
            <Link to="/admin" className="text-xs font-bold tracking-widest hidden md:block transition-colors" style={{ color: '#C8F135' }}>
              ADMIN
            </Link>
          )}

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

          {/* Wishlist */}
          <Link to="/wishlist" className="relative flex items-center group">
            <svg className="w-5 h-5 text-white/70 group-hover:text-[#C8F135] transition-colors" fill={wishlist.length > 0 ? '#C8F135' : 'none'} stroke={wishlist.length > 0 ? '#C8F135' : 'currentColor'} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z" />
            </svg>
            {wishlist.length > 0 && (
              <span className="absolute -top-2 -right-2 text-black text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center" style={{ background: '#C8F135' }}>
                {wishlist.length}
              </span>
            )}
          </Link>

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
