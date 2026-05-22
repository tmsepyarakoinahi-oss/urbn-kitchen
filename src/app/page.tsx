'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import { useAppStore } from '@/lib/store'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import HomePage from '@/components/HomePage'
import ProductsPage from '@/components/ProductsPage'
import ProductDetailPage from '@/components/ProductDetailPage'
import CartPage from '@/components/CartPage'
import AboutPage from '@/components/AboutPage'
import ContactPage from '@/components/ContactPage'
import AuthPages from '@/components/AuthPages'
import AdminDashboard from '@/components/AdminDashboard'
import CustomerPortal from '@/components/CustomerPortal'
import EmployeePortal from '@/components/EmployeePortal'
import AmcPage from '@/components/AmcPage'
import CheckoutPage from '@/components/CheckoutPage'
import OrderSuccessPage from '@/components/OrderSuccessPage'

// Hydration-safe client mount detection using useSyncExternalStore
const emptySubscribe = () => () => {}
function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,   // client snapshot
    () => false   // server snapshot
  )
}

export default function Home() {
  const { currentView } = useAppStore()
  const [seeded, setSeeded] = useState(false)
  const mounted = useIsMounted()

  // Seed database on first load
  useEffect(() => {
    if (seeded) return
    const seed = async () => {
      try {
        await fetch('/api/seed', { method: 'POST' })
        setSeeded(true)
      } catch (err) {
        console.error('Seed error:', err)
        setSeeded(true) // Continue anyway
      }
    }
    seed()
  }, [seeded])

  // Scroll to top on view change
  useEffect(() => {
    if (mounted) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [currentView, mounted])

  // Determine if footer should show
  const showFooter = !['admin', 'employee-portal'].includes(currentView)

  // Show minimal skeleton during SSR to prevent hydration mismatches
  // (browser extensions like 1Password add fdprocessedid attributes to buttons/inputs)
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] text-white flex flex-col">
        <div className="h-16 bg-[#0b0b0b]/80 backdrop-blur-sm border-b border-[#1a1a1a]" />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 border-[#59ff00]/30 border-t-[#59ff00] rounded-full animate-spin" />
            <p className="text-gray-500 text-sm">Loading...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white flex flex-col" suppressHydrationWarning>
      <Navbar />

      <main className="flex-1">
        {currentView === 'home' && <HomePage />}
        {currentView === 'products' && <ProductsPage />}
        {currentView === 'product-detail' && <ProductDetailPage />}
        {currentView === 'cart' && <CartPage />}
        {currentView === 'checkout' && <CheckoutPage />}
        {currentView === 'order-success' && <OrderSuccessPage />}
        {currentView === 'about' && <AboutPage />}
        {currentView === 'amc' && <AmcPage />}
        {currentView === 'contact' && <ContactPage />}
        {(currentView === 'login' || currentView === 'register') && <AuthPages />}
        {currentView === 'admin' && <AdminDashboard />}
        {currentView === 'customer-portal' && <CustomerPortal />}
        {currentView === 'employee-portal' && <EmployeePortal />}
      </main>

      {showFooter && <Footer />}
    </div>
  )
}
