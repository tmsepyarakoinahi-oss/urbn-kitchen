'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  ShoppingCart,
  Eye,
  Flame,
  MessageSquare,
  SlidersHorizontal,
  X,
  ChevronDown,
  Package,
} from 'lucide-react'

// Category emoji mapping
const CATEGORY_EMOJIS: Record<string, string> = {
  'preparation-equipment': '🔪',
  'cooking-equipment': '🔥',
  'serving-equipment': '🍽️',
  'washing-equipment': '🧼',
  'storage-equipment': '📦',
  'refrigeration-equipment': '❄️',
  'bakery-equipment': '🍞',
  'display-equipment': '🏪',
  'food-carts': '🛒',
}

const CATEGORY_NAMES: Record<string, string> = {
  'preparation-equipment': 'Preparation Equipment',
  'cooking-equipment': 'Cooking Equipment',
  'serving-equipment': 'Serving Equipment',
  'washing-equipment': 'Washing Equipment',
  'storage-equipment': 'Storage Equipment',
  'refrigeration-equipment': 'Refrigeration Equipment',
  'bakery-equipment': 'Bakery Equipment',
  'display-equipment': 'Display Equipment',
  'food-carts': 'Food Carts',
}
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAppStore, type CartItem } from '@/lib/store'
import { toast } from 'sonner'

/* ─── helpers ─── */
const formatPrice = (price: number) => {
  if (price === 0) return 'Request Quote'
  const str = price.toString()
  let lastThree = str.substring(str.length - 3)
  const otherNumbers = str.substring(0, str.length - 3)
  if (otherNumbers !== '') lastThree = ',' + lastThree
  return '₹' + otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree
}

type SortOption = 'price-asc' | 'price-desc' | 'name-asc' | 'newest'

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
  price: number
  steelGrade?: string | null
  capacity?: string | null
  dimensions?: string | null
  stock: number
  moq?: number
  leadTime?: string | null
  featured?: boolean
  status: string
  category: { id: string; name: string; slug: string }
  featuredImage?: string | null
  images?: { image: string }[]
  variants?: ProductVariant[]
  priceRange?: { min: number; max: number }
  defaultVariant?: ProductVariant
}

interface Category {
  id: string
  name: string
  slug: string
  _count?: { products: number }
}

