import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

export default function Footer() {
  const { darkMode } = useTheme()
  return (
    <footer className={`${darkMode ? 'bg-black text-white/60' : 'bg-gray-100 text-gray-600'} mt-20 py-10`}>
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="text-2xl font-black mb-3">
            <span className="text-primary">BAST</span><span className="text-accent">INS</span>
          </div>
          <p className="text-sm">Gen Z Fashion. Designed for the bold.</p>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-white">Quick Links</h4>
          <div className="flex flex-col gap-2 text-sm">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <Link to="/collections" className="hover:text-primary transition-colors">Collections</Link>
            <Link to="/design" className="hover:text-primary transition-colors">Design Your Own</Link>
            <Link to="/track" className="hover:text-primary transition-colors">Track Order</Link>
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-white">Account</h4>
          <div className="flex flex-col gap-2 text-sm">
            <Link to="/login" className="hover:text-primary transition-colors">Login</Link>
            <Link to="/register" className="hover:text-primary transition-colors">Register</Link>
            <Link to="/cart" className="hover:text-primary transition-colors">Cart</Link>
          </div>
        </div>
      </div>
      <div className="text-center text-xs mt-8 opacity-50">
        © 2024 BASTINS. Built with ❤️ for Gen Z Fashion.
      </div>
    </footer>
  )
}
