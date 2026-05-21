import { Link, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { motion } from 'framer-motion'

export default function Navbar() {
  const { darkMode, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const { totalItems, setIsOpen } = useCart()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 ${darkMode ? 'bg-black/90 text-white' : 'bg-white/90 text-black'} backdrop-blur-md border-b ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-2xl font-black tracking-tighter">
          <span className="text-primary">BAST</span><span className="text-accent">INS</span>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <Link to="/collections" className="hover:text-primary transition-colors">Collections</Link>
          <Link to="/category/Oversized Tees" className="hover:text-primary transition-colors">Oversized</Link>
          <Link to="/design" className="hover:text-primary transition-colors">Design Yours</Link>
          <Link to="/track" className="hover:text-primary transition-colors">Track Order</Link>
          {user?.role === 'admin' && (
            <Link to="/admin" className="text-accent hover:text-primary transition-colors">Admin</Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-primary/20 transition-colors text-lg">
            {darkMode ? '☀️' : '🌙'}
          </button>

          <button onClick={() => setIsOpen(true)} className="relative p-2 rounded-full hover:bg-primary/20 transition-colors">
            🛒
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {totalItems}
              </span>
            )}
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              <Link to="/cart" className={`text-sm font-medium px-3 py-1.5 rounded-full ${darkMode ? 'bg-white/10' : 'bg-black/10'}`}>
                {user.name.split(' ')[0]}
              </Link>
              <button onClick={handleLogout} className="text-sm text-red-400 hover:text-red-300">Logout</button>
            </div>
          ) : (
            <Link to="/login" className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-primary/80 transition-colors">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
