'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  CheckCircle2,
  Package,
  Truck,
  CircleCheck,
  Clock,
  ShoppingBag,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Printer,
  CreditCard,
  Banknote,
  Building2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'

// ─── Price Formatting ────────────────────────────────────────
const formatPrice = (price: number) => {
  if (price === 0) return 'Request Quote'
  const str = price.toString()
  let lastThree = str.substring(str.length - 3)
  const otherNumbers = str.substring(0, str.length - 3)
  if (otherNumbers !== '') lastThree = ',' + lastThree
  return '₹' + otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree
}

// ─── Payment Method Labels ───────────────────────────────────
const PAYMENT_LABELS: Record<string, { label: string; icon: React.ElementType }> = {
  cod: { label: 'Cash on Delivery', icon: Banknote },
  razorpay: { label: 'Razorpay (Online Payment)', icon: CreditCard },
  bank_transfer: { label: 'Bank Transfer / NEFT', icon: Building2 },
}

// ─── Delivery Timeline ───────────────────────────────────────
const TIMELINE_STEPS = [
  { label: 'Order Confirmed', icon: CircleCheck },
  { label: 'Processing', icon: Clock },
  { label: 'Shipped', icon: Truck },
  { label: 'Delivered', icon: Package },
]

// ─── Animation Variants ──────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.3 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

