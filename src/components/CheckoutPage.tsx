'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  User,
  Truck,
  CreditCard,
  Banknote,
  Building2,
  ShieldCheck,
  Lock,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useAppStore, type CartItem } from '@/lib/store'
import { toast } from 'sonner'

// ─── Price Formatting ────────────────────────────────────────
const formatPrice = (price: number) => {
  if (price === 0) return 'Request Quote'
  const str = price.toString()
  let lastThree = str.substring(str.length - 3)
  const otherNumbers = str.substring(0, str.length - 3)
  if (otherNumbers !== '') lastThree = ',' + lastThree
  return '₹' + otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree
}

// ─── Step Types ──────────────────────────────────────────────
type Step = 1 | 2 | 3
type PaymentMethod = 'cod' | 'razorpay' | 'bank_transfer'

// ─── Form Data Types ─────────────────────────────────────────
interface ShippingData {
  fullName: string
  phone: string
  email: string
  address1: string
  address2: string
  city: string
  state: string
  pincode: string
  gstNumber: string
  notes: string
}

interface LoginForm {
  email: string
  password: string
}

interface RegisterForm {
  name: string
  email: string
  phone: string
  password: string
  confirmPassword: string
}

interface FormErrors {
  [key: string]: string
}

// ─── Indian States ───────────────────────────────────────────
const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
]

// ─── Step Config ─────────────────────────────────────────────
const STEPS = [
  { num: 1 as Step, label: 'Account', icon: User },
  { num: 2 as Step, label: 'Shipping', icon: Truck },
  { num: 3 as Step, label: 'Payment', icon: CreditCard },
]

