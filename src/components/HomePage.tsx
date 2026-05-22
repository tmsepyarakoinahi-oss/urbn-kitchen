'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Flame,
  ChefHat,
  Snowflake,
  UtensilsCrossed,
  Droplets,
  Monitor,
  Shield,
  Wrench,
  Truck,
  Headphones,
  Star,
  ArrowRight,
  Eye,
  ShoppingCart,
  Quote,
  Phone,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAppStore, type CartItem } from '@/lib/store'
import { toast } from 'sonner'

/* ─── helpers ─── */
const formatPrice = (price: number) => {
  const str = price.toString()
  let lastThree = str.substring(str.length - 3)
  const otherNumbers = str.substring(0, str.length - 3)
  if (otherNumbers !== '') lastThree = ',' + lastThree
  return '₹' + otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree
}

const categoryIcons: Record<string, React.ReactNode> = {
  'commercial-burners': <Flame className="w-7 h-7" />,
  'cooking-ranges': <ChefHat className="w-7 h-7" />,
  'refrigeration': <Snowflake className="w-7 h-7" />,
  'food-preparation': <UtensilsCrossed className="w-7 h-7" />,
  'dishwashing': <Droplets className="w-7 h-7" />,
  'display-counters': <Monitor className="w-7 h-7" />,
}

/* ─── Counter animation component ─── */
function StatCounter({ end, label, className }: { end: number; label: string; className?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const startTime = performance.now()
          const duration = 2000
          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(eased * end))
            if (progress < 1) requestAnimationFrame(animate)
          }
          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.3 }
    )
    const el = ref.current
    if (el) observer.observe(el)
    return () => { if (el) observer.unobserve(el) }
  }, [end])

  return (
    <div ref={ref} className={className}>
      <div className="font-[family-name:var(--font-poppins)] text-2xl md:text-4xl font-bold text-[#59ff00]">
        {count}+
      </div>
      <div className="text-gray-500 text-xs md:text-sm mt-1">{label}</div>
    </div>
  )
}

/* ─── Product type ─── */
interface Product {
  id: string
  name: string
  slug: string
  price: number
  shortDescription?: string | null
  steelGrade?: string | null
  capacity?: string | null
  stock: number
  featured?: boolean
  category: { id: string; name: string; slug: string }
  images?: { image: string }[]
}

interface Category {
  id: string
  name: string
  slug: string
  _count?: { products: number }
}