// ─── Main Component ──────────────────────────────────────────
export default function OrderSuccessPage() {
  const { lastOrder, setView, setCustomerTab } = useAppStore()

  // ─── Computed Values ──────────────────────────────────
  const orderData = useMemo(() => {
    if (!lastOrder) return null
    return lastOrder
  }, [lastOrder])

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  const paymentInfo = orderData?.paymentMethod
    ? PAYMENT_LABELS[orderData.paymentMethod] || PAYMENT_LABELS.cod
    : PAYMENT_LABELS.cod

  const PaymentIcon = paymentInfo.icon

  // ─── No Order Guard ───────────────────────────────────
  if (!orderData) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] pt-20 md:pt-24 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center px-4"
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-[#151515] border border-[#2a2a2a] flex items-center justify-center">
            <Package className="w-10 h-10 text-gray-700" />
          </div>
          <h2 className="font-[family-name:var(--font-poppins)] text-xl md:text-2xl font-bold text-white mb-2">
            No Order Found
          </h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            We couldn&apos;t find any recent order. Start shopping to place your first order!
          </p>
          <Button
            onClick={() => setView('products')}
            className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90 font-semibold px-8 h-12"
          >
            <ShoppingBag className="w-5 h-5 mr-2" />
            Browse Products
          </Button>
        </motion.div>
      </div>
    )
  }

  // ─── Parse shipping address ───────────────────────────
  const addressParts = (orderData.shippingAddress || '').split(',').map((s: string) => s.trim()).filter(Boolean)

  return (
    <div className="min-h-screen bg-[#0b0b0b] pt-20 md:pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center"
        >
          {/* ─── Success Checkmark ──────────────────────── */}
          <motion.div
            variants={itemVariants}
            className="relative mb-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
              className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-[#59ff00]/10 border-2 border-[#59ff00] flex items-center justify-center neon-glow"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.4 }}
              >
                <CheckCircle2 className="w-12 h-12 md:w-14 md:h-14 text-[#59ff00]" />
              </motion.div>
            </motion.div>
            {/* Confetti-like particles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, x: 0, y: 0 }}
                animate={{
                  scale: [0, 1, 0],
                  x: [0, (Math.random() - 0.5) * 100],
                  y: [0, (Math.random() - 0.5) * 100 - 30],
                }}
                transition={{ duration: 0.8, delay: 0.6 + i * 0.1 }}
                className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-[#59ff00]"
              />
            ))}
          </motion.div>

          {/* ─── Title ──────────────────────────────────── */}
          <motion.div variants={itemVariants} className="text-center mb-2">
            <h1 className="font-[family-name:var(--font-poppins)] text-2xl md:text-3xl font-bold text-white">
              Order Placed <span className="text-[#59ff00]">Successfully!</span>
            </h1>
          </motion.div>

          {/* ─── Order Number ───────────────────────────── */}
          <motion.div variants={itemVariants} className="mb-8">
            <p className="text-gray-400 text-sm">
              Order Number:{' '}
              <span className="text-[#59ff00] font-[family-name:var(--font-poppins)] font-bold text-lg">
                {orderData.orderNumber || `#${orderData.id?.slice(0, 8) || 'N/A'}`}
              </span>
            </p>
          </motion.div>

          {/* ─── Order Details Card ─────────────────────── */}
          <motion.div
            variants={itemVariants}
            className="w-full bg-[#151515] border border-[#2a2a2a] rounded-xl p-6 md:p-8 mb-6"
          >
            {/* Order Info Row */}
            <div className="flex flex-wrap gap-x-8 gap-y-2 mb-6 text-sm">
              <div className="flex items-center gap-2 text-gray-400">
                <Package className="w-4 h-4 text-[#59ff00]" />
                <span>Order ID: <span className="text-white font-medium">{orderData.id?.slice(0, 8) || 'N/A'}</span></span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Clock className="w-4 h-4 text-[#59ff00]" />
                <span>Date: <span className="text-white font-medium">{formatDate(orderData.createdAt || new Date().toISOString())}</span></span>
              </div>
            </div>

            {/* Items */}
            <div className="mb-6">
              <h3 className="font-[family-name:var(--font-poppins)] text-white font-semibold text-base mb-3">Items Ordered</h3>
              <div className="flex flex-col gap-2.5">
                {(orderData.items || []).map((item: any, i: number) => (
                  <div
                    key={item.id || i}
                    className="flex items-center gap-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3"
                  >
                    <div className="w-10 h-10 bg-[#151515] rounded-md flex items-center justify-center shrink-0 border border-[#2a2a2a]">
                      {item.product?.featuredImage ? (
                        <img src={item.product.featuredImage} alt={item.product?.name || ''} className="w-full h-full object-cover rounded-md" />
                      ) : (
                        <ShoppingBag className="w-4 h-4 text-gray-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{item.product?.name || `Product #${item.productId?.slice(0, 6)}`}</p>
                      <p className="text-gray-500 text-xs">Qty: {item.qty} × {formatPrice(item.price || 0)}</p>
                    </div>
                    <span className="text-white text-sm font-semibold shrink-0">
                      {formatPrice((item.price || 0) * (item.qty || 1))}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="bg-[#2a2a2a] my-5" />

            {/* Price Breakdown */}
            <div className="flex flex-col gap-2 text-sm mb-5">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-white">{formatPrice(orderData.subtotal || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">GST (18%)</span>
                <span className="text-white">{formatPrice(orderData.tax || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping</span>
                <span className={orderData.shipping === 0 ? 'text-[#59ff00]' : 'text-white'}>
                  {orderData.shipping === 0 ? 'FREE' : formatPrice(orderData.shipping || 0)}
                </span>
              </div>
            </div>

            <Separator className="bg-[#2a2a2a] my-4" />

            <div className="flex justify-between items-center mb-6">
              <span className="text-white font-semibold text-base">Total</span>
              <span className="font-[family-name:var(--font-poppins)] text-[#59ff00] font-bold text-2xl">
                {formatPrice(orderData.total || 0)}
              </span>
            </div>

            {/* Payment & Address Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Payment Method */}
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Payment Method</p>
                <div className="flex items-center gap-2">
                  <PaymentIcon className="w-5 h-5 text-[#59ff00]" />
                  <span className="text-white text-sm font-medium">{paymentInfo.label}</span>
                </div>
                {orderData.paymentStatus && (
                  <Badge className="mt-2 bg-[#59ff00]/10 text-[#59ff00] border-[#59ff00]/20 text-xs">
                    {orderData.paymentStatus === 'paid' ? 'Paid' : orderData.paymentStatus === 'pending' ? 'Payment Pending' : orderData.paymentStatus}
                  </Badge>
                )}
              </div>

              {/* Shipping Address */}
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Shipping Address</p>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#59ff00] mt-0.5 shrink-0" />
                  <p className="text-white text-sm leading-relaxed">
                    {addressParts.length > 0 ? addressParts.join(', ') : 'Address not provided'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ─── Delivery Timeline ──────────────────────── */}
          <motion.div
            variants={itemVariants}
            className="w-full bg-[#151515] border border-[#2a2a2a] rounded-xl p-6 md:p-8 mb-6"
          >
            <h3 className="font-[family-name:var(--font-poppins)] text-white font-semibold text-base mb-6">
              Delivery <span className="text-[#59ff00]">Timeline</span>
            </h3>

            <div className="flex items-start justify-between relative">
              {/* Progress Line Background */}
              <div className="absolute top-5 left-[10%] right-[10%] h-0.5 bg-[#2a2a2a] z-0" />
              {/* Progress Line Active (only first step) */}
              <div className="absolute top-5 left-[10%] w-0 h-0.5 bg-[#59ff00] z-0" style={{ width: '0%' }} />

              {TIMELINE_STEPS.map((step, i) => {
                const isCompleted = i === 0 // "Order Confirmed" is completed
                const isActive = i === 1   // "Processing" is the current active step
                const StepIcon = step.icon

                return (
                  <div key={step.label} className="flex flex-col items-center z-10 flex-1">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.6 + i * 0.15, type: 'spring', stiffness: 200 }}
                      className={`
                        w-10 h-10 rounded-full flex items-center justify-center border-2 mb-2
                        ${isActive
                          ? 'bg-[#59ff00]/20 border-[#59ff00] text-[#59ff00]'
                          : isCompleted
                            ? 'bg-[#59ff00] border-[#59ff00] text-black'
                            : 'bg-[#1a1a1a] border-[#2a2a2a] text-gray-600'
                        }
                      `}
                    >
                      <StepIcon className="w-4 h-4" />
                    </motion.div>
                    <span className={`
                      text-xs text-center font-medium leading-tight max-w-[80px]
                      ${isActive ? 'text-[#59ff00]' : 'text-gray-600'}
                    `}>
                      {step.label}
                    </span>
                  </div>
                )
              })}
            </div>

            <p className="text-gray-500 text-xs mt-4 text-center">
              Estimated delivery: 5–7 business days
            </p>
          </motion.div>

          {/* ─── CTA Buttons ────────────────────────────── */}
          <motion.div
            variants={itemVariants}
            className="w-full flex flex-col sm:flex-row gap-3 mb-6"
          >
            <Button
              onClick={() => {
                setCustomerTab('orders')
                setView('customer-portal')
              }}
              className="flex-1 bg-[#151515] border border-[#2a2a2a] text-white hover:bg-[#1a1a1a] hover:border-[#59ff00]/30 h-12 font-semibold"
            >
              <Package className="w-4 h-4 mr-2" />
              View My Orders
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              onClick={() => setView('products')}
              className="flex-1 bg-[#59ff00] text-black hover:bg-[#59ff00]/90 font-semibold h-12 neon-glow"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
          </motion.div>

          {/* ─── Support Info ───────────────────────────── */}
          <motion.div
            variants={itemVariants}
            className="w-full bg-[#151515] border border-[#2a2a2a] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm"
          >
            <div className="flex items-center gap-2 text-gray-400">
              <Phone className="w-4 h-4 text-[#59ff00]" />
              <span>Need help? Contact us at <span className="text-white font-medium">+91-7080488840</span></span>
            </div>
            <Separator orientation="vertical" className="h-4 bg-[#2a2a2a] hidden sm:block" />
            <div className="flex items-center gap-2 text-gray-400">
              <Mail className="w-4 h-4 text-[#59ff00]" />
              <span>support@urbankitchens.in</span>
            </div>
          </motion.div>

          {/* ─── Print Button ───────────────────────────── */}
          <motion.div variants={itemVariants} className="mt-4">
            <Button
              variant="ghost"
              onClick={() => window.print()}
              className="text-gray-500 hover:text-[#59ff00] text-sm"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print Receipt
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
