'use client'

import { motion } from 'framer-motion'
import {
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  ArrowLeft,
  Tag,
  ShoppingBag,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'

const formatPrice = (price: number) => {
  if (price === 0) return 'Request Quote'
  const str = price.toString()
  let lastThree = str.substring(str.length - 3)
  const otherNumbers = str.substring(0, str.length - 3)
  if (otherNumbers !== '') lastThree = ',' + lastThree
  return '₹' + otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree
}

export default function CartPage() {
  const { cartItems, updateCartQty, removeFromCart, clearCart, cartCount, setView } = useAppStore()

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0)
  const gst = Math.round(subtotal * 0.18)
  const shipping = subtotal > 50000 ? 0 : 2500
  const total = subtotal + gst + shipping

  const handleRemoveItem = (productId: string, name: string) => {
    removeFromCart(productId)
    toast.success(`${name} removed from cart`)
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] pt-20 md:pt-24 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center px-4"
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-[#151515] border border-[#2a2a2a] flex items-center justify-center">
            <ShoppingCart className="w-10 h-10 text-gray-700" />
          </div>
          <h2 className="font-[family-name:var(--font-poppins)] text-xl md:text-2xl font-bold text-white mb-2">
            Your Cart is Empty
          </h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Looks like you haven&apos;t added any products to your cart yet. Explore our catalog to find premium commercial kitchen equipment.
          </p>
          <Button
            onClick={() => setView('products')}
            className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90 font-semibold px-8 h-12"
          >
            <ShoppingBag className="w-5 h-5 mr-2" />
            Continue Shopping
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0b0b0b] pt-20 md:pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => setView('products')}
            className="flex items-center gap-2 text-gray-500 hover:text-[#59ff00] text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </button>
          <div className="flex items-center justify-between">
            <h1 className="font-[family-name:var(--font-poppins)] text-2xl md:text-3xl font-bold">
              Shopping <span className="text-[#59ff00]">Cart</span>
            </h1>
            <span className="text-gray-500 text-sm">{cartCount} item(s)</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ─── CART ITEMS ─── */}
          <div className="lg:col-span-2">
            <div className="flex flex-col gap-4">
              {cartItems.map((item, i) => (
                <motion.div
                  key={`${item.productId}-${item.variantId ?? 'no-variant'}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-[#151515] border border-[#2a2a2a] rounded-xl p-4 sm:p-5 flex gap-4"
                >
                  {/* Image */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#1a1a1a] rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingBag className="w-8 h-8 text-gray-700" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-sm sm:text-base line-clamp-2 mb-1">
                      {item.name}
                      {item.variantName && (
                        <span className="text-[#59ff00] text-xs font-normal ml-2">({item.variantName})</span>
                      )}
                    </h3>
                    <p className="text-[#59ff00] font-[family-name:var(--font-poppins)] font-bold text-sm sm:text-base mb-2">
                      {formatPrice(item.price)}
                    </p>

                    <div className="flex items-center justify-between flex-wrap gap-3">
                      {/* Quantity Selector */}
                      <div className="flex items-center bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg">
                        <button
                          onClick={() => updateCartQty(item.productId, item.qty - 1, item.variantId)}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-10 text-center text-white text-sm font-semibold">{item.qty}</span>
                        <button
                          onClick={() => updateCartQty(item.productId, item.qty + 1, item.variantId)}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-white font-semibold text-sm sm:text-base">
                          {formatPrice(item.price * item.qty)}
                        </span>
                        <button
                          onClick={() => { removeFromCart(item.productId, item.variantId); toast.success(`${item.name}${item.variantName ? ` (${item.variantName})` : ''} removed from cart`) }}
                          className="text-gray-600 hover:text-red-400 transition-colors p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Clear Cart */}
            <div className="mt-4 flex justify-end">
              <Button
                onClick={clearCart}
                variant="ghost"
                className="text-gray-600 hover:text-red-400 text-sm"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Cart
              </Button>
            </div>
          </div>

          {/* ─── ORDER SUMMARY ─── */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[#151515] border border-[#2a2a2a] rounded-xl p-6 sticky top-24"
            >
              <h2 className="font-[family-name:var(--font-poppins)] text-white font-semibold text-lg mb-4">
                Order Summary
              </h2>

              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-white">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">GST (18%)</span>
                  <span className="text-white">{formatPrice(gst)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Shipping</span>
                  <span className={shipping === 0 ? 'text-[#59ff00]' : 'text-white'}>
                    {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-gray-600 text-xs">Free shipping on orders above ₹50,000</p>
                )}
              </div>

              <Separator className="bg-[#2a2a2a] my-4" />

              <div className="flex justify-between items-center mb-6">
                <span className="text-white font-semibold text-base">Total</span>
                <span className="font-[family-name:var(--font-poppins)] text-[#59ff00] font-bold text-xl">
                  {formatPrice(total)}
                </span>
              </div>

              {/* Coupon */}
              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    placeholder="Coupon code"
                    className="bg-[#1a1a1a] border-[#2a2a2a] text-white pl-9 h-9 text-sm"
                  />
                </div>
                <Button
                  variant="outline"
                  className="border-[#2a2a2a] text-gray-400 hover:text-white hover:bg-[#1a1a1a] h-9"
                >
                  Apply
                </Button>
              </div>

              <Button
                onClick={() => setView('checkout')}
                className="w-full bg-[#59ff00] text-black hover:bg-[#59ff00]/90 font-bold h-12 text-base neon-glow"
              >
                Proceed to Checkout
              </Button>

              <button
                onClick={() => setView('products')}
                className="w-full text-center text-gray-500 hover:text-[#59ff00] text-sm mt-3 transition-colors"
              >
                Continue Shopping
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
