import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-black border-t border-white/10 py-14">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-10">
        <div className="col-span-2 md:col-span-1">
          <img src="/logo.png" alt="BASTIN'S" className="h-8 w-auto object-contain mb-3" />
          <p className="text-xs text-white/30 tracking-wider leading-relaxed mb-4">
            Gen Z Fashion.<br />Designed for the bold.
          </p>
          <div className="flex gap-3 text-xs font-bold text-white/30">
            <a href="#" className="hover:text-[#C8F135] transition-colors">IG</a>
            <a href="#" className="hover:text-[#C8F135] transition-colors">TW</a>
            <a href="#" className="hover:text-[#C8F135] transition-colors">YT</a>
          </div>
        </div>
        {[
          { title: 'Shop', links: [['/', 'Home'], ['/collections', 'All Products'], ['/category/Oversized Tees', 'Oversized'], ['/category/Graphic Tees', 'Graphic Tees'], ['/design', 'Design Yours']] },
          { title: 'Account', links: [['/login', 'Sign In'], ['/register', 'Sign Up'], ['/account', 'My Account'], ['/cart', 'Cart'], ['/track', 'Track Order']] },
          { title: 'Company', links: [['/about', 'About Us'], ['/contact', 'Contact Us'], ['/terms', 'Terms & Conditions'], ['/privacy', 'Privacy Policy']] }
        ].map(col => (
          <div key={col.title}>
            <p className="text-xs font-bold tracking-[0.25em] text-white/30 uppercase mb-4">{col.title}</p>
            <div className="flex flex-col gap-2.5">
              {col.links.map(([to, label]) => (
                <Link key={to} to={to} className="text-xs text-white/40 hover:text-white transition-colors tracking-wider">{label}</Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="max-w-7xl mx-auto px-6 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-2">
        <p className="text-xs text-white/20 tracking-widest">© 2024 BASTIN'S CLOTHING. ALL RIGHTS RESERVED.</p>
        <div className="flex gap-4 text-xs text-white/20">
          <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
          <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
        </div>
      </div>
    </footer>
  )
}
