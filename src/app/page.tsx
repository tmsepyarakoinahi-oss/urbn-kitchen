'use client'

import { useEffect, useState } from 'react'
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

export default function Home() {
  const { currentView } = useAppStore()
  const [seeded, setSeeded] = useState(false)

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
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentView])

  // Determine if footer should show
  const showFooter = !['admin', 'employee-portal'].includes(currentView)

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white flex flex-col">
      <Navbar />

      <main className="flex-1">
        {currentView === 'home' && <HomePage />}
        {currentView === 'products' && <ProductsPage />}
        {currentView === 'product-detail' && <ProductDetailPage />}
        {currentView === 'cart' && <CartPage />}
        {currentView === 'about' && <AboutPage />}
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
