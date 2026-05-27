'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  ShoppingCart, User, Wrench, Headphones, Heart, Package,
  ChevronRight, AlertCircle, CheckCircle2, XCircle,
  Plus, Trash2, Eye, Calendar, MapPin, Phone, Mail, Settings,
  FileText, Loader2, Shield, Lock, Save, ArrowRight, LogOut
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useAppStore, type CustomerTab, type CartItem } from '@/lib/store'
import { toast } from 'sonner'

const formatPrice = (price: number) => {
  if (price === 0) return 'Request Quote'
  const str = price.toString()
  let lastThree = str.substring(str.length - 3)
  const otherNumbers = str.substring(0, str.length - 3)
  if (otherNumbers !== '') lastThree = ',' + lastThree
  return '₹' + otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree
}

const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

const statusColor: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  confirmed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  processing: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  shipped: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  delivered: 'bg-green-500/10 text-green-400 border-green-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
  paid: 'bg-green-500/10 text-green-400 border-green-500/20',
  failed: 'bg-red-500/10 text-red-400 border-red-500/20',
  active: 'bg-green-500/10 text-green-400 border-green-500/20',
  expired: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  open: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  in_progress: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  resolved: 'bg-green-500/10 text-green-400 border-green-500/20',
  closed: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  low: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  critical: 'bg-red-500/10 text-red-400 border-red-500/20',
}

