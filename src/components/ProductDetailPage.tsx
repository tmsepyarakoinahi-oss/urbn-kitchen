'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ShoppingCart,
  MessageSquare,
  Minus,
  Plus,
  Package,
  Clock,
  Shield,
  Truck,
  CheckCircle2,
  Info,
  FileText,
  ListChecks,
  Star,
  Zap,
  Award,
  Phone,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { useAppStore, type CartItem } from '@/lib/store'
import { toast } from 'sonner'

const formatPrice = (price: number) => {
  if (price === 0) return 'Request Quote'
  const str = price.toString()
  let lastThree = str.substring(str.length - 3)
  const otherNumbers = str.substring(0, str.length - 3)
  if (otherNumbers !== '') lastThree = ',' + lastThree
  return '₹' + otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree
}

interface ProductVariant {
  id: string
  productId: string
  name: string
  sku: string | null
  price: number
  stock: number
  weight: string | null
  dimensions: string | null
  isDefault: boolean
  sortOrder: number
}

interface Product {
  id: string
  name: string
  slug: string
  description: string
  shortDescription?: string | null
  longDescription?: string | null
  price: number
  steelGrade?: string | null
  capacity?: string | null
  dimensions?: string | null
  stock: number
  moq?: number
  leadTime?: string | null
  featured?: boolean
  category: { id: string; name: string; slug: string }
  featuredImage?: string | null
  images?: { image: string }[]
  variants?: ProductVariant[]
  priceRange?: { min: number; max: number }
  defaultVariant?: ProductVariant
}

interface RelatedProduct {
  id: string
  name: string
  price: number
  category: { id: string; name: string; slug: string }
  stock: number
  steelGrade?: string | null
  capacity?: string | null
  featuredImage?: string | null
  shortDescription?: string | null
}

// Category emoji map
const CATEGORY_EMOJIS: Record<string, string> = {
  'Preparation Equipment': '🔪',
  'Cooking Equipment': '🔥',
  'Serving Equipment': '🍽️',
  'Washing Equipment': '🧼',
  'Storage Equipment': '📦',
  'Refrigeration Equipment': '❄️',
  'Bakery Equipment': '🍞',
  'Display Equipment': '🏪',
  'Food Carts': '🛒',
}

