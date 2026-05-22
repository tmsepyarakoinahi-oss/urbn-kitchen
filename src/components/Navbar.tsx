'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  Flame,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet'
import { useAppStore, type AppView } from '@/lib/store'

const navLinks: { label: string; view: AppView }[] = [
  { label: 'Home', view: 'home' },
  { label: 'Products', view: 'products' },
  { label: 'AMC', view: 'amc' },
  { label: 'About', view: 'about' },
  { label: 'Contact', view: 'contact' },
]

export default function Navbar() {
  const { currentView, setView, cartCount, isAuthenticated, user, showMobileMenu, toggleMobileMenu, setSearchQuery, searchQuery } = useAppStore()
  const [searchOpen, setSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [localSearch, setLocalSearch] = useState('')

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchQuery(localSearch)
    setView('products')
    setSearchOpen(false)
  }

  const handleNavClick = (view: AppView) => {
    setView(view)
    setSearchQuery('')
    setLocalSearch('')
  }

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'glass-strong shadow-lg shadow-black/20'
            : 'bg-[#0b0b0b]/80 backdrop-blur-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-18">
            {/* Logo */}
            <button
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-2 group"
            >
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-[#59ff00]/10 border border-[#59ff00]/30 flex items-center justify-center group-hover:bg-[#59ff00]/20 transition-colors">
                <Flame className="w-5 h-5 text-[#59ff00]" />
              </div>
              <span className="font-[family-name:var(--font-poppins)] text-lg md:text-xl font-bold tracking-tight">
                <span className="text-[#59ff00] neon-text">Urban</span>
                <span className="text-white ml-1">Kitchens</span>
              </span>
            </button>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.view}
                  onClick={() => handleNavClick(link.view)}
                  className={`relative px-4 py-2 text-sm font-medium transition-colors rounded-md ${
                    currentView === link.view
                      ? 'text-[#59ff00]'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {link.label}
                  {currentView === link.view && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#59ff00] rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* Search */}
              <AnimatePresence>
                {searchOpen && (
                  <motion.form
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 200, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handleSearch}
                    className="hidden md:flex items-center overflow-hidden"
                  >
                    <Input
                      value={localSearch}
                      onChange={(e) => setLocalSearch(e.target.value)}
                      placeholder="Search products..."
                      className="bg-[#1a1a1a] border-[#2a2a2a] text-white h-9 text-sm"
                      autoFocus
                    />
                  </motion.form>
                )}
              </AnimatePresence>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(!searchOpen)}
                className="text-gray-400 hover:text-[#59ff00] hover:bg-[#59ff00]/10 hidden md:flex"
              >
                <Search className="w-5 h-5" />
              </Button>

              {/* Cart */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setView('cart')}
                className="relative text-gray-400 hover:text-[#59ff00] hover:bg-[#59ff00]/10"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-[#59ff00] text-black text-xs font-bold rounded-full flex items-center justify-center"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </Button>

              {/* User */}
              {isAuthenticated ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setView('customer-portal')}
                  className="text-gray-400 hover:text-[#59ff00] hover:bg-[#59ff00]/10 hidden md:flex"
                >
                  <div className="w-7 h-7 rounded-full bg-[#59ff00]/20 border border-[#59ff00]/40 flex items-center justify-center">
                    <span className="text-[#59ff00] text-xs font-bold">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                </Button>
              ) : (
                <Button
                  onClick={() => setView('login')}
                  className="hidden md:flex bg-[#59ff00] text-black hover:bg-[#59ff00]/90 font-semibold text-sm h-9 px-4"
                >
                  <User className="w-4 h-4 mr-1" />
                  Login
                </Button>
              )}

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMobileMenu}
                className="md:hidden text-gray-400 hover:text-[#59ff00] hover:bg-[#59ff00]/10"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Sheet */}
      <Sheet open={showMobileMenu} onOpenChange={() => toggleMobileMenu()}>
        <SheetContent side="right" className="bg-[#0b0b0b] border-[#2a2a2a] w-[280px]">
          <SheetHeader>
            <SheetTitle className="font-[family-name:var(--font-poppins)] text-left">
              <span className="text-[#59ff00]">Urban</span>
              <span className="text-white ml-1">Kitchens</span>
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-2 mt-4 px-2">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  placeholder="Search products..."
                  className="bg-[#1a1a1a] border-[#2a2a2a] text-white pl-9 h-10"
                />
              </div>
            </form>

            {navLinks.map((link) => (
              <button
                key={link.view}
                onClick={() => handleNavClick(link.view)}
                className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  currentView === link.view
                    ? 'bg-[#59ff00]/10 text-[#59ff00] border border-[#59ff00]/20'
                    : 'text-gray-400 hover:text-white hover:bg-[#151515]'
                }`}
              >
                {link.label}
              </button>
            ))}

            <div className="border-t border-[#2a2a2a] my-3" />

            <button
              onClick={() => { setView('cart'); toggleMobileMenu(); }}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-[#151515] text-sm font-medium"
            >
              <ShoppingCart className="w-4 h-4" />
              Cart {cartCount > 0 && `(${cartCount})`}
            </button>

            {isAuthenticated ? (
              <button
                onClick={() => { setView('customer-portal'); toggleMobileMenu(); }}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-[#151515] text-sm font-medium"
              >
                <User className="w-4 h-4" />
                My Account
              </button>
            ) : (
              <Button
                onClick={() => { setView('login'); toggleMobileMenu(); }}
                className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90 font-semibold w-full"
              >
                <User className="w-4 h-4 mr-2" />
                Login / Register
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