/* ─── Animation variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' as const },
  }),
}

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
}

/* ─── Component ─── */
export default function HomePage() {
  const { setView, setProductDetail, addToCart, setSelectedCategory } = useAppStore()
  const [categories, setCategories] = useState<Category[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/products?featured=true&limit=8'),
        ])
        const catData = await catRes.json()
        const prodData = await prodRes.json()
        if (catData.status) setCategories(catData.data || [])
        if (prodData.status) setFeaturedProducts(prodData.data?.products || [])
      } catch (err) {
        console.error('Failed to load homepage data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleAddToCart = useCallback((product: Product) => {
    addToCart({
      id: product.id,
      productId: product.id,
      name: product.name,
      price: product.price,
      qty: 1,
      image: null,
      stock: product.stock,
    })
    toast.success(`${product.name} added to cart`)
  }, [addToCart])

  const handleCategoryClick = useCallback((slug: string) => {
    setSelectedCategory(slug)
    setView('products')
  }, [setSelectedCategory, setView])

  return (
    <div className="min-h-screen">
      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-[#0b0b0b] grid-pattern" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b0b0b] via-transparent to-[#0b0b0b]" />
        
        {/* Decorative glow */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#59ff00]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#59ff00]/3 rounded-full blur-[100px]" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} custom={0}>
              <Badge className="bg-[#59ff00]/10 text-[#59ff00] border-[#59ff00]/20 mb-6 px-4 py-1.5 text-sm">
                <Flame className="w-3.5 h-3.5 mr-1.5" />
                Premium Commercial Kitchen Equipment
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="font-[family-name:var(--font-poppins)] text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-tight mb-6"
            >
              Engineering{' '}
              <span className="text-[#59ff00] neon-text">Excellence</span>
              <br />
              for Commercial Kitchens
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-gray-400 text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              From heavy-duty burners to walk-in cold rooms — we manufacture 
              precision-engineered stainless steel equipment trusted by India&apos;s 
              top hotels, restaurants, and catering businesses.
            </motion.p>

            <motion.div
              variants={fadeUp}
              custom={3}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button
                onClick={() => setView('products')}
                className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90 font-semibold px-8 h-12 text-base neon-glow"
              >
                Explore Products
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                onClick={() => setView('contact')}
                variant="outline"
                className="border-[#59ff00] text-[#59ff00] hover:bg-[#59ff00]/10 font-semibold px-8 h-12 text-base"
              >
                Request a Quote
              </Button>
            </motion.div>
          </motion.div>

          {/* Floating Stats */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mt-16 md:mt-20 grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto"
          >
            <StatCounter end={500} label="Projects Delivered" className="glass rounded-xl p-4 md:p-6 text-center hover-lift" />
            <StatCounter end={15} label="Years Experience" className="glass rounded-xl p-4 md:p-6 text-center hover-lift" />
            <StatCounter end={200} label="Products Range" className="glass rounded-xl p-4 md:p-6 text-center hover-lift" />
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-[#59ff00]/30 flex items-start justify-center p-1">
            <div className="w-1.5 h-3 bg-[#59ff00] rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════ CATEGORIES ═══════════════════ */}
      <section className="py-16 md:py-24 bg-[#0b0b0b]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center mb-12"
          >
            <motion.h2 variants={fadeUp} custom={0} className="font-[family-name:var(--font-poppins)] text-2xl md:text-3xl lg:text-4xl font-bold mb-3">
              Browse by <span className="text-[#59ff00]">Category</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-gray-500 max-w-xl mx-auto">
              Explore our comprehensive range of commercial kitchen equipment
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, i) => (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                onClick={() => handleCategoryClick(cat.slug)}
                className="group relative bg-[#151515] border border-[#2a2a2a] rounded-xl p-5 md:p-6 text-center hover:border-[#59ff00]/40 hover-lift transition-all"
              >
                <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-[#59ff00]/10 flex items-center justify-center text-[#59ff00] group-hover:bg-[#59ff00]/20 transition-colors">
                  {categoryIcons[cat.slug] || <Flame className="w-7 h-7" />}
                </div>
                <h3 className="text-white text-sm font-semibold group-hover:text-[#59ff00] transition-colors">
                  {cat.name}
                </h3>
                {cat._count && (
                  <p className="text-gray-600 text-xs mt-1">{cat._count.products} Products</p>
                )}
                {/* Hover glow */}
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" 
                  style={{ boxShadow: '0 0 30px rgba(89, 255, 0, 0.1)' }} />
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ FEATURED PRODUCTS ═══════════════════ */}
      <section className="py-16 md:py-24 bg-[#0d0d0d]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4"
          >
            <div>
              <motion.h2 variants={fadeUp} custom={0} className="font-[family-name:var(--font-poppins)] text-2xl md:text-3xl lg:text-4xl font-bold mb-2">
                Featured <span className="text-[#59ff00]">Products</span>
              </motion.h2>
              <motion.p variants={fadeUp} custom={1} className="text-gray-500">
                Handpicked premium equipment for your commercial kitchen
              </motion.p>
            </div>
            <motion.div variants={fadeUp} custom={2}>
              <Button
                onClick={() => setView('products')}
                variant="outline"
                className="border-[#59ff00] text-[#59ff00] hover:bg-[#59ff00]/10"
              >
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </motion.div>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-[#151515] border border-[#2a2a2a] rounded-xl h-80 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 8).map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="group bg-[#151515] border border-[#2a2a2a] rounded-xl overflow-hidden hover:border-[#59ff00]/30 hover-lift transition-all"
                >
                  {/* Image */}
                  <div className="relative h-48 bg-[#1a1a1a] flex items-center justify-center overflow-hidden">
                    <div className="text-gray-700">
                      <Flame className="w-12 h-12" />
                    </div>
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <Button
                        size="sm"
                        onClick={() => setProductDetail(product.id)}
                        className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90 h-9"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Quick View
                      </Button>
                    </div>
                    {/* Category badge */}
                    <Badge className="absolute top-3 left-3 bg-[#0b0b0b]/80 text-gray-300 border-[#2a2a2a] text-xs">
                      {product.category.name}
                    </Badge>
                    {product.featured && (
                      <Badge className="absolute top-3 right-3 bg-[#59ff00]/20 text-[#59ff00] border-[#59ff00]/30 text-xs">
                        Featured
                      </Badge>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2 group-hover:text-[#59ff00] transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
                      {product.steelGrade && <span className="bg-[#1a1a1a] px-2 py-0.5 rounded">{product.steelGrade}</span>}
                      {product.capacity && <span className="bg-[#1a1a1a] px-2 py-0.5 rounded">{product.capacity}</span>}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-[family-name:var(--font-poppins)] text-[#59ff00] font-bold text-lg">
                        {formatPrice(product.price)}
                      </span>
                      <Button
                        size="sm"
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                        className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90 h-8 px-3 text-xs"
                      >
                        <ShoppingCart className="w-3.5 h-3.5 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════ WHY CHOOSE US ═══════════════════ */}
      <section className="py-16 md:py-24 bg-[#0b0b0b]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center mb-12"
          >
            <motion.h2 variants={fadeUp} custom={0} className="font-[family-name:var(--font-poppins)] text-2xl md:text-3xl lg:text-4xl font-bold mb-3">
              Why Choose <span className="text-[#59ff00]">Urban Kitchens</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-gray-500 max-w-xl mx-auto">
              We deliver more than equipment — we deliver reliability
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Shield className="w-8 h-8" />,
                title: 'Premium Steel',
                desc: 'All products crafted from SS304/SS316 grade stainless steel ensuring durability and hygiene compliance.',
              },
              {
                icon: <Wrench className="w-8 h-8" />,
                title: 'Custom Solutions',
                desc: 'Tailor-made kitchen setups designed to your specifications, space, and operational needs.',
              },
              {
                icon: <Truck className="w-8 h-8" />,
                title: 'Pan India Delivery',
                desc: 'Reliable delivery and installation across India with dedicated logistics partners.',
              },
              {
                icon: <Headphones className="w-8 h-8" />,
                title: 'AMC Support',
                desc: 'Comprehensive Annual Maintenance Contracts with 48-hour service guarantee across India.',
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group bg-[#151515] border border-[#2a2a2a] rounded-xl p-6 text-center hover:border-[#59ff00]/30 hover-lift transition-all"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-[#59ff00]/10 flex items-center justify-center text-[#59ff00] group-hover:bg-[#59ff00]/20 transition-colors">
                  {item.icon}
                </div>
                <h3 className="text-white font-[family-name:var(--font-poppins)] font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ TESTIMONIALS ═══════════════════ */}
      <section className="py-16 md:py-24 bg-[#0d0d0d]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center mb-12"
          >
            <motion.h2 variants={fadeUp} custom={0} className="font-[family-name:var(--font-poppins)] text-2xl md:text-3xl lg:text-4xl font-bold mb-3">
              Trusted by <span className="text-[#59ff00]">Industry Leaders</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-gray-500 max-w-xl mx-auto">
              See what our clients say about working with us
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Anand Restaurant',
                role: 'Restaurant Chain Owner',
                text: 'Urban Kitchens equipped all 12 of our outlets. The build quality is exceptional and their after-sales support is unmatched in the industry.',
                rating: 5,
              },
              {
                name: 'Hotel Sunrise',
                role: 'Hotel Operations Manager',
                text: 'From walk-in cold rooms to display counters — everything was delivered on time and installed perfectly. Truly professional team.',
                rating: 5,
              },
              {
                name: 'Spice Garden Catering',
                role: 'Catering Business Owner',
                text: 'The custom tandoor range they built for us was exactly what we needed. Their AMC plan gives us complete peace of mind.',
                rating: 5,
              },
            ].map((item, i) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-xl p-6 hover-lift"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(item.rating)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-[#59ff00] text-[#59ff00]" />
                  ))}
                </div>
                <Quote className="w-8 h-8 text-[#59ff00]/20 mb-2" />
                <p className="text-gray-300 text-sm leading-relaxed mb-4">{item.text}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#59ff00]/10 flex items-center justify-center text-[#59ff00] font-bold text-sm">
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-white text-sm font-semibold">{item.name}</div>
                    <div className="text-gray-500 text-xs">{item.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ CTA SECTION ═══════════════════ */}
      <section className="py-16 md:py-24 bg-[#0b0b0b] relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#59ff00]/5 rounded-full blur-[150px]" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10 max-w-3xl mx-auto px-4 text-center"
        >
          <h2 className="font-[family-name:var(--font-poppins)] text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
            Ready to Upgrade Your <span className="text-[#59ff00]">Kitchen</span>?
          </h2>
          <p className="text-gray-400 mb-8 text-lg">
            Get a free consultation and customized quote for your commercial kitchen setup.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={() => setView('contact')}
              className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90 font-semibold px-8 h-12 text-base neon-glow"
            >
              Contact Us Today
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <a href="tel:+911145678900" className="text-gray-400 hover:text-[#59ff00] text-sm flex items-center gap-2 transition-colors">
              <Phone className="w-4 h-4" />
              +91-11-45678900
            </a>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
