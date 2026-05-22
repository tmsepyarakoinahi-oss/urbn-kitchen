'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import dynamic from 'next/dynamic'
import { useAppStore } from '@/lib/store'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

// Dynamic imports to reduce initial compilation memory
// Heavy components are loaded on-demand only when their view is active
const HomePage = dynamic(() => import('@/components/HomePage'), { ssr: false })
const ProductsPage = dynamic(() => import('@/components/ProductsPage'), { ssr: false })
const ProductDetailPage = dynamic(() => import('@/components/ProductDetailPage'), { ssr: false })
const CartPage = dynamic(() => import('@/components/CartPage'), { ssr: false })
const AboutPage = dynamic(() => import('@/components/AboutPage'), { ssr: false })
const ContactPage = dynamic(() => import('@/components/ContactPage'), { ssr: false })
const AuthPages = dynamic(() => import('@/components/AuthPages'), { ssr: false })
const AdminDashboard = dynamic(() => import('@/components/AdminDashboard'), { ssr: false })
const CustomerPortal = dynamic(() => import('@/components/CustomerPortal'), { ssr: false })
const EmployeePortal = dynamic(() => import('@/components/EmployeePortal'), { ssr: false })
const AmcPage = dynamic(() => import('@/components/AmcPage'), { ssr: false })
const CheckoutPage = dynamic(() => import('@/components/CheckoutPage'), { ssr: false })
const OrderSuccessPage = dynamic(() => import('@/components/OrderSuccessPage'), { ssr: false })

// Hydration-safe client mount detection using useSyncExternalStore
const emptySubscribe = () => () => {}
function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,   // client snapshot
    () => false   // server snapshot
  )
}

// Loading fallback for dynamic components
function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-[#59ff00]/30 border-t-[#59ff00] rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    </div>
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

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomePage />
      case 'products':
        return <ProductsPage />
      case 'product-detail':
        return <ProductDetailPage />
      case 'cart':
        return <CartPage />
      case 'checkout':
        return <CheckoutPage />
      case 'order-success':
        return <OrderSuccessPage />
      case 'about':
        return <AboutPage />
      case 'amc':
        return <AmcPage />
      case 'contact':
        return <ContactPage />
      case 'login':
      case 'register':
        return <AuthPages />
      case 'admin':
        return <AdminDashboard />
      case 'customer-portal':
        return <CustomerPortal />
      case 'employee-portal':
        return <EmployeePortal />
      default:
        return <HomePage />
    }
  }

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white flex flex-col" suppressHydrationWarning>
      <Navbar />

      <main className="flex-1">
        {renderView()}
      </main>

      {showFooter && <Footer />}
    </div>
  )
}
