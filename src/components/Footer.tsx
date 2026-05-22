'use client'

import { useSyncExternalStore } from 'react'
import { Flame, Phone, Mail, MapPin, Facebook, Instagram, Twitter, Linkedin, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useAppStore, type AppView } from '@/lib/store'

const quickLinks: { label: string; view: AppView }[] = [
  { label: 'Home', view: 'home' },
  { label: 'Products', view: 'products' },
  { label: 'AMC Plans', view: 'amc' },
  { label: 'About Us', view: 'about' },
  { label: 'Contact', view: 'contact' },
]

const productCategories = [
  'Commercial Burners',
  'Cooking Ranges',
  'Refrigeration',
  'Food Preparation',
  'Dishwashing',
  'Display Counters',
]

const emptySubscribe = () => () => {}

export default function Footer() {
  const { setView, setSelectedCategory } = useAppStore()
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false)

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category.toLowerCase().replace(/\s+/g, '-'))
    setView('products')
  }

  return (
    <footer className="bg-[#0a0a0a] border-t border-[#1a1a1a]">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="sm:col-span-2 lg:col-span-1">
            <button onClick={() => setView('home')} className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#59ff00]/10 border border-[#59ff00]/30 flex items-center justify-center">
                <Flame className="w-5 h-5 text-[#59ff00]" />
              </div>
              <span className="font-[family-name:var(--font-poppins)] text-lg font-bold">
                <span className="text-[#59ff00]">Urban</span>
                <span className="text-white ml-1">Kitchens</span>
              </span>
            </button>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">
              India&apos;s leading manufacturer of premium commercial kitchen equipment. 
              Engineering excellence for hotels, restaurants, and catering businesses since 2009.
            </p>
            <div className="flex flex-col gap-2">
              <a href="tel:+911145678900" className="flex items-center gap-2 text-gray-500 hover:text-[#59ff00] text-sm transition-colors">
                <Phone className="w-4 h-4" />
                +91-11-45678900
              </a>
              <a href="mailto:info@urbankitchens.com" className="flex items-center gap-2 text-gray-500 hover:text-[#59ff00] text-sm transition-colors">
                <Mail className="w-4 h-4" />
                info@urbankitchens.com
              </a>
              <div className="flex items-start gap-2 text-gray-500 text-sm">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                Plot No. 45, Sector 12, Industrial Area, New Delhi - 110020
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-[family-name:var(--font-poppins)] text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Quick Links
            </h3>
            <div className="w-8 h-0.5 bg-[#59ff00] mb-4" />
            <ul className="flex flex-col gap-2">
              {quickLinks.map((link) => (
                <li key={link.view}>
                  <button
                    onClick={() => setView(link.view)}
                    className="text-gray-500 hover:text-[#59ff00] text-sm transition-colors flex items-center gap-1.5 group"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {link.label}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => setView('login')}
                  className="text-gray-500 hover:text-[#59ff00] text-sm transition-colors flex items-center gap-1.5 group"
                >
                  <ArrowRight className="w-3 h-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  Login / Register
                </button>
              </li>
            </ul>
          </div>

          {/* Products */}
          <div>
            <h3 className="font-[family-name:var(--font-poppins)] text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Products
            </h3>
            <div className="w-8 h-0.5 bg-[#59ff00] mb-4" />
            <ul className="flex flex-col gap-2">
              {productCategories.map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => handleCategoryClick(cat)}
                    className="text-gray-500 hover:text-[#59ff00] text-sm transition-colors flex items-center gap-1.5 group"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-[family-name:var(--font-poppins)] text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Newsletter
            </h3>
            <div className="w-8 h-0.5 bg-[#59ff00] mb-4" />
            <p className="text-gray-500 text-sm mb-4">
              Stay updated with our latest products, offers, and industry insights.
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Your email"
                className="bg-[#1a1a1a] border-[#2a2a2a] text-white text-sm h-9"
              />
              <Button className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90 h-9 px-3 shrink-0">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Social Media */}
            <div className="flex items-center gap-3 mt-6">
              <a href="#" className="w-9 h-9 rounded-lg bg-[#151515] border border-[#2a2a2a] flex items-center justify-center text-gray-500 hover:text-[#59ff00] hover:border-[#59ff00]/30 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-[#151515] border border-[#2a2a2a] flex items-center justify-center text-gray-500 hover:text-[#59ff00] hover:border-[#59ff00]/30 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-[#151515] border border-[#2a2a2a] flex items-center justify-center text-gray-500 hover:text-[#59ff00] hover:border-[#59ff00]/30 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-[#151515] border border-[#2a2a2a] flex items-center justify-center text-gray-500 hover:text-[#59ff00] hover:border-[#59ff00]/30 transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <Separator className="bg-[#1a1a1a]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-600">
          <p>&copy; {mounted ? new Date().getFullYear() : '2025'} Urban Kitchens Manufacturing & Solutions. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <button className="hover:text-[#59ff00] transition-colors">Privacy Policy</button>
            <button className="hover:text-[#59ff00] transition-colors">Terms of Service</button>
            <span>GST: 07AABCU9603R1ZM</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
