import { Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import AnnouncementBar from './components/AnnouncementBar'
import Header from './components/Header'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'

import Home from './pages/Home'
import Shop from './pages/Shop'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderSuccess from './pages/OrderSuccess'
import About from './pages/About'
import Music from './pages/Music'
import Contact from './pages/Contact'
import NotFound from './pages/NotFound'

import AdminLayout from './pages/admin/AdminLayout'
import AdminLogin from './pages/admin/Login'
import AdminDashboard from './pages/admin/Dashboard'
import AdminProducts from './pages/admin/Products'
import AdminProductForm from './pages/admin/ProductForm'
import AdminOrders from './pages/admin/Orders'
import AdminCategories from './pages/admin/Categories'
import AdminMusic from './pages/admin/Music'

function StoreLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-de-bg text-de-text">
      <AnnouncementBar />
      <Header />
      <CartDrawer />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:slug" element={<Product />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/order/:reference" element={<OrderSuccess />} />
          <Route path="/about" element={<About />} />
          <Route path="/music" element={<Music />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <CartProvider>
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/new" element={<AdminProductForm />} />
          <Route path="products/:id/edit" element={<AdminProductForm />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="music" element={<AdminMusic />} />
        </Route>
        <Route path="/*" element={<StoreLayout />} />
      </Routes>
    </CartProvider>
  )
}
