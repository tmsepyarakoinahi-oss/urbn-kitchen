'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ShoppingCart,
  MessageSquare,
  Minus,
  Plus,
  Flame,
  Package,
  Clock,
  Shield,
  Truck,
  CheckCircle2,
  Info,
  FileText,
  ListChecks,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { useAppStore, type CartItem } from '@/lib/store'
import { toast } from 'sonner'

const formatPrice = (price: number) => {
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
  const [qty, setQty] = useState(1)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)

  const [prevId, setPrevId] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedProductId) return
    if (selectedProductId === prevId) return
    setPrevId(selectedProductId)
    setQty(1)
    setProduct(null)
    setRelated([])

    let cancelled = false
    const load = async () => {
      try {
        const res = await fetch(`/api/products/${selectedProductId}`)
        const data = await res.json()
        if (cancelled) return
        if (data.status && data.data) {
          setProduct(data.data)
          // Pre-select the default variant if it exists
          setSelectedVariant(data.data.defaultVariant || null)
          if (data.data.category?.slug) {
            const rdRes = await fetch(`/api/products?category=${data.data.category.slug}&limit=4`)
            const rd = await rdRes.json()
            if (!cancelled && rd.status) {
              setRelated((rd.data?.products || []).filter((p: RelatedProduct) => p.id !== selectedProductId).slice(0, 4))
            }
          }
        }
      } catch (err) {
        if (!cancelled) console.error(err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    setLoading(true)
    load()
    return () => { cancelled = true }
  }, [selectedProductId, prevId])

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
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] pt-20 md:pt-24 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <h2 className="text-gray-400 text-xl mb-4">Product not found</h2>
          <Button onClick={() => setView('products')} className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90">
            Browse Products
          </Button>
        </div>
      </div>
    )
  }

  const categoryEmoji = CATEGORY_EMOJIS[product.category.name] || '🔧'

  // Determine what description content to show
  const hasShortDesc = !!product.shortDescription
  const hasLongDesc = !!product.longDescription
  const hasBasicDesc = !!product.description
  // Always show Full Details tab - use longDescription or fallback to description
  const fullDetailsContent = product.longDescription || product.description || 'No detailed description available for this product.'

  return (
    <div className="min-h-screen bg-[#0b0b0b] pt-20 md:pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => setView('products')}
          className="flex items-center gap-2 text-gray-500 hover:text-[#59ff00] text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* ─── IMAGE ─── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative h-72 sm:h-96 lg:h-[500px] bg-[#151515] border border-[#2a2a2a] rounded-xl flex items-center justify-center overflow-hidden">
              {product.featuredImage ? (
                <img src={product.featuredImage} alt={product.name} className="w-full h-full object-cover" />
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
              <p className="text-gray-300 text-sm mb-4 leading-relaxed border-l-2 border-[#59ff00]/40 pl-3">{product.shortDescription}</p>
            )}
            {!hasShortDesc && hasBasicDesc && (
              <p className="text-gray-400 text-sm mb-4 leading-relaxed border-l-2 border-[#59ff00]/40 pl-3">{product.description}</p>
            )}

            {/* Price */}
            <div className="font-[family-name:var(--font-poppins)] text-[#59ff00] text-3xl sm:text-4xl font-bold mb-4">
              {selectedVariant
                ? formatPrice(selectedVariant.price)
                : product.variants?.length && product.priceRange && product.priceRange.min !== product.priceRange.max
                  ? `${formatPrice(product.priceRange.min)} - ${formatPrice(product.priceRange.max)}`
                  : formatPrice(product.price)}
              <span className="text-gray-600 text-sm font-normal ml-2">+ GST</span>
            </div>

            {/* Variant Selector */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-6">
                <label className="text-white text-sm font-medium mb-2.5 block">Select Size</label>
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
                  ? `${selectedVariant?.stock ?? product.stock} units in stock`
                  : 'Currently out of stock'}
              </span>
              {product.moq && product.moq > 1 && (
                <span className="text-gray-600 text-xs ml-2">| MOQ: {product.moq}</span>
              )}
            </div>

            <Separator className="bg-[#2a2a2a] mb-6" />

            {/* Quantity & Add to Cart */}
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
                className="flex-1 bg-[#59ff00] text-black hover:bg-[#59ff00]/90 font-bold h-12 text-base neon-glow"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart — {formatPrice((selectedVariant?.price ?? product.price) * qty)}
              </Button>
            </div>

            <Button
              onClick={() => setView('contact')}
              variant="outline"
              className="border-[#59ff00] text-[#59ff00] hover:bg-[#59ff00]/10 font-semibold h-11 mb-4"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Request Inquiry / Quote
            </Button>

            {/* Trust badges */}
            <div className="flex items-center gap-4 text-xs text-gray-600 mt-2">
              <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> 🚚 Pan India Delivery</span>
              <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> 🛡️ Warranty Included</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> ⏱️ {product.leadTime || '7-10 days'}</span>
            </div>
          </motion.div>
        </div>

        {/* ─── TABS: DESCRIPTION, LONG DESCRIPTION & SPECS ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12"
        >
          <Tabs defaultValue="full-details" className="w-full">
            <TabsList className="bg-[#151515] border border-[#2a2a2a] p-1 h-auto">
              <TabsTrigger value="overview" className="data-[state=active]:bg-[#59ff00]/10 data-[state=active]:text-[#59ff00]">
                <Info className="w-4 h-4 mr-1.5" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="full-details" className="data-[state=active]:bg-[#59ff00]/10 data-[state=active]:text-[#59ff00]">
                <FileText className="w-4 h-4 mr-1.5" />
                📋 Full Details
              </TabsTrigger>
              <TabsTrigger value="specifications" className="data-[state=active]:bg-[#59ff00]/10 data-[state=active]:text-[#59ff00]">
                <ListChecks className="w-4 h-4 mr-1.5" />
                Specifications
              </TabsTrigger>
            </TabsList>

            {/* Overview - Quick Summary */}
            <TabsContent value="overview" className="mt-6">
              <div className="bg-[#151515] border border-[#2a2a2a] rounded-xl p-6">
                {hasShortDesc && (
                  <div className="mb-4 pb-4 border-b border-[#2a2a2a]">
                    <h3 className="text-[#59ff00] text-sm font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
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
                  <p className="text-gray-500 text-sm italic">No description available.</p>
                )}
              </div>
            </TabsContent>

            {/* Full Details - Always shown, uses longDescription or falls back to description */}
            <TabsContent value="full-details" className="mt-6">
              <div className="bg-[#151515] border border-[#2a2a2a] rounded-xl p-6">
                <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#59ff00]" />
                  {categoryEmoji} {product.name} — Full Details
                </h3>
                {hasLongDesc ? (
                  <div className="text-gray-300 leading-relaxed whitespace-pre-line text-sm">
                    {product.longDescription}
                  </div>
                ) : hasBasicDesc ? (
                  <div className="text-gray-300 leading-relaxed whitespace-pre-line text-sm">
                    {product.description}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm italic">No detailed description available for this product yet. Please contact us for more information.</p>
                )}
                {/* Key Features Section */}
                <div className="mt-6 pt-4 border-t border-[#2a2a2a]">
                  <h4 className="text-[#59ff00] text-sm font-semibold mb-3 flex items-center gap-2">
                    🔑 Key Features
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {product.steelGrade && (
                      <li className="flex items-center gap-2 text-gray-400 text-sm">
                        <span className="text-[#59ff00]">✓</span> Steel Grade: {product.steelGrade}
                      </li>
                    )}
                    {product.capacity && (
                      <li className="flex items-center gap-2 text-gray-400 text-sm">
                        <span className="text-[#59ff00]">✓</span> Capacity: {product.capacity}
                      </li>
                    )}
                    {(selectedVariant?.dimensions || product.dimensions) && (
                      <li className="flex items-center gap-2 text-gray-400 text-sm">
                        <span className="text-[#59ff00]">✓</span> Dimensions: {selectedVariant?.dimensions || product.dimensions}
                      </li>
                    )}
                    {product.leadTime && (
                      <li className="flex items-center gap-2 text-gray-400 text-sm">
                        <span className="text-[#59ff00]">✓</span> Lead Time: {product.leadTime}
                      </li>
                    )}
                    <li className="flex items-center gap-2 text-gray-400 text-sm">
                      <span className="text-[#59ff00]">✓</span> MOQ: {product.moq || 1} unit(s)
                    </li>
                    <li className="flex items-center gap-2 text-gray-400 text-sm">
                      <span className="text-[#59ff00]">✓</span> Stock: {selectedVariant?.stock ?? product.stock} units
                    </li>
                    {product.featured && (
                      <li className="flex items-center gap-2 text-gray-400 text-sm">
                        <span className="text-[#59ff00]">✓</span> ⭐ Featured Product
                      </li>
                    )}
                    <li className="flex items-center gap-2 text-gray-400 text-sm">
                      <span className="text-[#59ff00]">✓</span> Pan India Delivery
                    </li>
                  </ul>
                </div>
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
                      { label: '🚚 Lead Time', value: product.leadTime || 'N/A' },
                      { label: '📊 Stock Available', value: `${selectedVariant?.stock ?? product.stock} units` },
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
              Related <span className="text-[#59ff00]">Products</span>
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
                      <h3 className="text-white text-sm font-semibold line-clamp-2 group-hover:text-[#59ff00] transition-colors">
                        {rp.name}
                      </h3>
                      <span className="font-[family-name:var(--font-poppins)] text-[#59ff00] font-bold text-sm mt-1 block">
                        {formatPrice(rp.price)}
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