export default function ProductDetailPage() {
  const { selectedProductId, setView, setProductDetail, addToCart } = useAppStore()
  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<RelatedProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [qty, setQty] = useState(1)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const fetchIdRef = useRef(0)

  // Determine initial state based on selectedProductId
  const noProductSelected = !selectedProductId

  // Fetch product whenever selectedProductId changes
  useEffect(() => {
    if (!selectedProductId) return

    // Increment fetch ID to track the latest request
    const currentFetchId = ++fetchIdRef.current
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError(null)
      setProduct(null)
      setRelated([])
      setQty(1)
      setSelectedVariant(null)

      try {
        const res = await fetch(`/api/products/${selectedProductId}`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()

        if (cancelled || currentFetchId !== fetchIdRef.current) return

        if (data.status && data.data) {
          setProduct(data.data)
          setSelectedVariant(data.data.defaultVariant || null)

          // Fetch related products
          if (data.data.category?.slug) {
            try {
              const rdRes = await fetch(`/api/products?category=${data.data.category.slug}&limit=5`)
              const rd = await rdRes.json()
              if (!cancelled && rd.status) {
                setRelated(
                  (rd.data?.products || [])
                    .filter((p: RelatedProduct) => p.id !== selectedProductId)
                    .slice(0, 4)
                )
              }
            } catch {
              // Related products are non-critical, ignore errors
            }
          }
        } else {
          setError(data.message || 'Product not found')
        }
      } catch (err) {
        if (!cancelled && currentFetchId === fetchIdRef.current) {
          console.error('Failed to load product:', err)
          setError('Failed to load product. Please try again.')
        }
      } finally {
        if (!cancelled && currentFetchId === fetchIdRef.current) {
          setLoading(false)
        }
      }
    }

    load()
    return () => { cancelled = true }
  }, [selectedProductId])

  const handleAddToCart = useCallback(() => {
    if (!product) return
    addToCart({
      id: selectedVariant ? `${product.id}-${selectedVariant.id}` : product.id,
      productId: product.id,
      name: product.name,
      price: selectedVariant ? selectedVariant.price : product.price,
      qty,
      image: product.featuredImage || null,
      stock: selectedVariant ? selectedVariant.stock : product.stock,
      variantId: selectedVariant?.id || null,
      variantName: selectedVariant?.name || null,
      variantSku: selectedVariant?.sku || null,
    })
    toast.success(`${qty}x ${product.name}${selectedVariant ? ` (${selectedVariant.name})` : ''} added to cart`)
  }, [product, qty, selectedVariant, addToCart])

  // ─── Loading State ───
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] pt-20 md:pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-pulse">
            <div className="h-96 bg-[#151515] rounded-xl" />
            <div className="space-y-4">
              <div className="h-8 bg-[#151515] rounded w-3/4" />
              <div className="h-6 bg-[#151515] rounded w-1/2" />
              <div className="h-10 bg-[#151515] rounded w-1/3" />
              <div className="h-20 bg-[#151515] rounded w-full" />
              <div className="h-12 bg-[#151515] rounded w-2/3" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ─── Error State ───
  if (error || !product || noProductSelected) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] pt-20 md:pt-24 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <h2 className="text-gray-400 text-xl mb-2">{noProductSelected ? 'No product selected' : (error || 'Product not found')}</h2>
          <p className="text-gray-600 text-sm mb-6">The product you&apos;re looking for might have been removed or is temporarily unavailable.</p>
          <div className="flex items-center justify-center gap-3">
            <Button onClick={() => setView('products')} className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90">
              🔍 Browse Products
            </Button>
            <Button onClick={() => setView('contact')} variant="outline" className="border-[#2a2a2a] text-gray-400 hover:text-white hover:bg-[#1a1a1a]">
              📞 Contact Us
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const categoryEmoji = CATEGORY_EMOJIS[product.category.name] || '🔧'
  const isRequestQuote = product.price === 0 && (!product.variants || product.variants.length === 0)

  // Determine what description content to show
  const hasShortDesc = !!product.shortDescription
  const hasLongDesc = !!product.longDescription
  const hasBasicDesc = !!product.description

  // Full Details content: prefer longDescription, fall back to description
  const fullDetailsContent = product.longDescription || product.description || ''

  return (
    <div className="min-h-screen bg-[#0b0b0b] pt-20 md:pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => setView('products')}
          className="flex items-center gap-2 text-gray-500 hover:text-[#59ff00] text-sm mb-6 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          ← Back to Products
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* ─── IMAGE ─── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative h-72 sm:h-96 lg:h-[500px] bg-[#151515] border border-[#2a2a2a] rounded-xl flex items-center justify-center overflow-hidden group">
              {product.featuredImage ? (
                <img src={product.featuredImage} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <span className="text-8xl">{categoryEmoji}</span>
                  <span className="text-gray-500 text-sm">No image available</span>
                </div>
              )}
              {product.featured && (
                <Badge className="absolute top-4 right-4 bg-[#59ff00]/20 text-[#59ff00] border-[#59ff00]/30">
                  ⭐ Featured
                </Badge>
              )}
              <Badge className="absolute top-4 left-4 bg-[#0b0b0b]/80 text-gray-300 border-[#2a2a2a]">
                {categoryEmoji} {product.category.name}
              </Badge>
            </div>

            {/* Trust badges below image */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="bg-[#151515] border border-[#2a2a2a] rounded-lg p-3 text-center">
                <Truck className="w-5 h-5 text-[#59ff00] mx-auto mb-1" />
                <p className="text-white text-xs font-medium">🚚 Pan India</p>
                <p className="text-gray-600 text-[10px]">Delivery</p>
              </div>
              <div className="bg-[#151515] border border-[#2a2a2a] rounded-lg p-3 text-center">
                <Shield className="w-5 h-5 text-[#59ff00] mx-auto mb-1" />
                <p className="text-white text-xs font-medium">🛡️ Warranty</p>
                <p className="text-gray-600 text-[10px]">Included</p>
              </div>
              <div className="bg-[#151515] border border-[#2a2a2a] rounded-lg p-3 text-center">
                <Clock className="w-5 h-5 text-[#59ff00] mx-auto mb-1" />
                <p className="text-white text-xs font-medium">⏱️ {product.leadTime || '7-10 days'}</p>
                <p className="text-gray-600 text-[10px]">Lead Time</p>
              </div>
            </div>
          </motion.div>

          {/* ─── DETAILS ─── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col"
          >
            {/* Category with emoji */}
            <Badge className="w-fit bg-[#59ff00]/10 text-[#59ff00] border-[#59ff00]/20 mb-3">
              {categoryEmoji} {product.category.name}
            </Badge>

            {/* Name */}
            <h1 className="font-[family-name:var(--font-poppins)] text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">
              {product.name}
            </h1>

            {/* Short Description */}
            {hasShortDesc && (
              <p className="text-gray-300 text-sm mb-4 leading-relaxed border-l-2 border-[#59ff00]/40 pl-3">
                {product.shortDescription}
              </p>
            )}
            {!hasShortDesc && hasBasicDesc && (
              <p className="text-gray-400 text-sm mb-4 leading-relaxed border-l-2 border-[#59ff00]/40 pl-3">
                {product.description}
              </p>
            )}

            {/* Price */}
            <div className="font-[family-name:var(--font-poppins)] text-[#59ff00] text-3xl sm:text-4xl font-bold mb-1">
              {selectedVariant
                ? formatPrice(selectedVariant.price)
                : product.variants?.length && product.priceRange && product.priceRange.min !== product.priceRange.max
                  ? `${formatPrice(product.priceRange.min)} - ${formatPrice(product.priceRange.max)}`
                  : formatPrice(product.price)}
            </div>
            {!isRequestQuote && (
              <p className="text-gray-600 text-xs mb-4">+ GST (18%) • Prices exclusive of freight & insurance</p>
            )}
            {isRequestQuote && (
              <p className="text-gray-500 text-xs mb-4">📞 Contact us for best pricing on this product</p>
            )}

            {/* Variant Selector */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-6">
                <label className="text-white text-sm font-medium mb-2.5 block">📐 Select Size / Variant</label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                        selectedVariant?.id === v.id
                          ? 'bg-[#59ff00]/10 border-[#59ff00] text-[#59ff00]'
                          : 'bg-[#1a1a1a] border-[#2a2a2a] text-gray-400 hover:border-[#59ff00]/40 hover:text-white'
                      }`}
                    >
                      {v.name}
                      {v.price > 0 && <span className="ml-1 text-xs opacity-70">({formatPrice(v.price)})</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Key Specs */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {product.steelGrade && (
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3">
                  <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                    <Shield className="w-3.5 h-3.5" />
                    🔩 Steel Grade
                  </div>
                  <div className="text-white text-sm font-semibold">{product.steelGrade}</div>
                </div>
              )}
              {product.capacity && (
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3">
                  <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                    <Package className="w-3.5 h-3.5" />
                    📦 Capacity
                  </div>
                  <div className="text-white text-sm font-semibold">{product.capacity}</div>
                </div>
              )}
              {(selectedVariant?.dimensions || product.dimensions) && (
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3">
                  <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                    <Package className="w-3.5 h-3.5" />
                    📐 Dimensions
                  </div>
                  <div className="text-white text-sm font-semibold">{selectedVariant?.dimensions || product.dimensions}</div>
                </div>
              )}
              {product.leadTime && (
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3">
                  <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                    <Clock className="w-3.5 h-3.5" />
                    🚚 Lead Time
                  </div>
                  <div className="text-white text-sm font-semibold">{product.leadTime}</div>
                </div>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2 mb-6">
              <div className={`w-2.5 h-2.5 rounded-full ${(selectedVariant?.stock ?? product.stock) > 0 ? 'bg-[#59ff00] animate-pulse' : 'bg-red-500'}`} />
              <span className={`text-sm ${(selectedVariant?.stock ?? product.stock) > 0 ? 'text-[#59ff00]' : 'text-red-400'}`}>
                {(selectedVariant?.stock ?? product.stock) > 0
                  ? `✅ ${(selectedVariant?.stock ?? product.stock)} units in stock`
                  : '❌ Currently out of stock'}
              </span>
              {product.moq && product.moq > 1 && (
                <span className="text-gray-600 text-xs ml-2">| 🛒 MOQ: {product.moq}</span>
              )}
            </div>

            <Separator className="bg-[#2a2a2a] mb-6" />

            {/* Quantity & Add to Cart */}
            {!isRequestQuote && (
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg">
                  <button
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center text-white font-semibold">{qty}</span>
                  <button
                    onClick={() => setQty(q => Math.min((selectedVariant?.stock ?? product.stock) || 99, q + 1))}
                    className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <Button
                  onClick={handleAddToCart}
                  disabled={(selectedVariant?.stock ?? product.stock) === 0}
                  className="flex-1 bg-[#59ff00] text-black hover:bg-[#59ff00]/90 font-bold h-12 text-base"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart — {formatPrice((selectedVariant?.price ?? product.price) * qty)}
                </Button>
              </div>
            )}

            {isRequestQuote && (
              <Button
                onClick={() => setView('contact')}
                className="w-full bg-[#59ff00] text-black hover:bg-[#59ff00]/90 font-bold h-12 text-base mb-4"
              >
                <Phone className="w-5 h-5 mr-2" />
                📞 Request Quote for {product.name}
              </Button>
            )}

            <Button
              onClick={() => setView('contact')}
              variant="outline"
              className="border-[#59ff00] text-[#59ff00] hover:bg-[#59ff00]/10 font-semibold h-11 mb-4"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              💬 Inquiry / Get Custom Quote
            </Button>

            {/* WhatsApp CTA */}
            <a
              href={`https://wa.me/917080488840?text=${encodeURIComponent(`Hi, I'm interested in ${product.name} (${product.category.name}). Please share details and pricing.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full h-11 rounded-lg border border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366]/10 font-semibold transition-colors text-sm mb-4"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#25D366]">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp Us for Quick Quote
            </a>
          </motion.div>
        </div>

        {/* ─── TABS: FULL DETAILS, OVERVIEW & SPECS ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12"
        >
          <Tabs defaultValue="full-details" className="w-full">
            <TabsList className="bg-[#151515] border border-[#2a2a2a] p-1 h-auto">
              <TabsTrigger value="full-details" className="data-[state=active]:bg-[#59ff00]/10 data-[state=active]:text-[#59ff00]">
                <FileText className="w-4 h-4 mr-1.5" />
                📋 Full Details
              </TabsTrigger>
              <TabsTrigger value="overview" className="data-[state=active]:bg-[#59ff00]/10 data-[state=active]:text-[#59ff00]">
                <Info className="w-4 h-4 mr-1.5" />
                ✨ Overview
              </TabsTrigger>
              <TabsTrigger value="specifications" className="data-[state=active]:bg-[#59ff00]/10 data-[state=active]:text-[#59ff00]">
                <ListChecks className="w-4 h-4 mr-1.5" />
                🔧 Specifications
              </TabsTrigger>
            </TabsList>

            {/* Full Details - Always shown with rich content */}
            <TabsContent value="full-details" className="mt-6">
              <div className="bg-[#151515] border border-[#2a2a2a] rounded-xl p-6">
                <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#59ff00]" />
                  {categoryEmoji} {product.name} — Full Details
                </h3>

                {fullDetailsContent ? (
                  <div className="text-gray-300 leading-relaxed whitespace-pre-line text-sm">
                    {fullDetailsContent}
                  </div>
                ) : (
                  <div className="text-gray-400 text-sm">
                    <p className="mb-4">{product.description || 'No detailed description available.'}</p>
                    <p className="text-gray-500 italic">📞 Contact us at <a href="tel:+917080488840" className="text-[#59ff00] hover:underline">+91-7080488840</a> for more details about this product.</p>
                  </div>
                )}

                {/* Key Features Section */}
                <div className="mt-6 pt-4 border-t border-[#2a2a2a]">
                  <h4 className="text-[#59ff00] text-sm font-semibold mb-3 flex items-center gap-2">
                    🔑 Key Features & Highlights
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {product.steelGrade && (
                      <li className="flex items-center gap-2 text-gray-400 text-sm">
                        <span className="text-[#59ff00]">✓</span> 🔩 Steel Grade: <span className="text-white">{product.steelGrade}</span>
                      </li>
                    )}
                    {product.capacity && (
                      <li className="flex items-center gap-2 text-gray-400 text-sm">
                        <span className="text-[#59ff00]">✓</span> 📦 Capacity: <span className="text-white">{product.capacity}</span>
                      </li>
                    )}
                    {(selectedVariant?.dimensions || product.dimensions) && (
                      <li className="flex items-center gap-2 text-gray-400 text-sm">
                        <span className="text-[#59ff00]">✓</span> 📐 Dimensions: <span className="text-white">{selectedVariant?.dimensions || product.dimensions}</span>
                      </li>
                    )}
                    {product.leadTime && (
                      <li className="flex items-center gap-2 text-gray-400 text-sm">
                        <span className="text-[#59ff00]">✓</span> 🚚 Lead Time: <span className="text-white">{product.leadTime}</span>
                      </li>
                    )}
                    <li className="flex items-center gap-2 text-gray-400 text-sm">
                      <span className="text-[#59ff00]">✓</span> 🛒 MOQ: <span className="text-white">{product.moq || 1} unit(s)</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-400 text-sm">
                      <span className="text-[#59ff00]">✓</span> 📊 Stock: <span className="text-white">{selectedVariant?.stock ?? product.stock} units</span>
                    </li>
                    {product.featured && (
                      <li className="flex items-center gap-2 text-gray-400 text-sm">
                        <span className="text-[#59ff00]">✓</span> ⭐ Featured Product
                      </li>
                    )}
                    <li className="flex items-center gap-2 text-gray-400 text-sm">
                      <span className="text-[#59ff00]">✓</span> 🚛 Pan India Delivery
                    </li>
                    <li className="flex items-center gap-2 text-gray-400 text-sm">
                      <span className="text-[#59ff00]">✓</span> 🛡️ Warranty Included
                    </li>
                    <li className="flex items-center gap-2 text-gray-400 text-sm">
                      <span className="text-[#59ff00]">✓</span> 🔧 Installation Support
                    </li>
                  </ul>
                </div>

                {/* CTA in Full Details */}
                <div className="mt-6 pt-4 border-t border-[#2a2a2a] flex flex-col sm:flex-row gap-3">
                  <a
                    href={`https://wa.me/917080488840?text=${encodeURIComponent(`Hi, I'm interested in ${product.name} (${product.category.name}). Please share pricing and details.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#25D366] text-white font-semibold text-sm hover:bg-[#20bd5a] transition-colors"
                  >
                    💬 WhatsApp for Quote
                  </a>
                  <Button
                    onClick={() => setView('contact')}
                    variant="outline"
                    className="border-[#59ff00] text-[#59ff00] hover:bg-[#59ff00]/10 text-sm"
                  >
                    📧 Send Inquiry
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Overview - Quick Summary */}
            <TabsContent value="overview" className="mt-6">
              <div className="bg-[#151515] border border-[#2a2a2a] rounded-xl p-6">
                {hasShortDesc && (
                  <div className="mb-4 pb-4 border-b border-[#2a2a2a]">
                    <h3 className="text-[#59ff00] text-sm font-semibold mb-2 flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      ✨ Quick Summary
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed">{product.shortDescription}</p>
                  </div>
                )}
                {hasBasicDesc ? (
                  <div>
                    <h3 className="text-white text-sm font-semibold mb-2 flex items-center gap-2">
                      <Info className="w-4 h-4 text-gray-400" />
                      📝 Product Overview
                    </h3>
                    <p className="text-gray-400 leading-relaxed whitespace-pre-line">{product.description}</p>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm italic">No overview available. Please check the Full Details tab for more information.</p>
                )}
              </div>
            </TabsContent>

            {/* Specifications */}
            <TabsContent value="specifications" className="mt-6">
              <div className="bg-[#151515] border border-[#2a2a2a] rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    {[
                      { label: '📂 Category', value: `${categoryEmoji} ${product.category.name}` },
                      { label: '🔩 Steel Grade', value: product.steelGrade || 'N/A' },
                      { label: '📦 Capacity', value: product.capacity || 'N/A' },
                      { label: '📐 Dimensions', value: selectedVariant?.dimensions || product.dimensions || 'N/A' },
                      { label: '⚖️ Weight', value: selectedVariant?.weight || 'N/A' },
                      { label: '🛒 Minimum Order', value: product.moq ? `${product.moq} unit(s)` : '1 unit' },
                      { label: '🚚 Lead Time', value: product.leadTime || '7-10 days' },
                      { label: '📊 Stock Available', value: `${selectedVariant?.stock ?? product.stock} units` },
                      { label: '🏷️ Status', value: product.featured ? '⭐ Featured' : product.status === 'active' ? '✅ Active' : '📦 Draft' },
                      { label: '🏭 Brand', value: 'Urban Kitchen Manufacturing' },
                    ].map((row, i) => (
                      <tr key={row.label} className={i % 2 === 0 ? 'bg-[#1a1a1a]/50' : ''}>
                        <td className="px-5 py-3 text-gray-500 w-1/3">{row.label}</td>
                        <td className="px-5 py-3 text-white font-medium">{row.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* ─── RELATED PRODUCTS ─── */}
        {related.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-16"
          >
            <h2 className="font-[family-name:var(--font-poppins)] text-xl md:text-2xl font-bold mb-6">
              🔗 Related <span className="text-[#59ff00]">Products</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((rp) => {
                const rpEmoji = CATEGORY_EMOJIS[rp.category.name] || '🔧'
                return (
                  <button
                    key={rp.id}
                    onClick={() => setProductDetail(rp.id)}
                    className="group bg-[#151515] border border-[#2a2a2a] rounded-xl overflow-hidden hover:border-[#59ff00]/30 hover-lift transition-all text-left"
                  >
                    <div className="h-36 bg-[#1a1a1a] flex items-center justify-center overflow-hidden">
                      {(rp as any).featuredImage ? (
                        <img src={(rp as any).featuredImage} alt={rp.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-4xl">{rpEmoji}</span>
                      )}
                    </div>
                    <div className="p-4">
                      <Badge className="bg-[#59ff00]/10 text-[#59ff00] border-[#59ff00]/20 text-[10px] mb-2">
                        {rpEmoji} {rp.category.name}
                      </Badge>
                      <h3 className="text-white text-sm font-semibold line-clamp-2 group-hover:text-[#59ff00] transition-colors">
                        {rp.name}
                      </h3>
                      {rp.shortDescription && (
                        <p className="text-gray-500 text-xs mt-1 line-clamp-1">{rp.shortDescription}</p>
                      )}
                      <span className="font-[family-name:var(--font-poppins)] text-[#59ff00] font-bold text-sm mt-2 block">
                        {rp.price === 0 ? 'Request Quote' : formatPrice(rp.price)}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
