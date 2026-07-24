import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import CartSidebar from './components/CartSidebar'
import ScrollToTop from './components/ScrollToTop'

import Home from './pages/Home'
import Collections from './pages/Collections'
import Category from './pages/Category'
import ProductDetail from './pages/ProductDetail'
import DesignYourOwn from './pages/DesignYourOwn'
import Login from './pages/Login'
import Register from './pages/Register'
import ResetPassword from './pages/ResetPassword'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderSuccess from './pages/OrderSuccess'
import OrderTracking from './pages/OrderTracking'
import Account from './pages/Account'
import Wishlist from './pages/Wishlist'
import About from './pages/About'
import Contact from './pages/Contact'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'

import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/Dashboard'
import ProductManagement from './pages/admin/ProductManagement'
import AdminOrders from './pages/admin/Orders'
import AdminCustomers from './pages/admin/Customers'

function Layout({ children }) {
  const { pathname } = useLocation()
  const isAdmin = pathname.startsWith('/admin')
  return (
    <>
      {!isAdmin && <Navbar />}
      {!isAdmin && <CartSidebar />}
      {children}
      {!isAdmin && <Footer />}
    </>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
        <WishlistProvider>
          <BrowserRouter>
            <Toaster position="bottom-right" toastOptions={{
              style: { background: '#111', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', fontSize: '13px' }
            }} />
            <ScrollToTop />
            <Layout>
              <Routes>
                {/* Customer Pages */}
                <Route path="/" element={<Home />} />
                <Route path="/collections" element={<Collections />} />
                <Route path="/category/:name" element={<Category />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/design" element={<DesignYourOwn />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-success" element={<OrderSuccess />} />
                <Route path="/track" element={<OrderTracking />} />
                <Route path="/account" element={<Account />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                {/* Admin Pages */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/products" element={<ProductManagement />} />
                <Route path="/admin/orders" element={<AdminOrders />} />
                <Route path="/admin/customers" element={<AdminCustomers />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