// ─── Main Component ──────────────────────────────────────────
export default function CheckoutPage() {
  const {
    cartItems,
    user,
    setUser,
    isAuthenticated,
    clearCart,
    setLastOrder,
    setView,
  } = useAppStore()

  // Step management
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')

  // Auth form state
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login')
  const [loginForm, setLoginForm] = useState<LoginForm>({ email: '', password: '' })
  const [registerForm, setRegisterForm] = useState<RegisterForm>({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
  })
  const [authErrors, setAuthErrors] = useState<FormErrors>({})
  const [authLoading, setAuthLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showRegPassword, setShowRegPassword] = useState(false)

  // Shipping form state
  const [shipping, setShipping] = useState<ShippingData>({
    fullName: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    pincode: '',
    gstNumber: '',
    notes: '',
  })
  const [shippingErrors, setShippingErrors] = useState<FormErrors>({})
  const [shippingTouched, setShippingTouched] = useState<Record<string, boolean>>({})

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [orderPlacing, setOrderPlacing] = useState(false)

  // Razorpay simulation
  const [showRazorpayModal, setShowRazorpayModal] = useState(false)
  const [razorpayProcessing, setRazorpayProcessing] = useState(false)

  // Terms highlight
  const [termsHighlight, setTermsHighlight] = useState(false)

  // Mobile order summary
  const [summaryOpen, setSummaryOpen] = useState(false)

  // ─── Computed ─────────────────────────────────────────
  const subtotal = useMemo(() => cartItems.reduce((sum, item) => sum + item.price * item.qty, 0), [cartItems])
  const gst = Math.round(subtotal * 0.18)
  const shippingCost = subtotal > 50000 ? 0 : 2500
  const total = subtotal + gst + shippingCost

  // ─── Step Navigation ──────────────────────────────────
  const goToStep = (step: Step) => {
    setDirection(step > currentStep ? 'forward' : 'back')
    setCurrentStep(step)
  }

  const goNext = () => {
    if (currentStep < 3) goToStep((currentStep + 1) as Step)
  }

  const goBack = () => {
    if (currentStep > 1) goToStep((currentStep - 1) as Step)
  }

  // Auto-advance to step 2 when user authenticates
  useEffect(() => {
    if (isAuthenticated && currentStep === 1) {
      setDirection('forward')
      setCurrentStep(2)
    }
  }, [isAuthenticated, currentStep])

  // ─── Auth Handlers ────────────────────────────────────
  const validateLogin = (): boolean => {
    const errors: FormErrors = {}
    if (!loginForm.email.trim()) errors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginForm.email)) errors.email = 'Invalid email format'
    if (!loginForm.password.trim()) errors.password = 'Password is required'
    else if (loginForm.password.length < 6) errors.password = 'Password must be at least 6 characters'
    setAuthErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateRegister = (): boolean => {
    const errors: FormErrors = {}
    if (!registerForm.name.trim()) errors.regName = 'Name is required'
    if (!registerForm.email.trim()) errors.regEmail = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email)) errors.regEmail = 'Invalid email format'
    if (!registerForm.phone.trim()) errors.regPhone = 'Phone is required'
    else if (!/^[6-9]\d{9}$/.test(registerForm.phone)) errors.regPhone = 'Enter a valid 10-digit phone number'
    if (!registerForm.password) errors.regPassword = 'Password is required'
    else if (registerForm.password.length < 6) errors.regPassword = 'Password must be at least 6 characters'
    if (registerForm.password !== registerForm.confirmPassword) errors.regConfirmPassword = 'Passwords do not match'
    setAuthErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleLogin = async () => {
    if (!validateLogin()) return
    setAuthLoading(true)
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginForm.email, password: loginForm.password }),
      })
      const data = await res.json()
      if (!data.status) {
        toast.error(data.message || 'Login failed')
        return
      }
      setUser(data.data)
      toast.success('Welcome back!')
      // Pre-fill shipping from user data
      setShipping(prev => ({
        ...prev,
        fullName: data.data.name || prev.fullName,
        phone: data.data.phone || prev.phone,
        email: data.data.email || prev.email,
      }))
      goNext()
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!validateRegister()) return
    setAuthLoading(true)
    try {
      const res = await fetch('/api/auth', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: registerForm.name,
          email: registerForm.email,
          phone: registerForm.phone,
          password: registerForm.password,
        }),
      })
      const data = await res.json()
      if (!data.status) {
        toast.error(data.message || 'Registration failed')
        return
      }
      setUser(data.data)
      toast.success('Account created successfully!')
      setShipping(prev => ({
        ...prev,
        fullName: data.data.name || prev.fullName,
        phone: data.data.phone || prev.phone,
        email: data.data.email || prev.email,
      }))
      goNext()
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setAuthLoading(false)
    }
  }

  // ─── Shipping Validation ──────────────────────────────
  const validateShipping = (): boolean => {
    const errors: FormErrors = {}
    if (!shipping.fullName.trim()) errors.fullName = 'Full name is required'
    if (!shipping.phone.trim()) errors.phone = 'Phone number is required'
    else if (shipping.phone.replace(/\D/g, '').length < 10) errors.phone = 'Enter a valid phone number'
    if (!shipping.email.trim()) errors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shipping.email)) errors.email = 'Invalid email format'
    if (!shipping.address1.trim()) errors.address1 = 'Address is required'
    if (!shipping.city.trim()) errors.city = 'City is required'
    if (!shipping.state.trim()) errors.state = 'State is required'
    if (!shipping.pincode.trim()) errors.pincode = 'PIN code is required'
    else if (!/^\d{6}$/.test(shipping.pincode)) errors.pincode = 'Enter a valid 6-digit PIN code'
    if (shipping.gstNumber && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(shipping.gstNumber)) {
      errors.gstNumber = 'Enter a valid GST number'
    }
    setShippingErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Clear individual error when user starts typing in that field
  const handleShippingChange = (field: keyof ShippingData, value: string) => {
    setShipping(prev => ({ ...prev, [field]: value }))
    // Clear error for this field on change
    if (shippingErrors[field]) {
      setShippingErrors(prev => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  // Mark field as touched on blur and validate it
  const handleShippingBlur = (field: keyof ShippingData) => {
    setShippingTouched(prev => ({ ...prev, [field]: true }))
    // Inline validate just this field
    const val = shipping[field].trim()
    const errors: FormErrors = {}
    switch (field) {
      case 'fullName': if (!val) errors.fullName = 'Full name is required'; break
      case 'phone':
        if (!val) errors.phone = 'Phone number is required'
        else if (val.replace(/\D/g, '').length < 10) errors.phone = 'Enter a valid phone number'
        break
      case 'email':
        if (!val) errors.email = 'Email is required'
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) errors.email = 'Invalid email format'
        break
      case 'address1': if (!val) errors.address1 = 'Address is required'; break
      case 'city': if (!val) errors.city = 'City is required'; break
      case 'state': if (!val) errors.state = 'State is required'; break
      case 'pincode':
        if (!val) errors.pincode = 'PIN code is required'
        else if (!/^\d{6}$/.test(val)) errors.pincode = 'Enter a valid 6-digit PIN code'
        break
      case 'gstNumber':
        if (val && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(val))
          errors.gstNumber = 'Enter a valid GST number'
        break
    }
    // Merge: remove old error for this field, add new if any
    setShippingErrors(prev => {
      const next = { ...prev }
      delete next[field]
      const errorMsg = errors[field]
      if (errorMsg) {
        next[field] = errorMsg
      }
      return next
    })
  }

  const handleShippingNext = () => {
    // Mark all fields as touched
    setShippingTouched({
      fullName: true, phone: true, email: true,
      address1: true, city: true, state: true,
      pincode: true, gstNumber: true,
    })
    if (validateShipping()) goNext()
  }

  // ─── Order Placement ──────────────────────────────────
  const formatShippingAddress = () => {
    return [
      shipping.fullName,
      shipping.address1,
      shipping.address2,
      shipping.city,
      shipping.state,
      shipping.pincode,
      shipping.phone,
    ].filter(Boolean).join(', ')
  }

  const placeOrder = async () => {
    if (!user) {
      toast.error('Please log in to place an order')
      return
    }
    if (!termsAccepted) {
      toast.error('Please accept the Terms of Service')
      return
    }
    setOrderPlacing(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: user.id,
          items: cartItems.map(item => ({ productId: item.productId, qty: item.qty })),
          shippingAddress: formatShippingAddress(),
          notes: shipping.notes,
          paymentMethod,
        }),
      })
      const data = await res.json()
      if (!data.status) {
        toast.error(data.message || 'Failed to place order')
        return
      }
      // Success
      clearCart()
      setLastOrder(data.data)
      toast.success('Order placed successfully!')
      setView('order-success')
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setOrderPlacing(false)
    }
  }

  const handlePlaceOrder = () => {
    if (!termsAccepted) {
      setTermsHighlight(true)
      toast.error('Please accept the Terms of Service to place your order', {
        duration: 4000,
        description: 'Check the box below the payment methods',
      })
      // Auto-remove highlight after 3s
      setTimeout(() => setTermsHighlight(false), 3000)
      // Scroll to terms checkbox
      const termsEl = document.getElementById('terms')
      termsEl?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    if (paymentMethod === 'razorpay') {
      setShowRazorpayModal(true)
    } else {
      placeOrder()
    }
  }

  const simulateRazorpayPayment = async () => {
    setRazorpayProcessing(true)
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    setRazorpayProcessing(false)
    setShowRazorpayModal(false)
    // Now place order
    placeOrder()
  }

  // ─── Empty Cart Guard ─────────────────────────────────
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] pt-20 md:pt-24 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center px-4"
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-[#151515] border border-[#2a2a2a] flex items-center justify-center">
            <ShoppingBag className="w-10 h-10 text-gray-700" />
          </div>
          <h2 className="font-[family-name:var(--font-poppins)] text-xl md:text-2xl font-bold text-white mb-2">
            Your Cart is Empty
          </h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Add some items to your cart before proceeding to checkout.
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

  // ─── Order Summary Component ──────────────────────────
  const OrderSummary = () => (
    <div className="bg-[#151515] border border-[#2a2a2a] rounded-xl p-6">
      <h2 className="font-[family-name:var(--font-poppins)] text-white font-semibold text-lg mb-4">
        Order Summary
      </h2>

      {/* Cart Items */}
      <div className="flex flex-col gap-3 mb-4 max-h-64 overflow-y-auto pr-1">
        {cartItems.map((item) => (
          <div key={item.productId} className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#1a1a1a] rounded-lg flex items-center justify-center shrink-0 border border-[#2a2a2a]">
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
              ) : (
                <ShoppingBag className="w-5 h-5 text-gray-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{item.name}</p>
              <p className="text-gray-500 text-xs">Qty: {item.qty}</p>
            </div>
            <span className="text-white text-sm font-semibold shrink-0">
              {formatPrice(item.price * item.qty)}
            </span>
          </div>
        ))}
      </div>

      <Separator className="bg-[#2a2a2a] my-3" />

      {/* Price Breakdown */}
      <div className="flex flex-col gap-2 text-sm">
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
          <span className={shippingCost === 0 ? 'text-[#59ff00]' : 'text-white'}>
            {shippingCost === 0 ? 'FREE' : formatPrice(shippingCost)}
          </span>
        </div>
        {shippingCost > 0 && (
          <p className="text-gray-600 text-xs">Free shipping on orders above ₹50,000</p>
        )}
      </div>

      <Separator className="bg-[#2a2a2a] my-3" />

      <div className="flex justify-between items-center mb-5">
        <span className="text-white font-semibold text-base">Total</span>
        <span className="font-[family-name:var(--font-poppins)] text-[#59ff00] font-bold text-xl">
          {formatPrice(total)}
        </span>
      </div>

      {/* Trust Badges */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-gray-500 text-xs">
          <ShieldCheck className="w-4 h-4 text-[#59ff00]" />
          <span>Secure 256-bit SSL encryption</span>
        </div>
        <div className="flex items-center gap-2 text-gray-500 text-xs">
          <Lock className="w-4 h-4 text-[#59ff00]" />
          <span>Your payment info is safe with us</span>
        </div>
      </div>
    </div>
  )

  // ─── Stepper ──────────────────────────────────────────
  const Stepper = () => (
    <div className="flex items-center justify-center mb-8 md:mb-10">
      {STEPS.map((step, i) => {
        const isActive = step.num === currentStep
        const isCompleted = step.num < currentStep
        const Icon = step.icon

        return (
          <div key={step.num} className="flex items-center">
            <div className="flex flex-col items-center">
              <motion.div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                  ${isCompleted
                    ? 'bg-[#59ff00] border-[#59ff00] text-black'
                    : isActive
                      ? 'border-[#59ff00] text-[#59ff00] bg-[#59ff00]/10'
                      : 'border-[#2a2a2a] text-gray-600 bg-[#151515]'
                  }
                `}
                animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </motion.div>
              <span className={`
                text-xs mt-1.5 font-medium hidden sm:block
                ${isActive ? 'text-[#59ff00]' : isCompleted ? 'text-[#59ff00]/70' : 'text-gray-600'}
              `}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`
                w-12 sm:w-20 md:w-28 h-0.5 mx-2 transition-colors duration-300
                ${step.num < currentStep ? 'bg-[#59ff00]' : 'bg-[#2a2a2a]'}
              `} />
            )}
          </div>
        )
      })}
    </div>
  )

  // ─── Step 1: Auth ─────────────────────────────────────
  const StepAuth = () => (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: direction === 'forward' ? 40 : -40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: direction === 'forward' ? -40 : 40 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-[#151515] border border-[#2a2a2a] rounded-xl p-6 md:p-8 max-w-lg mx-auto">
        <h2 className="font-[family-name:var(--font-poppins)] text-xl font-bold text-white mb-1">
          Sign In to <span className="text-[#59ff00]">Checkout</span>
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Log in or create an account to continue with your order.
        </p>

        <Tabs value={authTab} onValueChange={(v) => { setAuthTab(v as 'login' | 'register'); setAuthErrors({}) }}>
          <TabsList className="bg-[#1a1a1a] border border-[#2a2a2a] w-full mb-6 h-10">
            <TabsTrigger
              value="login"
              className="flex-1 data-[state=active]:bg-[#59ff00] data-[state=active]:text-black data-[state=active]:shadow-none text-gray-400 text-sm"
            >
              Login
            </TabsTrigger>
            <TabsTrigger
              value="register"
              className="flex-1 data-[state=active]:bg-[#59ff00] data-[state=active]:text-black data-[state=active]:shadow-none text-gray-400 text-sm"
            >
              Register
            </TabsTrigger>
          </TabsList>

          {/* Login Tab */}
          <TabsContent value="login">
            <div className="flex flex-col gap-4">
              <div>
                <Label className="text-gray-400 text-sm mb-1.5 block">Email Address</Label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={loginForm.email}
                  onChange={(e) => { setLoginForm(prev => ({ ...prev, email: e.target.value })); if (authErrors.email) setAuthErrors(prev => { const n = {...prev}; delete n.email; return n }) }}
                  className="bg-[#1a1a1a] border-[#2a2a2a] text-white h-11 focus-visible:border-[#59ff00] focus-visible:ring-1 focus-visible:ring-[#59ff00]/30"
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
                {authErrors.email && <p className="text-red-400 text-xs mt-1">{authErrors.email}</p>}
              </div>

              <div>
                <Label className="text-gray-400 text-sm mb-1.5 block">Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={loginForm.password}
                    onChange={(e) => { setLoginForm(prev => ({ ...prev, password: e.target.value })); if (authErrors.password) setAuthErrors(prev => { const n = {...prev}; delete n.password; return n }) }}
                    className="bg-[#1a1a1a] border-[#2a2a2a] text-white h-11 pr-10 focus-visible:border-[#59ff00] focus-visible:ring-1 focus-visible:ring-[#59ff00]/30"
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {authErrors.password && <p className="text-red-400 text-xs mt-1">{authErrors.password}</p>}
              </div>

              <Button
                onClick={handleLogin}
                disabled={authLoading}
                className="w-full bg-[#59ff00] text-black hover:bg-[#59ff00]/90 font-semibold h-12 neon-glow mt-2"
              >
                {authLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                {authLoading ? 'Signing In...' : 'Sign In & Continue'}
              </Button>
            </div>
          </TabsContent>

          {/* Register Tab */}
          <TabsContent value="register">
            <div className="flex flex-col gap-4">
              <div>
                <Label className="text-gray-400 text-sm mb-1.5 block">Full Name</Label>
                <Input
                  placeholder="John Doe"
                  value={registerForm.name}
                  onChange={(e) => { setRegisterForm(prev => ({ ...prev, name: e.target.value })); if (authErrors.regName) setAuthErrors(prev => { const n = {...prev}; delete n.regName; return n }) }}
                  className="bg-[#1a1a1a] border-[#2a2a2a] text-white h-11 focus-visible:border-[#59ff00] focus-visible:ring-1 focus-visible:ring-[#59ff00]/30"
                />
                {authErrors.regName && <p className="text-red-400 text-xs mt-1">{authErrors.regName}</p>}
              </div>

              <div>
                <Label className="text-gray-400 text-sm mb-1.5 block">Email Address</Label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={registerForm.email}
                  onChange={(e) => { setRegisterForm(prev => ({ ...prev, email: e.target.value })); if (authErrors.regEmail) setAuthErrors(prev => { const n = {...prev}; delete n.regEmail; return n }) }}
                  className="bg-[#1a1a1a] border-[#2a2a2a] text-white h-11 focus-visible:border-[#59ff00] focus-visible:ring-1 focus-visible:ring-[#59ff00]/30"
                />
                {authErrors.regEmail && <p className="text-red-400 text-xs mt-1">{authErrors.regEmail}</p>}
              </div>

              <div>
                <Label className="text-gray-400 text-sm mb-1.5 block">Phone Number</Label>
                <Input
                  type="tel"
                  placeholder="9876543210"
                  value={registerForm.phone}
                  onChange={(e) => { setRegisterForm(prev => ({ ...prev, phone: e.target.value })); if (authErrors.regPhone) setAuthErrors(prev => { const n = {...prev}; delete n.regPhone; return n }) }}
                  className="bg-[#1a1a1a] border-[#2a2a2a] text-white h-11 focus-visible:border-[#59ff00] focus-visible:ring-1 focus-visible:ring-[#59ff00]/30"
                />
                {authErrors.regPhone && <p className="text-red-400 text-xs mt-1">{authErrors.regPhone}</p>}
              </div>

              <div>
                <Label className="text-gray-400 text-sm mb-1.5 block">Password</Label>
                <div className="relative">
                  <Input
                    type={showRegPassword ? 'text' : 'password'}
                    placeholder="Min 6 characters"
                    value={registerForm.password}
                    onChange={(e) => { setRegisterForm(prev => ({ ...prev, password: e.target.value })); if (authErrors.regPassword) setAuthErrors(prev => { const n = {...prev}; delete n.regPassword; return n }) }}
                    className="bg-[#1a1a1a] border-[#2a2a2a] text-white h-11 pr-10 focus-visible:border-[#59ff00] focus-visible:ring-1 focus-visible:ring-[#59ff00]/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {authErrors.regPassword && <p className="text-red-400 text-xs mt-1">{authErrors.regPassword}</p>}
              </div>

              <div>
                <Label className="text-gray-400 text-sm mb-1.5 block">Confirm Password</Label>
                <Input
                  type="password"
                  placeholder="Re-enter your password"
                  value={registerForm.confirmPassword}
                  onChange={(e) => { setRegisterForm(prev => ({ ...prev, confirmPassword: e.target.value })); if (authErrors.regConfirmPassword) setAuthErrors(prev => { const n = {...prev}; delete n.regConfirmPassword; return n }) }}
                  className="bg-[#1a1a1a] border-[#2a2a2a] text-white h-11 focus-visible:border-[#59ff00] focus-visible:ring-1 focus-visible:ring-[#59ff00]/30"
                />
                {authErrors.regConfirmPassword && <p className="text-red-400 text-xs mt-1">{authErrors.regConfirmPassword}</p>}
              </div>

              <Button
                onClick={handleRegister}
                disabled={authLoading}
                className="w-full bg-[#59ff00] text-black hover:bg-[#59ff00]/90 font-semibold h-12 neon-glow mt-2"
              >
                {authLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                {authLoading ? 'Creating Account...' : 'Create Account & Continue'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  )

  // ─── Step 2: Shipping ─────────────────────────────────
  const StepShipping = () => (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: direction === 'forward' ? 40 : -40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: direction === 'forward' ? -40 : 40 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-[#151515] border border-[#2a2a2a] rounded-xl p-6 md:p-8">
        <h2 className="font-[family-name:var(--font-poppins)] text-xl font-bold text-white mb-1">
          Shipping <span className="text-[#59ff00]">Details</span>
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Where should we deliver your order?
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Full Name */}
          <div>
            <Label className="text-gray-400 text-sm mb-1.5 block">
              Full Name <span className="text-[#59ff00]">*</span>
            </Label>
            <Input
              placeholder="Full Name"
              value={shipping.fullName}
              onChange={(e) => handleShippingChange('fullName', e.target.value)}
              onBlur={() => handleShippingBlur('fullName')}
              className={`bg-[#1a1a1a] text-white h-11 focus-visible:border-[#59ff00] focus-visible:ring-1 focus-visible:ring-[#59ff00]/30 ${shippingTouched.fullName && shippingErrors.fullName ? 'border-red-500/60 focus-visible:border-red-400 focus-visible:ring-red-400/20' : 'border-[#2a2a2a]'}`}
            />
            {shippingTouched.fullName && shippingErrors.fullName && (
              <p className="text-red-400 text-xs mt-1 animate-in fade-in slide-in-from-top-1 duration-200">{shippingErrors.fullName}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <Label className="text-gray-400 text-sm mb-1.5 block">
              Phone Number <span className="text-[#59ff00]">*</span>
            </Label>
            <Input
              type="tel"
              placeholder="9876543210"
              value={shipping.phone}
              onChange={(e) => handleShippingChange('phone', e.target.value)}
              onBlur={() => handleShippingBlur('phone')}
              className={`bg-[#1a1a1a] text-white h-11 focus-visible:border-[#59ff00] focus-visible:ring-1 focus-visible:ring-[#59ff00]/30 ${shippingTouched.phone && shippingErrors.phone ? 'border-red-500/60 focus-visible:border-red-400 focus-visible:ring-red-400/20' : 'border-[#2a2a2a]'}`}
            />
            {shippingTouched.phone && shippingErrors.phone && (
              <p className="text-red-400 text-xs mt-1 animate-in fade-in slide-in-from-top-1 duration-200">{shippingErrors.phone}</p>
            )}
          </div>

          {/* Email */}
          <div className="md:col-span-2">
            <Label className="text-gray-400 text-sm mb-1.5 block">
              Email <span className="text-[#59ff00]">*</span>
            </Label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={shipping.email}
              onChange={(e) => handleShippingChange('email', e.target.value)}
              onBlur={() => handleShippingBlur('email')}
              className={`bg-[#1a1a1a] text-white h-11 focus-visible:border-[#59ff00] focus-visible:ring-1 focus-visible:ring-[#59ff00]/30 ${shippingTouched.email && shippingErrors.email ? 'border-red-500/60 focus-visible:border-red-400 focus-visible:ring-red-400/20' : 'border-[#2a2a2a]'}`}
            />
            {shippingTouched.email && shippingErrors.email && (
              <p className="text-red-400 text-xs mt-1 animate-in fade-in slide-in-from-top-1 duration-200">{shippingErrors.email}</p>
            )}
          </div>

          {/* Address Line 1 */}
          <div className="md:col-span-2">
            <Label className="text-gray-400 text-sm mb-1.5 block">
              Address Line 1 <span className="text-[#59ff00]">*</span>
            </Label>
            <Input
              placeholder="House no., Building, Street"
              value={shipping.address1}
              onChange={(e) => handleShippingChange('address1', e.target.value)}
              onBlur={() => handleShippingBlur('address1')}
              className={`bg-[#1a1a1a] text-white h-11 focus-visible:border-[#59ff00] focus-visible:ring-1 focus-visible:ring-[#59ff00]/30 ${shippingTouched.address1 && shippingErrors.address1 ? 'border-red-500/60 focus-visible:border-red-400 focus-visible:ring-red-400/20' : 'border-[#2a2a2a]'}`}
            />
            {shippingTouched.address1 && shippingErrors.address1 && (
              <p className="text-red-400 text-xs mt-1 animate-in fade-in slide-in-from-top-1 duration-200">{shippingErrors.address1}</p>
            )}
          </div>

          {/* Address Line 2 */}
          <div className="md:col-span-2">
            <Label className="text-gray-400 text-sm mb-1.5 block">Address Line 2</Label>
            <Input
              placeholder="Area, Colony, Landmark (Optional)"
              value={shipping.address2}
              onChange={(e) => handleShippingChange('address2', e.target.value)}
              className="bg-[#1a1a1a] border-[#2a2a2a] text-white h-11 focus-visible:border-[#59ff00] focus-visible:ring-1 focus-visible:ring-[#59ff00]/30"
            />
          </div>

          {/* City */}
          <div>
            <Label className="text-gray-400 text-sm mb-1.5 block">
              City <span className="text-[#59ff00]">*</span>
            </Label>
            <Input
              placeholder="City"
              value={shipping.city}
              onChange={(e) => handleShippingChange('city', e.target.value)}
              onBlur={() => handleShippingBlur('city')}
              className={`bg-[#1a1a1a] text-white h-11 focus-visible:border-[#59ff00] focus-visible:ring-1 focus-visible:ring-[#59ff00]/30 ${shippingTouched.city && shippingErrors.city ? 'border-red-500/60 focus-visible:border-red-400 focus-visible:ring-red-400/20' : 'border-[#2a2a2a]'}`}
            />
            {shippingTouched.city && shippingErrors.city && (
              <p className="text-red-400 text-xs mt-1 animate-in fade-in slide-in-from-top-1 duration-200">{shippingErrors.city}</p>
            )}
          </div>

          {/* State */}
          <div>
            <Label className="text-gray-400 text-sm mb-1.5 block">
              State <span className="text-[#59ff00]">*</span>
            </Label>
            <select
              value={shipping.state}
              onChange={(e) => { handleShippingChange('state', e.target.value); handleShippingBlur('state') }}
              onBlur={() => handleShippingBlur('state')}
              className={`w-full h-11 bg-[#1a1a1a] text-white rounded-md px-3 text-sm focus:outline-none focus:border-[#59ff00] focus:ring-1 focus:ring-[#59ff00]/30 appearance-none cursor-pointer ${shippingTouched.state && shippingErrors.state ? 'border-2 border-red-500/60 focus:border-red-400 focus:ring-red-400/20' : 'border border-[#2a2a2a]'}`}
            >
              <option value="" className="bg-[#1a1a1a]">Select State</option>
              {INDIAN_STATES.map(state => (
                <option key={state} value={state} className="bg-[#1a1a1a]">{state}</option>
              ))}
            </select>
            {shippingTouched.state && shippingErrors.state && (
              <p className="text-red-400 text-xs mt-1 animate-in fade-in slide-in-from-top-1 duration-200">{shippingErrors.state}</p>
            )}
          </div>

          {/* PIN Code */}
          <div>
            <Label className="text-gray-400 text-sm mb-1.5 block">
              PIN Code <span className="text-[#59ff00]">*</span>
            </Label>
            <Input
              type="text"
              placeholder="110001"
              maxLength={6}
              value={shipping.pincode}
              onChange={(e) => handleShippingChange('pincode', e.target.value.replace(/\D/g, ''))}
              onBlur={() => handleShippingBlur('pincode')}
              className={`bg-[#1a1a1a] text-white h-11 focus-visible:border-[#59ff00] focus-visible:ring-1 focus-visible:ring-[#59ff00]/30 ${shippingTouched.pincode && shippingErrors.pincode ? 'border-red-500/60 focus-visible:border-red-400 focus-visible:ring-red-400/20' : 'border-[#2a2a2a]'}`}
            />
            {shippingTouched.pincode && shippingErrors.pincode && (
              <p className="text-red-400 text-xs mt-1 animate-in fade-in slide-in-from-top-1 duration-200">{shippingErrors.pincode}</p>
            )}
          </div>

          {/* GST Number */}
          <div>
            <Label className="text-gray-400 text-sm mb-1.5 block">
              GST Number <span className="text-gray-600">(for business)</span>
            </Label>
            <Input
              placeholder="22AAAAA0000A1Z5"
              value={shipping.gstNumber}
              onChange={(e) => handleShippingChange('gstNumber', e.target.value.toUpperCase())}
              onBlur={() => handleShippingBlur('gstNumber')}
              className={`bg-[#1a1a1a] text-white h-11 focus-visible:border-[#59ff00] focus-visible:ring-1 focus-visible:ring-[#59ff00]/30 ${shippingTouched.gstNumber && shippingErrors.gstNumber ? 'border-red-500/60 focus-visible:border-red-400 focus-visible:ring-red-400/20' : 'border-[#2a2a2a]'}`}
            />
            {shippingTouched.gstNumber && shippingErrors.gstNumber && (
              <p className="text-red-400 text-xs mt-1 animate-in fade-in slide-in-from-top-1 duration-200">{shippingErrors.gstNumber}</p>
            )}
          </div>

          {/* Order Notes */}
          <div className="md:col-span-2">
            <Label className="text-gray-400 text-sm mb-1.5 block">Order Notes</Label>
            <Textarea
              placeholder="Special instructions for delivery (Optional)"
              value={shipping.notes}
              onChange={(e) => handleShippingChange('notes', e.target.value)}
              className="bg-[#1a1a1a] border-[#2a2a2a] text-white min-h-[80px] focus-visible:border-[#59ff00] focus-visible:ring-1 focus-visible:ring-[#59ff00]/30"
            />
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#2a2a2a]">
          <Button
            variant="ghost"
            onClick={() => setView('cart')}
            className="text-gray-400 hover:text-white hover:bg-[#1a1a1a] h-11"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cart
          </Button>
          <Button
            type="button"
            onClick={handleShippingNext}
            className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90 font-semibold h-12 px-6 neon-glow"
          >
            Continue to Payment
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </motion.div>
  )

  // ─── Step 3: Payment ──────────────────────────────────
  const StepPayment = () => (
    <motion.div
      key="step3"
      initial={{ opacity: 0, x: direction === 'forward' ? 40 : -40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: direction === 'forward' ? -40 : 40 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-[#151515] border border-[#2a2a2a] rounded-xl p-6 md:p-8">
        <h2 className="font-[family-name:var(--font-poppins)] text-xl font-bold text-white mb-1">
          Payment <span className="text-[#59ff00]">Method</span>
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Choose how you would like to pay for your order.
        </p>

        {/* Payment Method Cards */}
        <div className="flex flex-col gap-3 mb-6">
          {/* COD */}
          <button
            onClick={() => setPaymentMethod('cod')}
            className={`
              flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200
              ${paymentMethod === 'cod'
                ? 'border-[#59ff00] bg-[#59ff00]/5'
                : 'border-[#2a2a2a] bg-[#1a1a1a] hover:border-[#59ff00]/30'
              }
            `}
          >
            <div className={`
              w-12 h-12 rounded-lg flex items-center justify-center shrink-0
              ${paymentMethod === 'cod' ? 'bg-[#59ff00]/20 text-[#59ff00]' : 'bg-[#151515] text-gray-500'}
            `}>
              <Banknote className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className={`font-semibold text-sm ${paymentMethod === 'cod' ? 'text-white' : 'text-gray-300'}`}>
                  Cash on Delivery (COD)
                </span>
              </div>
              <span className="text-gray-500 text-xs">Pay when your order is delivered</span>
            </div>
            <div className={`
              w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
              ${paymentMethod === 'cod' ? 'border-[#59ff00]' : 'border-[#2a2a2a]'}
            `}>
              {paymentMethod === 'cod' && <div className="w-2.5 h-2.5 rounded-full bg-[#59ff00]" />}
            </div>
          </button>

          {/* Razorpay */}
          <button
            onClick={() => setPaymentMethod('razorpay')}
            className={`
              flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200 relative
              ${paymentMethod === 'razorpay'
                ? 'border-[#59ff00] bg-[#59ff00]/5'
                : 'border-[#2a2a2a] bg-[#1a1a1a] hover:border-[#59ff00]/30'
              }
            `}
          >
            <Badge className="absolute -top-2.5 right-3 bg-[#59ff00] text-black text-[10px] font-bold px-2 py-0 h-5">
              Recommended
            </Badge>
            <div className={`
              w-12 h-12 rounded-lg flex items-center justify-center shrink-0
              ${paymentMethod === 'razorpay' ? 'bg-[#59ff00]/20 text-[#59ff00]' : 'bg-[#151515] text-gray-500'}
            `}>
              <CreditCard className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className={`font-semibold text-sm ${paymentMethod === 'razorpay' ? 'text-white' : 'text-gray-300'}`}>
                  Razorpay (Online Payment)
                </span>
              </div>
              <span className="text-gray-500 text-xs">Pay securely with Razorpay</span>
            </div>
            <div className={`
              w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
              ${paymentMethod === 'razorpay' ? 'border-[#59ff00]' : 'border-[#2a2a2a]'}
            `}>
              {paymentMethod === 'razorpay' && <div className="w-2.5 h-2.5 rounded-full bg-[#59ff00]" />}
            </div>
          </button>

          {/* Bank Transfer */}
          <button
            onClick={() => setPaymentMethod('bank_transfer')}
            className={`
              flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200
              ${paymentMethod === 'bank_transfer'
                ? 'border-[#59ff00] bg-[#59ff00]/5'
                : 'border-[#2a2a2a] bg-[#1a1a1a] hover:border-[#59ff00]/30'
              }
            `}
          >
            <div className={`
              w-12 h-12 rounded-lg flex items-center justify-center shrink-0
              ${paymentMethod === 'bank_transfer' ? 'bg-[#59ff00]/20 text-[#59ff00]' : 'bg-[#151515] text-gray-500'}
            `}>
              <Building2 className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className={`font-semibold text-sm ${paymentMethod === 'bank_transfer' ? 'text-white' : 'text-gray-300'}`}>
                  Bank Transfer / NEFT
                </span>
              </div>
              <span className="text-gray-500 text-xs">Transfer directly to our bank account</span>
            </div>
            <div className={`
              w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
              ${paymentMethod === 'bank_transfer' ? 'border-[#59ff00]' : 'border-[#2a2a2a]'}
            `}>
              {paymentMethod === 'bank_transfer' && <div className="w-2.5 h-2.5 rounded-full bg-[#59ff00]" />}
            </div>
          </button>
        </div>

        {/* Terms Checkbox */}
        <div
          className={`flex items-start gap-3 mb-6 p-3 rounded-lg border transition-all duration-300 ${
            termsHighlight
              ? 'bg-red-500/10 border-red-500/60 ring-2 ring-red-500/30'
              : termsAccepted
                ? 'bg-[#59ff00]/5 border-[#59ff00]/30'
                : 'bg-[#1a1a1a] border-[#2a2a2a]'
          }`}
        >
          <Checkbox
            id="terms"
            checked={termsAccepted}
            onCheckedChange={(checked) => {
              setTermsAccepted(checked === true)
              if (checked) setTermsHighlight(false)
            }}
            className={`mt-0.5 data-[state=checked]:bg-[#59ff00] data-[state=checked]:border-[#59ff00] data-[state=checked]:text-black ${
              termsHighlight ? 'border-red-500 animate-pulse' : ''
            }`}
          />
          <div className="flex-1">
            <Label htmlFor="terms" className="text-gray-400 text-sm cursor-pointer leading-relaxed">
              I agree to the{' '}
              <span className="text-[#59ff00] hover:underline cursor-pointer">Terms of Service</span>
              {' '}and{' '}
              <span className="text-[#59ff00] hover:underline cursor-pointer">Privacy Policy</span>
            </Label>
            {termsHighlight && (
              <p className="text-red-400 text-xs mt-1.5 font-medium flex items-center gap-1">
                <span className="inline-block w-1 h-1 rounded-full bg-red-400" />
                Please check this box to continue
              </p>
            )}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-[#2a2a2a]">
          <Button
            variant="ghost"
            onClick={goBack}
            className="text-gray-400 hover:text-white hover:bg-[#1a1a1a] h-11"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Shipping
          </Button>
          <Button
            onClick={handlePlaceOrder}
            disabled={orderPlacing}
            className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90 font-semibold h-12 px-8 neon-glow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {orderPlacing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Placing Order...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Place Order • {formatPrice(total)}
              </>
            )}
          </Button>
        </div>
        {!termsAccepted && (
          <p className="text-gray-500 text-xs text-center mt-3 flex items-center justify-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500" />
            Please accept the Terms of Service above to place your order
          </p>
        )}
      </div>
    </motion.div>
  )

  // ─── Render Step Content ──────────────────────────────
  const renderStep = () => {
    switch (currentStep) {
      case 1: return <StepAuth />
      case 2: return <StepShipping />
      case 3: return <StepPayment />
    }
  }

  return (
    <div className="min-h-screen bg-[#0b0b0b] pt-20 md:pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <button
            onClick={() => currentStep === 1 ? setView('cart') : goBack()}
            className="flex items-center gap-2 text-gray-500 hover:text-[#59ff00] text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {currentStep === 1 ? 'Back to Cart' : 'Previous Step'}
          </button>
          <h1 className="font-[family-name:var(--font-poppins)] text-2xl md:text-3xl font-bold">
            Secure <span className="text-[#59ff00]">Checkout</span>
          </h1>
        </motion.div>

        {/* Stepper */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Stepper />
        </motion.div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Step Content (60%) */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {renderStep()}
            </AnimatePresence>
          </div>

          {/* Right: Order Summary (40%) - Desktop */}
          {currentStep >= 2 && (
            <div className="hidden lg:block lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="sticky top-24"
              >
                <OrderSummary />
              </motion.div>
            </div>
          )}

          {/* Mobile: Collapsible Order Summary */}
          {currentStep >= 2 && (
            <div className="lg:hidden col-span-full">
              <Collapsible open={summaryOpen} onOpenChange={setSummaryOpen}>
                <CollapsibleTrigger asChild>
                  <button className="w-full flex items-center justify-between bg-[#151515] border border-[#2a2a2a] rounded-xl p-4 hover:border-[#59ff00]/20 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold text-sm">Order Summary</span>
                      <Badge className="bg-[#59ff00]/10 text-[#59ff00] border-[#59ff00]/20 text-xs">
                        {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-[family-name:var(--font-poppins)] text-[#59ff00] font-bold">
                        {formatPrice(total)}
                      </span>
                      {summaryOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  <OrderSummary />
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}
        </div>
      </div>

      {/* ─── Simulated Razorpay Modal ──────────────────────── */}
      <Dialog open={showRazorpayModal} onOpenChange={setShowRazorpayModal}>
        <DialogContent
          className="bg-[#151515] border-[#2a2a2a] text-white max-w-sm p-0 overflow-hidden"
          showCloseButton={!razorpayProcessing}
        >
          {/* Razorpay Header */}
          <div className="bg-[#072654] p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-[#072654]" />
              </div>
              <span className="text-white font-bold text-sm">razorpay</span>
            </div>
            <span className="text-blue-200 text-xs">Secure Payment</span>
          </div>

          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="text-white text-base">Pay for your order</DialogTitle>
            <DialogDescription className="text-gray-400 text-sm">
              Urban Kitchen is collecting the payment
            </DialogDescription>
          </DialogHeader>

          <div className="p-4 flex flex-col gap-4">
            {/* Amount Display */}
            <div className="text-center py-4 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a]">
              <p className="text-gray-400 text-xs mb-1">Amount to pay</p>
              <p className="font-[family-name:var(--font-poppins)] text-[#59ff00] font-bold text-2xl">
                {formatPrice(total)}
              </p>
            </div>

            {/* Order Details */}
            <div className="text-xs text-gray-500 space-y-1">
              <div className="flex justify-between">
                <span>Items</span>
                <span className="text-gray-300">{cartItems.length} item(s)</span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-gray-300">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST & Shipping</span>
                <span className="text-gray-300">{formatPrice(gst + shippingCost)}</span>
              </div>
            </div>

            {/* Pay Button */}
            <Button
              onClick={simulateRazorpayPayment}
              disabled={razorpayProcessing}
              className="w-full bg-[#072654] hover:bg-[#0a3478] text-white font-bold h-12 text-base"
            >
              {razorpayProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Processing Payment...
                </>
              ) : (
                <>Pay {formatPrice(total)}</>
              )}
            </Button>

            {razorpayProcessing && (
              <div className="flex items-center justify-center gap-2 text-gray-500 text-xs">
                <ShieldCheck className="w-3 h-3" />
                <span>Secure payment processing...</span>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