/* ─── Component ─── */
export default function ProductsPage() {
  const { setView, setProductDetail, addToCart, selectedCategory, setSelectedCategory, searchQuery, setSearchQuery, showQuickView, setShowQuickView, quickViewProductId } = useAppStore()
  
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [localSearch, setLocalSearch] = useState(searchQuery)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(selectedCategory ? [selectedCategory] : [])
  const [sort, setSort] = useState<SortOption>('newest')
  const [page, setPage] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)
  const [quickViewVariant, setQuickViewVariant] = useState<ProductVariant | null>(null)

  const PRODUCTS_PER_PAGE = 12

  // Load categories
  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => { if (data.status) setCategories(data.data || []) })
      .catch(console.error)
  }, [])

  // Load products with filters
  const loadProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', page.toString())
      params.set('limit', PRODUCTS_PER_PAGE.toString())
      
      if (selectedCategories.length === 1) {
        params.set('category', selectedCategories[0])
      }
      if (searchQuery) {
        params.set('search', searchQuery)
      }

      const res = await fetch(`/api/products?${params}`)
      const data = await res.json()
      if (data.status) {
        setProducts(data.data?.products || [])
        setTotalProducts(data.data?.pagination?.total || 0)
      }
    } catch (err) {
      console.error('Failed to load products:', err)
    } finally {
      setLoading(false)
    }
  }, [page, selectedCategories, searchQuery])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  // Handle category checkbox
  const toggleCategory = (slug: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(slug)) return prev.filter(c => c !== slug)
      return [slug] // single select for now
    })
    setPage(1)
  }

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchQuery(localSearch)
    setPage(1)
  }

  // Sort products client-side
  const sortedProducts = useMemo(() => {
    const sorted = [...products]
    switch (sort) {
      case 'price-asc': return sorted.sort((a, b) => a.price - b.price)
      case 'price-desc': return sorted.sort((a, b) => b.price - a.price)
      case 'name-asc': return sorted.sort((a, b) => a.name.localeCompare(b.name))
      case 'newest': default: return sorted
    }
  }, [products, sort])

  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE)

  const handleAddToCart = useCallback((product: Product, variant?: ProductVariant | null) => {
    const effectiveVariant = variant || product.defaultVariant || (product.variants?.length ? product.variants[0] : null)
    addToCart({
      id: effectiveVariant ? `${product.id}-${effectiveVariant.id}` : product.id,
      productId: product.id,
      name: product.name,
      price: effectiveVariant ? effectiveVariant.price : product.price,
      qty: 1,
      image: product.featuredImage || null,
      stock: effectiveVariant ? effectiveVariant.stock : product.stock,
      variantId: effectiveVariant?.id || null,
      variantName: effectiveVariant?.name || null,
      variantSku: effectiveVariant?.sku || null,
    })
    toast.success(`${product.name}${effectiveVariant ? ` (${effectiveVariant.name})` : ''} added to cart`)
  }, [addToCart])

  const handleQuickView = useCallback((product: Product) => {
    setQuickViewProduct(product)
    setQuickViewVariant(product.defaultVariant || null)
  }, [])

  return (
    <div className="min-h-screen bg-[#0b0b0b] pt-20 md:pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-[family-name:var(--font-poppins)] text-2xl md:text-3xl font-bold mb-2">
            Product <span className="text-[#59ff00]">Catalog</span>
          </h1>
          <p className="text-gray-500 text-sm">
            {totalProducts} products available
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* ─── SIDEBAR ─── */}
          <div className={`lg:w-64 shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-[#151515] border border-[#2a2a2a] rounded-xl p-5 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-[family-name:var(--font-poppins)] text-white font-semibold text-sm">
                  <SlidersHorizontal className="w-4 h-4 inline mr-2" />
                  Filters
                </h3>
                {(selectedCategories.length > 0 || searchQuery) && (
                  <button
                    onClick={() => { setSelectedCategories([]); setSearchQuery(''); setLocalSearch(''); setPage(1) }}
                    className="text-xs text-[#59ff00] hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <h4 className="text-gray-400 text-xs uppercase tracking-wider mb-3">Categories</h4>
                <div className="flex flex-col gap-2.5">
                  {categories.map((cat) => (
                    <label
                      key={cat.id}
                      className="flex items-center gap-2.5 cursor-pointer group"
                    >
                      <Checkbox
                        checked={selectedCategories.includes(cat.slug)}
                        onCheckedChange={() => toggleCategory(cat.slug)}
                        className="data-[state=checked]:bg-[#59ff00] data-[state=checked]:border-[#59ff00]"
                      />
                      <span className="text-sm text-gray-400 group-hover:text-white transition-colors">
                        {cat.name}
                      </span>
                      {cat._count && (
                        <span className="text-xs text-gray-600 ml-auto">{cat._count.products}</span>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ─── MAIN CONTENT ─── */}
          <div className="flex-1 min-w-0">
            {/* Search & Sort Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
              <form onSubmit={handleSearch} className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  placeholder="Search products by name, grade, description..."
                  className="bg-[#1a1a1a] border-[#2a2a2a] text-white pl-9 h-10"
                />
                {localSearch && (
                  <button
                    type="button"
                    onClick={() => { setLocalSearch(''); setSearchQuery(''); setPage(1) }}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <X className="w-4 h-4 text-gray-500 hover:text-white" />
                  </button>
                )}
              </form>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden border-[#2a2a2a] text-gray-400 hover:text-white hover:bg-[#1a1a1a]"
                >
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filters
                </Button>

                <div className="relative">
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortOption)}
                    className="appearance-none bg-[#1a1a1a] border border-[#2a2a2a] text-gray-400 text-sm rounded-lg h-10 pl-3 pr-8 focus:outline-none focus:border-[#59ff00]/40"
                  >
                    <option value="newest">Newest First</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="name-asc">Name: A to Z</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Active Filters */}
            {(selectedCategories.length > 0 || searchQuery) && (
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {selectedCategories.map(slug => {
                  const cat = categories.find(c => c.slug === slug)
                  return cat ? (
                    <Badge key={slug} className="bg-[#59ff00]/10 text-[#59ff00] border-[#59ff00]/20 gap-1 cursor-pointer" onClick={() => toggleCategory(slug)}>
                      {cat.name}
                      <X className="w-3 h-3" />
                    </Badge>
                  ) : null
                })}
                {searchQuery && (
                  <Badge className="bg-[#59ff00]/10 text-[#59ff00] border-[#59ff00]/20 gap-1 cursor-pointer" onClick={() => { setSearchQuery(''); setLocalSearch(''); setPage(1) }}>
                    &quot;{searchQuery}&quot;
                    <X className="w-3 h-3" />
                  </Badge>
                )}
              </div>
            )}

            {/* Product Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-[#151515] border border-[#2a2a2a] rounded-xl h-80 animate-pulse" />
                ))}
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="text-center py-20">
                <Package className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                <h3 className="text-gray-400 text-lg mb-2">No products found</h3>
                <p className="text-gray-600 text-sm mb-4">Try adjusting your filters or search terms</p>
                <Button
                  onClick={() => { setSelectedCategories([]); setSearchQuery(''); setLocalSearch(''); setPage(1) }}
                  variant="outline"
                  className="border-[#59ff00] text-[#59ff00] hover:bg-[#59ff00]/10"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {sortedProducts.map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="group bg-[#151515] border border-[#2a2a2a] rounded-xl overflow-hidden hover:border-[#59ff00]/30 hover-lift transition-all"
                  >
                    {/* Image */}
                    <div className="relative h-48 bg-[#1a1a1a] flex items-center justify-center overflow-hidden">
                      {product.featuredImage ? (
                        <img src={product.featuredImage} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-5xl">{CATEGORY_EMOJIS[product.category.slug] || '🔧'}</span>
                          <span className="text-gray-600 text-xs">{product.category.name}</span>
                        </div>
                      )}
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleQuickView(product)}
                          className="bg-white/10 backdrop-blur text-white hover:bg-white/20 h-9"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Quick View
                        </Button>
                      </div>

                      {/* Badges */}
                      <Badge className="absolute top-3 left-3 bg-[#0b0b0b]/80 text-gray-300 border-[#2a2a2a] text-xs">
                        {CATEGORY_EMOJIS[product.category.slug] || ''} {product.category.name}
                      </Badge>
                      
                      <div className="absolute top-3 right-3">
                        {product.stock > 0 ? (
                          <Badge className="bg-[#59ff00]/20 text-[#59ff00] border-[#59ff00]/30 text-xs">
                            ✅ In Stock
                          </Badge>
                        ) : (
                          <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                            ❌ Out of Stock
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3
                        onClick={() => setProductDetail(product.id)}
                        className="text-white font-semibold text-sm mb-1.5 line-clamp-2 cursor-pointer group-hover:text-[#59ff00] transition-colors"
                      >
                        {CATEGORY_EMOJIS[product.category.slug] || '🔧'} {product.name}
                      </h3>
                      
                      {product.shortDescription && (
                        <p className="text-gray-500 text-xs mb-2 line-clamp-2">{product.shortDescription}</p>
                      )}
                      
                      <div className="flex items-center flex-wrap gap-1.5 mb-3">
                        {product.steelGrade && (
                          <span className="bg-[#1a1a1a] text-gray-400 px-2 py-0.5 rounded text-xs">🔩 {product.steelGrade}</span>
                        )}
                        {product.capacity && (
                          <span className="bg-[#1a1a1a] text-gray-400 px-2 py-0.5 rounded text-xs">📦 {product.capacity}</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-[family-name:var(--font-poppins)] text-[#59ff00] font-bold text-lg">
                          {product.variants?.length && product.priceRange && product.priceRange.min !== product.priceRange.max
                            ? `${formatPrice(product.priceRange.min)} - ${formatPrice(product.priceRange.max)}`
                            : formatPrice(product.price)}
                        </span>
                      </div>
                      {product.variants && product.variants.length > 0 && (
                        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                          {product.variants.map((v) => (
                            <span key={v.id} className="bg-[#1a1a1a] text-gray-400 px-1.5 py-0.5 rounded text-[10px] border border-[#2a2a2a]">
                              {v.name}
                            </span>
                          ))}
                        </div>
                      )}
                      {!product.variants?.length && <div className="mb-3" />}

                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleAddToCart(product)}
                          disabled={(product.defaultVariant?.stock ?? product.variants?.[0]?.stock ?? product.stock) === 0}
                          className="flex-1 bg-[#59ff00] text-black hover:bg-[#59ff00]/90 h-9 text-xs font-semibold"
                        >
                          <ShoppingCart className="w-3.5 h-3.5 mr-1" />
                          Add to Cart
                        </Button>
                        <Button
                          onClick={() => setProductDetail(product.id)}
                          variant="outline"
                          className="border-[#2a2a2a] text-gray-400 hover:text-white hover:bg-[#1a1a1a] h-9 px-3"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => setView('contact')}
                          variant="outline"
                          className="border-[#2a2a2a] text-gray-400 hover:text-white hover:bg-[#1a1a1a] h-9 px-3"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-10">
                <Button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  variant="outline"
                  className="border-[#2a2a2a] text-gray-400 hover:text-white hover:bg-[#1a1a1a]"
                >
                  Previous
                </Button>
                <span className="text-gray-500 text-sm">
                  Page {page} of {totalPages}
                </span>
                <Button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  variant="outline"
                  className="border-[#2a2a2a] text-gray-400 hover:text-white hover:bg-[#1a1a1a]"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── QUICK VIEW MODAL ─── */}
      <Dialog open={!!quickViewProduct} onOpenChange={(open) => { if (!open) { setQuickViewProduct(null); setQuickViewVariant(null) } }}>
        <DialogContent className="bg-[#151515] border-[#2a2a2a] text-white max-w-2xl">
          {quickViewProduct && (
            <>
              <DialogHeader>
                <DialogTitle className="font-[family-name:var(--font-poppins)] text-white">
                  {quickViewProduct.name}
                </DialogTitle>
              </DialogHeader>
              {/* Variant Selector */}
              {quickViewProduct.variants && quickViewProduct.variants.length > 0 && (
                <div className="mt-2">
                  <label className="text-white text-sm font-medium mb-2 block">Select Size</label>
                  <div className="flex flex-wrap gap-2">
                    {quickViewProduct.variants.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setQuickViewVariant(v)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                          quickViewVariant?.id === v.id
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                {/* Image */}
                <div className="h-64 bg-[#1a1a1a] rounded-xl flex items-center justify-center overflow-hidden">
                  {quickViewProduct.featuredImage ? (
                    <img src={quickViewProduct.featuredImage} alt={quickViewProduct.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-6xl">{CATEGORY_EMOJIS[quickViewProduct.category.slug] || '🔧'}</span>
                      <span className="text-gray-600 text-xs">{quickViewProduct.category.name}</span>
                    </div>
                  )}
                </div>
                {/* Details */}
                <div className="flex flex-col">
                  <Badge className="w-fit bg-[#59ff00]/10 text-[#59ff00] border-[#59ff00]/20 mb-3">
                    {CATEGORY_EMOJIS[quickViewProduct.category.slug] || ''} {quickViewProduct.category.name}
                  </Badge>
                  
                  <span className="font-[family-name:var(--font-poppins)] text-[#59ff00] text-2xl font-bold mb-3">
                    {quickViewVariant
                      ? formatPrice(quickViewVariant.price)
                      : quickViewProduct.variants?.length && quickViewProduct.priceRange && quickViewProduct.priceRange.min !== quickViewProduct.priceRange.max
                        ? `${formatPrice(quickViewProduct.priceRange.min)} - ${formatPrice(quickViewProduct.priceRange.max)}`
                        : formatPrice(quickViewProduct.price)}
                  </span>

                  <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                    {quickViewProduct.shortDescription || quickViewProduct.description}
                  </p>

                  <div className="flex flex-col gap-2 text-sm mb-4">
                    {quickViewProduct.steelGrade && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">🔩 Steel Grade</span>
                        <span className="text-white">{quickViewProduct.steelGrade}</span>
                      </div>
                    )}
                    {quickViewProduct.capacity && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">📦 Capacity</span>
                        <span className="text-white">{quickViewProduct.capacity}</span>
                      </div>
                    )}
                    {quickViewProduct.dimensions && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">📐 Dimensions</span>
                        <span className="text-white">{quickViewProduct.dimensions}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-500">📊 Availability</span>
                      <span className={(quickViewVariant?.stock ?? quickViewProduct.stock) > 0 ? 'text-[#59ff00]' : 'text-red-400'}>
                        {(quickViewVariant?.stock ?? quickViewProduct.stock) > 0
                          ? `${quickViewVariant?.stock ?? quickViewProduct.stock} in stock`
                          : 'Out of stock'}
                      </span>
                    </div>
                    {quickViewProduct.leadTime && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">🚚 Lead Time</span>
                        <span className="text-white">{quickViewProduct.leadTime}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-auto">
                    <Button
                      onClick={() => { handleAddToCart(quickViewProduct, quickViewVariant); setQuickViewProduct(null); setQuickViewVariant(null) }}
                      disabled={(quickViewVariant?.stock ?? quickViewProduct.stock) === 0}
                      className="flex-1 bg-[#59ff00] text-black hover:bg-[#59ff00]/90 font-semibold"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                    <Button
                      onClick={() => {
                        const productId = quickViewProduct.id
                        setQuickViewProduct(null)
                        setQuickViewVariant(null)
                        // Small delay to let dialog close animation finish
                        setTimeout(() => setProductDetail(productId), 100)
                      }}
                      variant="outline"
                      className="border-[#59ff00] text-[#59ff00] hover:bg-[#59ff00]/10"
                    >
                      📋 Full Details
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