const tabs: { id: CustomerTab; label: string; icon: React.ReactNode }[] = [
  { id: 'orders', label: 'My Orders', icon: <ShoppingCart className="w-4 h-4" /> },
  { id: 'wishlist', label: 'Wishlist', icon: <Heart className="w-4 h-4" /> },
  { id: 'amc', label: 'AMC Plans', icon: <Wrench className="w-4 h-4" /> },
  { id: 'service', label: 'Service', icon: <Headphones className="w-4 h-4" /> },
  { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
]

export default function CustomerPortal() {
  const { customerTab, setCustomerTab, setView, user, setUser, addToCart } = useAppStore()
  const [orders, setOrders] = useState<any[]>([])
  const [amcContracts, setAmcContracts] = useState<any[]>([])
  const [serviceRequests, setServiceRequests] = useState<any[]>([])
  const [wishlist, setWishlist] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [serviceDialog, setServiceDialog] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Redirect admin/manager/employee users to their correct portal
  useEffect(() => {
    if (user) {
      const roleName = (user.role?.roleName || user.roleName || 'customer').toLowerCase()
      if (roleName === 'admin' || roleName === 'manager') {
        setView('admin')
        return
      }
      if (roleName === 'employee') {
        setView('employee-portal')
        return
      }
    }
  }, [user, setView])

  // Fetch orders for this customer
  const fetchOrders = useCallback(async (userId: string) => {
    if (!userId) return
    try {
      const res = await fetch(`/api/orders?userId=${userId}&userRole=customer&limit=50`)
      const data = await res.json()
      if (data.status) {
        setOrders(data.data?.orders || data.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err)
    }
  }, [])

  // Fetch AMC contracts for this customer
  const fetchAmc = useCallback(async (userId: string) => {
    if (!userId) return
    try {
      const res = await fetch(`/api/amc?customerId=${userId}&limit=50`)
      const data = await res.json()
      if (data.status) {
        setAmcContracts(data.data?.contracts || data.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch AMC contracts:', err)
    }
  }, [])

  // Fetch service requests for this customer
  const fetchServiceRequests = useCallback(async (userId: string) => {
    if (!userId) return
    try {
      const res = await fetch(`/api/service-requests?customerId=${userId}&limit=50`)
      const data = await res.json()
      if (data.status) {
        setServiceRequests(data.data?.serviceRequests || data.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch service requests:', err)
    }
  }, [])

  // Fetch wishlist for this customer
  const fetchWishlist = useCallback(async (userId: string) => {
    if (!userId) return
    try {
      const res = await fetch(`/api/wishlist?userId=${userId}`)
      const data = await res.json()
      if (data.status) {
        setWishlist(data.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch wishlist:', err)
    }
  }, [])

  // Load all data
  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return
      setLoading(true)
      try {
        await Promise.all([
          fetchOrders(user.id),
          fetchAmc(user.id),
          fetchServiceRequests(user.id),
          fetchWishlist(user.id),
        ])
      } catch (err) {
        console.error('Failed to load customer data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [user?.id, fetchOrders, fetchAmc, fetchServiceRequests, fetchWishlist])

  const handleLogout = () => {
    setUser(null)
    setView('home')
  }

  // Raise a service request
  const handleRaiseService = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user?.id) {
      toast.error('You must be logged in')
      return
    }
    const form = e.currentTarget
    const formData = new FormData(form)
    const issue = formData.get('issue') as string
    const priority = formData.get('priority') as string
    const contractId = formData.get('contractId') as string

    if (!issue) {
      toast.error('Please describe the issue')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/service-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: user.id,
          issue,
          priority: priority || 'medium',
          contractId: contractId || undefined,
        }),
      })
      const data = await res.json()
      if (data.status) {
        toast.success('Service request raised successfully')
        setServiceDialog(false)
        form.reset()
        await fetchServiceRequests(user.id)
      } else {
        toast.error(data.message || 'Failed to raise service request')
      }
    } catch {
      toast.error('Failed to raise service request')
    } finally {
      setSubmitting(false)
    }
  }

  // Remove from wishlist
  const handleRemoveWishlist = async (productId: string) => {
    if (!user?.id) return
    try {
      const res = await fetch(`/api/wishlist?userId=${user.id}&productId=${productId}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.status) {
        toast.success('Removed from wishlist')
        setWishlist(prev => prev.filter(w => w.productId !== productId))
      } else {
        toast.error(data.message || 'Failed to remove from wishlist')
      }
    } catch {
      toast.error('Failed to remove from wishlist')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] pt-20 md:pt-24 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#59ff00] animate-spin" />
          <p className="text-gray-500 text-sm">Loading your account...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0b0b0b] pt-20 md:pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-[family-name:var(--font-poppins)] text-xl md:text-2xl font-bold text-white">My Account</h1>
            <p className="text-gray-500 text-sm">Welcome back, {user?.name || 'Customer'}</p>
          </div>
          <Button onClick={handleLogout} variant="ghost" className="text-gray-500 hover:text-red-400 text-sm">
            <LogOut className="w-4 h-4 mr-2" />Logout
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="md:w-56 shrink-0">
            <div className="bg-[#151515] border border-[#2a2a2a] rounded-xl p-2 flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible sticky top-24">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setCustomerTab(tab.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    customerTab === tab.id
                      ? 'bg-[#59ff00]/10 text-[#59ff00]'
                      : 'text-gray-500 hover:text-white hover:bg-[#1a1a1a]'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <motion.div key={customerTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              {customerTab === 'orders' && (
                <OrdersTab orders={orders} loading={loading} />
              )}
              {customerTab === 'wishlist' && (
                <WishlistTab
                  wishlist={wishlist}
                  loading={loading}
                  onRemove={handleRemoveWishlist}
                />
              )}
              {customerTab === 'amc' && (
                <AmcTab contracts={amcContracts} loading={loading} />
              )}
              {customerTab === 'service' && (
                <ServiceTab
                  requests={serviceRequests}
                  loading={loading}
                  onRaise={() => setServiceDialog(true)}
                  amcContracts={amcContracts}
                />
              )}
              {customerTab === 'profile' && (
                <ProfileTab />
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Service Request Dialog */}
      <Dialog open={serviceDialog} onOpenChange={setServiceDialog}>
        <DialogContent className="bg-[#151515] border-[#2a2a2a] text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#59ff00]">Raise Service Request</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRaiseService} className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Issue Description</label>
              <Textarea name="issue" required placeholder="Describe the issue..." className="bg-[#1a1a1a] border-[#2a2a2a] text-white min-h-[100px]" />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Priority</label>
              <Select name="priority" defaultValue="medium">
                <SelectTrigger className="bg-[#1a1a1a] border-[#2a2a2a] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {amcContracts.length > 0 && (
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Linked AMC Contract (Optional)</label>
                <Select name="contractId">
                  <SelectTrigger className="bg-[#1a1a1a] border-[#2a2a2a] text-white">
                    <SelectValue placeholder="Select contract" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                    <SelectItem value="none">No contract</SelectItem>
                    {amcContracts.filter(c => c.status === 'active').map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.plan} Plan - {formatDate(c.startDate)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#59ff00] text-black hover:bg-[#59ff00]/90 font-semibold"
            >
              {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</> : 'Submit Request'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/* ===================== ORDERS TAB ===================== */
function OrdersTab({ orders, loading }: { orders: any[]; loading: boolean }) {
  const [filter, setFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const filtered = filter === 'all' ? orders : orders.filter((o: any) => o.orderStatus === filter)

  const openDetail = (order: any) => {
    setSelectedOrder(order)
    setDetailOpen(true)
  }

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="bg-[#151515] border border-[#2a2a2a] rounded-xl h-24 animate-pulse" />)}</div>

  return (
    <div>
      <h2 className="font-[family-name:var(--font-poppins)] text-lg font-bold text-white mb-4">My Orders</h2>
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-colors ${
              filter === s ? 'bg-[#59ff00]/10 text-[#59ff00] border border-[#59ff00]/20' : 'bg-[#1a1a1a] text-gray-500 hover:text-white border border-[#2a2a2a]'
            }`}
          >
            {s === 'all' ? 'All Orders' : s}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="bg-[#151515] border border-[#2a2a2a] rounded-xl p-12 text-center">
          <Package className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <h3 className="text-gray-400 font-semibold mb-1">No Orders Found</h3>
          <p className="text-gray-600 text-sm">Your orders will appear here after purchase</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order: any) => (
            <div key={order.id} className="bg-[#151515] border border-[#2a2a2a] rounded-xl p-4 hover:border-[#59ff00]/20 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-sm text-white font-semibold">{order.orderNumber}</span>
                    <Badge className={`${statusColor[order.orderStatus] || ''} text-xs`}>{order.orderStatus}</Badge>
                    <Badge className={`${statusColor[order.paymentStatus] || ''} text-xs`}>{order.paymentStatus}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{formatDate(order.createdAt)}</span>
                    <span>{order.items?.length || 0} item(s)</span>
                    <span className="text-[#59ff00] font-semibold">{formatPrice(order.total)}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openDetail(order)}
                  className="text-gray-500 hover:text-[#59ff00]"
                >
                  <Eye className="w-4 h-4 mr-1" /> Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="bg-[#151515] border-[#2a2a2a] text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#59ff00]">Order {selectedOrder?.orderNumber}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-500">Status</span><div><Badge className={`${statusColor[selectedOrder.orderStatus] || ''} text-xs mt-1`}>{selectedOrder.orderStatus}</Badge></div></div>
                <div><span className="text-gray-500">Payment</span><div><Badge className={`${statusColor[selectedOrder.paymentStatus] || ''} text-xs mt-1`}>{selectedOrder.paymentStatus}</Badge></div></div>
                <div><span className="text-gray-500">Date</span><div className="text-white">{formatDate(selectedOrder.createdAt)}</div></div>
                <div><span className="text-gray-500">Method</span><div className="text-white capitalize">{selectedOrder.paymentMethod || 'N/A'}</div></div>
              </div>
              {selectedOrder.shippingAddress && (
                <div>
                  <span className="text-gray-500 text-sm">Shipping Address</span>
                  <div className="text-white text-sm mt-1 bg-[#1a1a1a] p-3 rounded-lg">{selectedOrder.shippingAddress}</div>
                </div>
              )}
              <Separator className="bg-[#2a2a2a]" />
              <div>
                <span className="text-gray-500 text-sm">Items</span>
                <div className="space-y-2 mt-2">
                  {selectedOrder.items?.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-center bg-[#1a1a1a] p-3 rounded-lg text-sm">
                      <div>
                        <div className="text-white">{item.product?.name || `Product #${item.productId}`}</div>
                        <div className="text-gray-500 text-xs">Qty: {item.qty}</div>
                      </div>
                      <span className="text-[#59ff00] font-semibold">{formatPrice(item.price * item.qty)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Separator className="bg-[#2a2a2a]" />
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-gray-400"><span>Subtotal</span><span>{formatPrice(selectedOrder.subtotal)}</span></div>
                <div className="flex justify-between text-gray-400"><span>GST (18%)</span><span>{formatPrice(selectedOrder.tax)}</span></div>
                <div className="flex justify-between text-gray-400"><span>Shipping</span><span>{selectedOrder.shipping > 0 ? formatPrice(selectedOrder.shipping) : 'Free'}</span></div>
                <div className="flex justify-between text-white font-semibold text-base pt-2 border-t border-[#2a2a2a]">
                  <span>Total</span>
                  <span className="text-[#59ff00]">{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

/* ===================== WISHLIST TAB ===================== */
function WishlistTab({ wishlist, loading, onRemove }: {
  wishlist: any[]
  loading: boolean
  onRemove: (productId: string) => void
}) {
  const { setView, setProductDetail, addToCart } = useAppStore()
  const { user } = useAppStore()

  if (loading) return <div className="space-y-4">{[...Array(2)].map((_, i) => <div key={i} className="bg-[#151515] border border-[#2a2a2a] rounded-xl h-24 animate-pulse" />)}</div>

  return (
    <div>
      <h2 className="font-[family-name:var(--font-poppins)] text-lg font-bold text-white mb-4">My Wishlist</h2>
      {wishlist.length === 0 ? (
        <div className="bg-[#151515] border border-[#2a2a2a] rounded-xl p-12 text-center">
          <Heart className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <h3 className="text-gray-400 font-semibold mb-1">Your Wishlist is Empty</h3>
          <p className="text-gray-600 text-sm mb-4">Browse products and add them to your wishlist</p>
          <Button onClick={() => setView('products')} variant="outline" className="border-[#59ff00] text-[#59ff00] hover:bg-[#59ff00]/10">
            Browse Products
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {wishlist.map((item: any) => (
            <div key={item.id} className="bg-[#151515] border border-[#2a2a2a] rounded-xl p-4 flex gap-4 hover:border-[#59ff00]/20 transition-colors">
              <div className="w-20 h-20 bg-[#1a1a1a] rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                {item.product?.featuredImage ? (
                  <img src={item.product.featuredImage} alt={item.product.name} className="w-full h-full object-cover" />
                ) : (
                  <Package className="w-8 h-8 text-gray-700" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3
                  className="text-white font-semibold text-sm truncate cursor-pointer hover:text-[#59ff00]"
                  onClick={() => setProductDetail(item.productId)}
                >
                  {item.product?.name || `Product #${item.productId}`}
                </h3>
                <p className="text-[#59ff00] font-bold text-sm mt-1">{formatPrice(item.product?.price || 0)}</p>
                {item.product?.stock !== undefined && (
                  <p className={`text-xs mt-0.5 ${item.product.stock > 0 ? 'text-gray-500' : 'text-red-400'}`}>
                    {item.product.stock > 0 ? `${item.product.stock} in stock` : 'Out of stock'}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    size="sm"
                    className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90 h-7 text-xs px-2"
                    disabled={(item.product?.stock || 0) <= 0}
                    onClick={() => {
                      if (item.product) {
                        addToCart({
                          id: item.product.id,
                          productId: item.product.id,
                          name: item.product.name,
                          price: item.product.price,
                          qty: 1,
                          image: item.product.featuredImage || null,
                          stock: item.product.stock || 0,
                        })
                        toast.success('Added to cart')
                      }
                    }}
                  >
                    <ShoppingCart className="w-3 h-3 mr-1" /> Add to Cart
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-400 hover:text-red-300 h-7 text-xs px-2"
                    onClick={() => onRemove(item.productId)}
                  >
                    <Trash2 className="w-3 h-3 mr-1" /> Remove
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ===================== AMC TAB ===================== */
function AmcTab({ contracts, loading }: { contracts: any[]; loading: boolean }) {
  if (loading) return <div className="space-y-4">{[...Array(2)].map((_, i) => <div key={i} className="bg-[#151515] border border-[#2a2a2a] rounded-xl h-40 animate-pulse" />)}</div>

  return (
    <div>
      <h2 className="font-[family-name:var(--font-poppins)] text-lg font-bold text-white mb-4">AMC Contracts</h2>
      {!contracts || contracts.length === 0 ? (
        <div className="bg-[#151515] border border-[#2a2a2a] rounded-xl p-12 text-center">
          <Wrench className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <h3 className="text-gray-400 font-semibold mb-1">No AMC Contracts</h3>
          <p className="text-gray-600 text-sm">Contact us to set up an Annual Maintenance Contract</p>
        </div>
      ) : (
        <div className="space-y-4">
          {contracts.map((contract: any) => (
            <div key={contract.id} className="bg-[#151515] border border-[#2a2a2a] rounded-xl p-5 hover:border-[#59ff00]/20 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-semibold">{contract.plan} Plan</h3>
                    <Badge className={`${statusColor[contract.status] || ''} text-xs`}>{contract.status}</Badge>
                  </div>
                  <p className="text-gray-500 text-xs">{formatDate(contract.startDate)} — {formatDate(contract.endDate)}</p>
                </div>
                <span className="text-[#59ff00] font-bold text-lg">{formatPrice(contract.amount)}</span>
              </div>
              {contract.coverage && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {(Array.isArray(contract.coverage) ? contract.coverage : JSON.parse(contract.coverage || '[]')).map((item: string, i: number) => (
                    <span key={i} className="bg-[#1a1a1a] text-gray-400 text-xs px-2 py-1 rounded-md border border-[#2a2a2a]">{item}</span>
                  ))}
                </div>
              )}
              {(contract.status === 'expired' || new Date(contract.endDate) < new Date(Date.now() + 30 * 86400000)) && contract.status === 'active' && (
                <Button size="sm" className="mt-3 bg-[#59ff00] text-black hover:bg-[#59ff00]/90 text-xs h-8" onClick={() => toast.info('Renewal request submitted')}>
                  <Wrench className="w-3 h-3 mr-1" /> Renew Contract
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ===================== SERVICE TAB ===================== */
function ServiceTab({ requests, loading, onRaise, amcContracts }: {
  requests: any[]
  loading: boolean
  onRaise: () => void
  amcContracts: any[]
}) {
  if (loading) return <div className="space-y-4">{[...Array(2)].map((_, i) => <div key={i} className="bg-[#151515] border border-[#2a2a2a] rounded-xl h-20 animate-pulse" />)}</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-[family-name:var(--font-poppins)] text-lg font-bold text-white">Service Requests</h2>
        <Button onClick={onRaise} size="sm" className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90">
          <Plus className="w-4 h-4 mr-1" /> Raise Request
        </Button>
      </div>
      {!requests || requests.length === 0 ? (
        <div className="bg-[#151515] border border-[#2a2a2a] rounded-xl p-12 text-center">
          <Headphones className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <h3 className="text-gray-400 font-semibold mb-1">No Service Requests</h3>
          <p className="text-gray-600 text-sm">Click &quot;Raise Request&quot; to submit a new service request</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req: any) => (
            <div key={req.id} className="bg-[#151515] border border-[#2a2a2a] rounded-xl p-4 hover:border-[#59ff00]/20 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={`${statusColor[req.priority] || ''} text-xs`}>{req.priority}</Badge>
                    <Badge className={`${statusColor[req.status] || ''} text-xs`}>{req.status?.replace('_', ' ')}</Badge>
                    {req.contract && (
                      <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-xs">{req.contract.plan}</Badge>
                    )}
                  </div>
                  <p className="text-white text-sm">{req.issue}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                    <span>{formatDate(req.createdAt)}</span>
                    {req.technician && <span>Assigned: {req.technician.name}</span>}
                  </div>
                </div>
                {req.resolution && (
                  <div className="text-green-400 text-xs bg-green-500/10 p-2 rounded-lg max-w-[200px]">
                    <CheckCircle2 className="w-3 h-3 inline mr-1" />{req.resolution}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ===================== PROFILE TAB ===================== */
function ProfileTab() {
  const { user, setUser } = useAppStore()
  const [profileForm, setProfileForm] = useState(() => ({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  }))
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  // Save profile
  const handleSaveProfile = async () => {
    if (!user?.id) return
    if (!profileForm.name.trim()) {
      toast.error('Name is required')
      return
    }
    if (!profileForm.email.trim()) {
      toast.error('Email is required')
      return
    }

    setSavingProfile(true)
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          name: profileForm.name,
          email: profileForm.email,
          phone: profileForm.phone,
        }),
      })
      const data = await res.json()
      if (data.status) {
        toast.success('Profile updated successfully')
        // Update the user in the store
        setUser(data.data)
      } else {
        toast.error(data.message || 'Failed to update profile')
      }
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSavingProfile(false)
    }
  }

  // Change password
  const handleChangePassword = async () => {
    if (!user?.id) return
    if (!passwordForm.newPassword) {
      toast.error('New password is required')
      return
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setSavingPassword(true)
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: passwordForm.newPassword,
        }),
      })
      const data = await res.json()
      if (data.status) {
        toast.success('Password updated successfully')
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        toast.error(data.message || 'Failed to update password')
      }
    } catch {
      toast.error('Failed to update password')
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div>
      <h2 className="font-[family-name:var(--font-poppins)] text-lg font-bold text-white mb-4">My Profile</h2>
      <div className="bg-[#151515] border border-[#2a2a2a] rounded-xl p-6">
        {/* Avatar & Name */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-[#59ff00]/10 border-2 border-[#59ff00]/30 flex items-center justify-center">
            <span className="text-[#59ff00] font-bold text-2xl font-[family-name:var(--font-poppins)]">
              {profileForm.name?.charAt(0)?.toUpperCase() || 'C'}
            </span>
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">{profileForm.name}</h3>
            <p className="text-gray-500 text-sm">{profileForm.email}</p>
            <p className="text-gray-600 text-xs mt-1">Member since {user?.createdAt ? formatDate(user.createdAt) : 'N/A'}</p>
          </div>
        </div>

        {/* Profile Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-gray-500 text-xs mb-1 block">Full Name</label>
            <Input
              value={profileForm.name}
              onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
              className="bg-[#1a1a1a] border-[#2a2a2a] text-white"
            />
          </div>
          <div>
            <label className="text-gray-500 text-xs mb-1 block">Email</label>
            <Input
              value={profileForm.email}
              onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
              className="bg-[#1a1a1a] border-[#2a2a2a] text-white"
              type="email"
            />
          </div>
          <div>
            <label className="text-gray-500 text-xs mb-1 block">Phone</label>
            <Input
              value={profileForm.phone}
              onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
              className="bg-[#1a1a1a] border-[#2a2a2a] text-white"
              type="tel"
            />
          </div>
        </div>
        <Button
          className="mt-6 bg-[#59ff00] text-black hover:bg-[#59ff00]/90 font-semibold"
          onClick={handleSaveProfile}
          disabled={savingProfile}
        >
          {savingProfile ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
          ) : (
            <><Save className="w-4 h-4 mr-2" />Save Changes</>
          )}
        </Button>

        <Separator className="bg-[#2a2a2a] my-6" />

        {/* Change Password */}
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Lock className="w-4 h-4 text-[#59ff00]" /> Change Password
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-gray-500 text-xs mb-1 block">New Password</label>
            <Input
              type="password"
              value={passwordForm.newPassword}
              onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              className="bg-[#1a1a1a] border-[#2a2a2a] text-white"
              placeholder="Enter new password"
            />
          </div>
          <div>
            <label className="text-gray-500 text-xs mb-1 block">Confirm New Password</label>
            <Input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              className="bg-[#1a1a1a] border-[#2a2a2a] text-white"
              placeholder="Confirm new password"
            />
          </div>
        </div>
        <Button
          variant="outline"
          className="mt-4 border-[#59ff00] text-[#59ff00] hover:bg-[#59ff00]/10"
          onClick={handleChangePassword}
          disabled={savingPassword}
        >
          {savingPassword ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Updating...</>
          ) : (
            <><Shield className="w-4 h-4 mr-2" />Update Password</>
          )}
        </Button>
      </div>
    </div>
  )
}
