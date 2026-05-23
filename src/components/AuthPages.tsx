'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  Flame,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'

/* ─── LOGIN FORM ─── */
function LoginForm() {
  const { setView, setUser } = useAppStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, password }),
      })
      const data = await res.json()
      if (data.status) {
        setUser(data.data)
        toast.success(`Welcome back, ${data.data.name}!`)
        // Route based on role
        const role = data.data.role?.roleName || data.data.roleName
        if (role === 'admin' || role === 'manager') {
          setView('admin')
        } else if (role === 'employee') {
          setView('employee-portal')
        } else {
          setView('home')
        }
      } else {
        toast.error(data.message || 'Login failed')
      }
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleLogin} className="flex flex-col gap-4">
      <div>
        <label className="text-gray-400 text-xs mb-1.5 block">Email Address</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="bg-[#1a1a1a] border-[#2a2a2a] text-white pl-9 h-11"
            required
          />
        </div>
      </div>

      <div>
        <label className="text-gray-400 text-xs mb-1.5 block">Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="bg-[#1a1a1a] border-[#2a2a2a] text-white pl-9 pr-10 h-11"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox className="data-[state=checked]:bg-[#59ff00] data-[state=checked]:border-[#59ff00]" />
          <span className="text-gray-400 text-xs">Remember me</span>
        </label>
        <button type="button" className="text-[#59ff00] text-xs hover:underline">
          Forgot password?
        </button>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90 font-bold h-11 text-base mt-2 neon-glow"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            Logging in...
          </span>
        ) : (
          <>
            Login
            <ArrowRight className="w-4 h-4 ml-2" />
          </>
        )}
      </Button>

      <p className="text-center text-gray-500 text-sm mt-2">
        Don&apos;t have an account?{' '}
        <button onClick={() => setView('register')} className="text-[#59ff00] hover:underline font-medium">
          Register
        </button>
      </p>
    </form>
  )
}

/* ─── REGISTER FORM ─── */
function RegisterForm() {
  const { setView } = useAppStore()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Please fill in all required fields')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (!agreedToTerms) {
      toast.error('Please agree to the terms and conditions')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', ...formData }),
      })
      const data = await res.json()
      if (data.status) {
        toast.success('Registration successful! Please login.')
        setView('login')
      } else {
        toast.error(data.message || 'Registration failed')
      }
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleRegister} className="flex flex-col gap-4">
      <div>
        <label className="text-gray-400 text-xs mb-1.5 block">Full Name *</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your full name"
            className="bg-[#1a1a1a] border-[#2a2a2a] text-white pl-9 h-11"
            required
          />
        </div>
      </div>

      <div>
        <label className="text-gray-400 text-xs mb-1.5 block">Email Address *</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className="bg-[#1a1a1a] border-[#2a2a2a] text-white pl-9 h-11"
            required
          />
        </div>
      </div>

      <div>
        <label className="text-gray-400 text-xs mb-1.5 block">Phone Number</label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+91-XXXXXXXXXX"
            className="bg-[#1a1a1a] border-[#2a2a2a] text-white pl-9 h-11"
          />
        </div>
      </div>

      <div>
        <label className="text-gray-400 text-xs mb-1.5 block">Password *</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a password"
            className="bg-[#1a1a1a] border-[#2a2a2a] text-white pl-9 pr-10 h-11"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div>
        <label className="text-gray-400 text-xs mb-1.5 block">Confirm Password *</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            name="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            className="bg-[#1a1a1a] border-[#2a2a2a] text-white pl-9 h-11"
            required
          />
        </div>
      </div>

      <label className="flex items-start gap-2 cursor-pointer mt-1">
        <Checkbox
          checked={agreedToTerms}
          onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
          className="data-[state=checked]:bg-[#59ff00] data-[state=checked]:border-[#59ff00] mt-0.5"
        />
        <span className="text-gray-400 text-xs leading-relaxed">
          I agree to the <button type="button" className="text-[#59ff00] hover:underline">Terms of Service</button> and{' '}
          <button type="button" className="text-[#59ff00] hover:underline">Privacy Policy</button>
        </span>
      </label>

      <Button
        type="submit"
        disabled={loading || !agreedToTerms}
        className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90 font-bold h-11 text-base mt-2 neon-glow disabled:opacity-50"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            Creating account...
          </span>
        ) : (
          <>
            Create Account
            <ArrowRight className="w-4 h-4 ml-2" />
          </>
        )}
      </Button>

      <p className="text-center text-gray-500 text-sm mt-2">
        Already have an account?{' '}
        <button onClick={() => setView('login')} className="text-[#59ff00] hover:underline font-medium">
          Login
        </button>
      </p>
    </form>
  )
}

/* ─── AUTH PAGES WRAPPER ─── */
export default function AuthPages() {
  const { currentView } = useAppStore()
  const isLogin = currentView === 'login'

  return (
    <div className="min-h-screen bg-[#0b0b0b] pt-20 md:pt-24 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <div className="glass rounded-2xl p-6 md:p-8">
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-[#59ff00]/10 border border-[#59ff00]/30 flex items-center justify-center">
              <Flame className="w-6 h-6 text-[#59ff00]" />
            </div>
            <h1 className="font-[family-name:var(--font-poppins)] text-xl font-bold">
              <span className="text-[#59ff00]">Urban</span>
              <span className="text-white ml-1">Kitchens</span>
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {isLogin ? 'Welcome back! Sign in to continue' : 'Create your account'}
            </p>
          </div>

          {isLogin ? <LoginForm /> : <RegisterForm />}
        </div>
      </motion.div>
    </div>
  )
}
