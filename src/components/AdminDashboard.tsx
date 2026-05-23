'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import {
  LayoutDashboard, Package, ShoppingCart, Users, UserCog, Shield,
  Settings, LogOut, Menu, Search, Plus, Edit, Trash2, Eye,
  ChevronDown, IndianRupee, TrendingUp, AlertTriangle, Clock,
  Phone, Mail, MapPin, Building2, FileText, Wrench, X,
  ChevronLeft, ChevronRight
} from 'lucide-react'
import { useAppStore, type AdminTab } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend,
} from 'recharts'

// ─── Constants ──────────────────────────────────────────────
const NEON = '#59ff00'
const CHART_COLORS = ['#59ff00', '#00b4d8', '#f77f00', '#d62828', '#7209b7', '#4cc9f0']

const NAV_ITEMS: { key: AdminTab; label: string; icon: React.ElementType }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'products', label: 'Products', icon: Package },
  { key: 'orders', label: 'Orders', icon: ShoppingCart },
  { key: 'leads', label: 'Leads', icon: Users },
  { key: 'employees', label: 'Employees', icon: UserCog },
  { key: 'amc', label: 'AMC', icon: Shield },
  { key: 'settings', label: 'Settings', icon: Settings },
]

// ─── Helpers ────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

const fmtDate = (d: string | Date) =>
  new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

const paymentBadge = (s: string) => {
  const m: Record<string, string> = {
    paid: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    failed: 'bg-red-500/20 text-red-400 border-red-500/30',
    refunded: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  }
  return m[s] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
}

const orderBadge = (s: string) => {
  const m: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    confirmed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    processing: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    shipped: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    delivered: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
  }
  return m[s] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
}

const leadBadge = (s: string) => {
  const m: Record<string, string> = {
    new: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    contacted: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    quotation_sent: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    negotiation: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    won: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    lost: 'bg-red-500/20 text-red-400 border-red-500/30',
  }
  return m[s] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
}

const priorityBadge = (s: string) => {
  const m: Record<string, string> = {
    low: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  }
  return m[s] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
}

const statusBadgeCls = (s: string) => {
  const m: Record<string, string> = {
    active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    inactive: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    expired: 'bg-red-500/20 text-red-400 border-red-500/30',
    cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
    open: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    in_progress: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    resolved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    closed: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    on_leave: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    terminated: 'bg-red-500/20 text-red-400 border-red-500/30',
  }
  return m[s] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
}

// ─── Custom Tooltip ─────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 shadow-xl">
      <p className="text-gray-400 text-xs mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-sm font-semibold" style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' && p.name?.toLowerCase().includes('revenue') ? fmt(p.value) : p.value}
        </p>
      ))}
    </div>
  )
}

// ─── Shared types for dialog state ──────────────────────────
interface ProductForm {
  name: string; categoryId: string; description: string; price: string;
  stock: string; status: string; steelGrade: string; capacity: string; dimensions: string;
}
interface LeadForm {
  name: string; company: string; phone: string; email: string;
  city: string; requirement: string; message: string; source: string; assignedTo: string;
}
interface EmployeeForm {
  name: string; email: string; phone: string; password: string;
  department: string; designation: string; salary: string; joiningDate: string;
}
interface AmcForm {
  customerId: string; plan: string; startDate: string; endDate: string; amount: string; coverage: string;
}
interface ServiceForm {
  customerId: string; contractId: string; issue: string; priority: string; assignedTechnician: string;
}

const emptyProductForm: ProductForm = { name: '', categoryId: '', description: '', price: '', stock: '', status: 'active', steelGrade: '', capacity: '', dimensions: '' }
const emptyLeadForm: LeadForm = { name: '', company: '', phone: '', email: '', city: '', requirement: '', message: '', source: 'website', assignedTo: '' }
const emptyEmployeeForm: EmployeeForm = { name: '', email: '', phone: '', password: '', department: '', designation: '', salary: '', joiningDate: '' }
const emptyAmcForm: AmcForm = { customerId: '', plan: '', startDate: '', endDate: '', amount: '', coverage: '' }
const emptyServiceForm: ServiceForm = { customerId: '', contractId: '', issue: '', priority: 'medium', assignedTechnician: '' }

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function AdminDashboard() {
  const { adminTab, setAdminTab, setUser, setView } = useAppStore()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // ─── Shared State ───────────────────────────────────────
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [leads, setLeads] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [amcContracts, setAmcContracts] = useState<any[]>([])
  const [serviceRequests, setServiceRequests] = useState<any[]>([])

  // ─── Dialog States ──────────────────────────────────────
  const [productDialog, setProductDialog] = useState(false)
  const [editProduct, setEditProduct] = useState<any>(null)
  const [orderDialog, setOrderDialog] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [leadDialog, setLeadDialog] = useState(false)
  const [leadDetailDialog, setLeadDetailDialog] = useState(false)
  const [selectedLead, setSelectedLead] = useState<any>(null)
  const [quotationDialog, setQuotationDialog] = useState(false)
  const [employeeDialog, setEmployeeDialog] = useState(false)
  const [amcDialog, setAmcDialog] = useState(false)
  const [serviceDialog, setServiceDialog] = useState(false)

  // ─── Form States ────────────────────────────────────────
  const [productForm, setProductForm] = useState<ProductForm>(emptyProductForm)
  const [leadForm, setLeadForm] = useState<LeadForm>(emptyLeadForm)
  const [quotationAmount, setQuotationAmount] = useState('')
  const [quotationItems, setQuotationItems] = useState('')
  const [quotationValidUntil, setQuotationValidUntil] = useState('')
  const [employeeForm, setEmployeeForm] = useState<EmployeeForm>(emptyEmployeeForm)
  const [amcForm, setAmcForm] = useState<AmcForm>(emptyAmcForm)
  const [serviceForm, setServiceForm] = useState<ServiceForm>(emptyServiceForm)
  const [settingsData, setSettingsData] = useState({ name: '', email: '', phone: '', address: '', gstNumber: '' })

  // ─── Filter States ──────────────────────────────────────
  const [orderStatusFilter, setOrderStatusFilter] = useState('all')
  const [productCategoryFilter, setProductCategoryFilter] = useState('all')
  const [searchQueries, setSearchQueries] = useState<Record<string, string>>({})

  // ─── Fetch helpers (non-hook, used by both effects and handlers) ──
  const doFetchProducts = useCallback(() => {
    const params = new URLSearchParams()
    if (searchQueries.products) params.set('search', searchQueries.products)
    if (productCategoryFilter !== 'all') params.set('category', productCategoryFilter)
    params.set('status', 'active')
    params.set('limit', '50')
    fetch(`/api/products?${params}`).then(r => r.json()).then(j => { if (j.status) setProducts(j.data.products) }).catch(console.error)
  }, [searchQueries.products, productCategoryFilter])

  const doFetchOrders = useCallback(() => {
    const params = new URLSearchParams()
    if (orderStatusFilter !== 'all') params.set('status', orderStatusFilter)
    if (searchQueries.orders) params.set('search', searchQueries.orders)
    params.set('limit', '50')
    fetch(`/api/orders?${params}`).then(r => r.json()).then(j => { if (j.status) setOrders(j.data.orders) }).catch(console.error)
  }, [orderStatusFilter, searchQueries.orders])

  const doFetchLeads = useCallback(() => {
    fetch('/api/leads?limit=50').then(r => r.json()).then(j => { if (j.status) setLeads(j.data.leads) }).catch(console.error)
  }, [])

  const doFetchEmployees = useCallback(() => {
    fetch('/api/employees?limit=50').then(r => r.json()).then(j => { if (j.status) setEmployees(j.data.employees) }).catch(console.error)
  }, [])

  const doFetchAmc = useCallback(() => {
    Promise.all([fetch('/api/amc?limit=50'), fetch('/api/service-requests?limit=50')])
      .then(([amcR, srR]) => Promise.all([amcR.json(), srR.json()]))
      .then(([amcJ, srJ]) => {
        if (amcJ.status) setAmcContracts(amcJ.data.contracts)
        if (srJ.status) setServiceRequests(srJ.data.serviceRequests)
      })
      .catch(console.error)
  }, [])

  // ─── Effects ────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/dashboard').then(r => r.json()).then(j => { if (j.status) setDashboardData(j.data) }).catch(console.error)
  }, [])

  useEffect(() => {
    if (adminTab === 'products') {
      doFetchProducts()
      fetch('/api/categories').then(r => r.json()).then(j => { if (j.status) setCategories(j.data) }).catch(console.error)
    }
  }, [adminTab, doFetchProducts])

  useEffect(() => {
    if (adminTab === 'orders') doFetchOrders()
  }, [adminTab, doFetchOrders])

  useEffect(() => {
    if (adminTab === 'leads') doFetchLeads()
  }, [adminTab, doFetchLeads])

  useEffect(() => {
    if (adminTab === 'employees') doFetchEmployees()
  }, [adminTab, doFetchEmployees])

  useEffect(() => {
    if (adminTab === 'amc') doFetchAmc()
  }, [adminTab, doFetchAmc])

  // ─── CRUD Handlers ──────────────────────────────────────
  const handleSaveProduct = async () => {
    try {
      const url = editProduct ? `/api/products/${editProduct.id}` : '/api/products'
      const method = editProduct ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(productForm) })
      const json = await res.json()
      if (json.status) { setProductDialog(false); setEditProduct(null); doFetchProducts() }
    } catch (e) { console.error(e) }
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' })
      doFetchProducts()
    } catch (e) { console.error(e) }
  }

  const handleUpdateOrderStatus = async (id: string, orderStatus: string) => {
    try {
      await fetch(`/api/orders/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderStatus }) })
      doFetchOrders()
    } catch (e) { console.error(e) }
  }

  const handleSaveLead = async () => {
    try {
      const res = await fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(leadForm) })
      const json = await res.json()
      if (json.status) { setLeadDialog(false); doFetchLeads() }
    } catch (e) { console.error(e) }
  }

  const handleUpdateLeadStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/leads/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
      doFetchLeads()
      if (selectedLead) {
        fetch(`/api/leads/${id}`).then(r => r.json()).then(j => { if (j.status) setSelectedLead(j.data) }).catch(console.error)
      }
    } catch (e) { console.error(e) }
  }

  const handleSaveQuotation = async () => {
    try {
      const res = await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: selectedLead?.id,
          amount: quotationAmount,
          items: quotationItems ? JSON.stringify([{ desc: quotationItems }]) : null,
          validUntil: quotationValidUntil || null,
        }),
      })
      const json = await res.json()
      if (json.status) { setQuotationDialog(false); doFetchLeads() }
    } catch (e) { console.error(e) }
  }

  const handleSaveEmployee = async () => {
    try {
      const res = await fetch('/api/employees', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(employeeForm) })
      const json = await res.json()
      if (json.status) { setEmployeeDialog(false); doFetchEmployees() }
    } catch (e) { console.error(e) }
  }

  const handleSaveAmc = async () => {
    try {
      const res = await fetch('/api/amc', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(amcForm) })
      const json = await res.json()
      if (json.status) { setAmcDialog(false); doFetchAmc() }
    } catch (e) { console.error(e) }
  }

  const handleSaveServiceRequest = async () => {
    try {
      const res = await fetch('/api/service-requests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(serviceForm) })
      const json = await res.json()
      if (json.status) { setServiceDialog(false); doFetchAmc() }
    } catch (e) { console.error(e) }
  }

  const handleUpdateServiceRequest = async (id: string, data: any) => {
    try {
      await fetch('/api/service-requests', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ requestId: id, ...data }) })
      doFetchAmc()
    } catch (e) { console.error(e) }
  }

  const handleLogout = () => { setUser(null); setView('home') }

  const handleSearch = (key: string, value: string) => {
    setSearchQueries(prev => ({ ...prev, [key]: value }))
  }

  // ─── Open helpers ───────────────────────────────────────
  const openEditProduct = (p: any) => {
    setEditProduct(p)
    setProductForm({
      name: p.name, categoryId: p.categoryId, description: p.description,
      price: String(p.price), stock: String(p.stock), status: p.status,
      steelGrade: p.steelGrade || '', capacity: p.capacity || '', dimensions: p.dimensions || '',
    })
    setProductDialog(true)
  }

  const openNewProduct = () => {
    setEditProduct(null)
    setProductForm(emptyProductForm)
    setProductDialog(true)
  }

  const openLeadDetail = (lead: any) => {
    fetch(`/api/leads/${lead.id}`).then(r => r.json()).then(j => { if (j.status) { setSelectedLead(j.data); setLeadDetailDialog(true) } }).catch(console.error)
  }

  const openOrderDetail = (order: any) => {
    fetch(`/api/orders/${order.id}`).then(r => r.json()).then(j => { if (j.status) { setSelectedOrder(j.data); setOrderDialog(true) } }).catch(console.error)
  }

  // ─── Sidebar JSX is inlined in the render below ──────────

  // ═══════════════════════════════════════════════════════════
  // TAB CONTENT RENDERERS (as functions, not components)
  // ═══════════════════════════════════════════════════════════

  const renderDashboardTab = () => {
    const ov = dashboardData?.overview || {}
    const stats = [
      { label: 'Total Revenue', value: fmt(ov.totalRevenue || 0), icon: IndianRupee, color: 'text-[#59ff00]', bg: 'bg-[#59ff00]/10' },
      { label: 'Total Orders', value: ov.totalOrders || 0, icon: ShoppingCart, color: 'text-blue-400', bg: 'bg-blue-500/10' },
      { label: 'Total Leads', value: ov.totalLeads || 0, icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10' },
      { label: 'Total Products', value: ov.totalProducts || 0, icon: Package, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    ]

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="bg-[#181818] border-[#2a2a2a] hover:border-[#59ff00]/30 transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">{s.label}</p>
                      <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
                    </div>
                    <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center`}>
                      <s.icon className={`w-5 h-5 ${s.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="bg-[#181818] border-[#2a2a2a] lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#59ff00]" /> Revenue Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dashboardData?.monthlyRevenue || []}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#59ff00" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#59ff00" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                    <XAxis dataKey="month" stroke="#666" tick={{ fill: '#999', fontSize: 11 }} />
                    <YAxis stroke="#666" tick={{ fill: '#999', fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="revenue" stroke="#59ff00" strokeWidth={2} fill="url(#revGrad)" name="Revenue" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#181818] border-[#2a2a2a]">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-base">Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={dashboardData?.orderStatusDistribution || []} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="count" nameKey="status">
                      {(dashboardData?.orderStatusDistribution || []).map((_: any, i: number) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11, color: '#999' }} formatter={(value: string) => <span className="text-gray-400 capitalize">{value.replace('_', ' ')}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lead Bar Chart + Low Stock */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="bg-[#181818] border-[#2a2a2a]">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-base">Lead Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dashboardData?.leadStatusDistribution || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                    <XAxis dataKey="status" stroke="#666" tick={{ fill: '#999', fontSize: 10 }} />
                    <YAxis stroke="#666" tick={{ fill: '#999', fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Leads" radius={[6, 6, 0, 0]}>
                      {(dashboardData?.leadStatusDistribution || []).map((_: any, i: number) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#181818] border-[#2a2a2a]">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400" /> Low Stock Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-2">
                {(dashboardData?.lowStockProducts || []).length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-8">No low stock products</p>
                ) : (
                  (dashboardData?.lowStockProducts || []).map((p: any) => (
                    <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-[#0b0b0b] border border-[#2a2a2a] hover:border-yellow-500/30 transition-colors">
                      <div>
                        <p className="text-white text-sm font-medium">{p.name}</p>
                        <p className="text-gray-500 text-xs">{p.category?.name}</p>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">{p.stock} left</Badge>
                        <p className="text-gray-400 text-xs mt-1">{fmt(p.price)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders + Leads */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="bg-[#181818] border-[#2a2a2a]">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-blue-400" /> Recent Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-72 overflow-y-auto custom-scrollbar">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#2a2a2a] hover:bg-transparent">
                      <TableHead className="text-gray-400 text-xs">Order</TableHead>
                      <TableHead className="text-gray-400 text-xs">Customer</TableHead>
                      <TableHead className="text-gray-400 text-xs">Total</TableHead>
                      <TableHead className="text-gray-400 text-xs">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(dashboardData?.recentOrders || []).map((o: any) => (
                      <TableRow key={o.id} className="border-[#2a2a2a] hover:bg-white/5 cursor-pointer" onClick={() => openOrderDetail(o)}>
                        <TableCell className="text-white text-xs font-mono">{o.orderNumber}</TableCell>
                        <TableCell className="text-gray-300 text-xs">{o.customer?.name}</TableCell>
                        <TableCell className="text-[#59ff00] text-xs font-semibold">{fmt(o.total)}</TableCell>
                        <TableCell><Badge className={`text-[10px] ${orderBadge(o.orderStatus)}`}>{o.orderStatus}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#181818] border-[#2a2a2a]">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" /> Recent Leads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-72 overflow-y-auto custom-scrollbar">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#2a2a2a] hover:bg-transparent">
                      <TableHead className="text-gray-400 text-xs">Name</TableHead>
                      <TableHead className="text-gray-400 text-xs">Company</TableHead>
                      <TableHead className="text-gray-400 text-xs">City</TableHead>
                      <TableHead className="text-gray-400 text-xs">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(dashboardData?.recentLeads || []).map((l: any) => (
                      <TableRow key={l.id} className="border-[#2a2a2a] hover:bg-white/5 cursor-pointer" onClick={() => openLeadDetail(l)}>
                        <TableCell className="text-white text-xs">{l.name}</TableCell>
                        <TableCell className="text-gray-300 text-xs">{l.company || '-'}</TableCell>
                        <TableCell className="text-gray-300 text-xs">{l.city || '-'}</TableCell>
                        <TableCell><Badge className={`text-[10px] ${leadBadge(l.status)}`}>{l.status.replace('_', ' ')}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AMC Stats */}
        <Card className="bg-[#181818] border-[#2a2a2a]">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-base flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#59ff00]" /> AMC Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-[#0b0b0b] border border-[#2a2a2a] text-center">
                <p className="text-gray-400 text-xs mb-1">Active Contracts</p>
                <p className="text-[#59ff00] text-2xl font-bold">{dashboardData?.amcStats?.active || 0}</p>
              </div>
              <div className="p-4 rounded-lg bg-[#0b0b0b] border border-[#2a2a2a] text-center">
                <p className="text-gray-400 text-xs mb-1">Expiring Soon</p>
                <p className="text-yellow-400 text-2xl font-bold">{dashboardData?.amcStats?.expiringSoon || 0}</p>
              </div>
              <div className="p-4 rounded-lg bg-[#0b0b0b] border border-[#2a2a2a] text-center">
                <p className="text-gray-400 text-xs mb-1">Total Value</p>
                <p className="text-blue-400 text-2xl font-bold">{fmt(dashboardData?.amcStats?.totalValue || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  const renderProductsTab = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <h2 className="text-white text-xl font-bold">Products</h2>
        <Button onClick={openNewProduct} className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90 font-semibold">
          <Plus className="w-4 h-4 mr-1" /> Add Product
        </Button>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            placeholder="Search products..."
            className="pl-9 bg-[#181818] border-[#2a2a2a] text-white placeholder:text-gray-500"
            value={searchQueries.products || ''}
            onChange={(e) => handleSearch('products', e.target.value)}
          />
        </div>
        <Select value={productCategoryFilter} onValueChange={setProductCategoryFilter}>
          <SelectTrigger className="w-48 bg-[#181818] border-[#2a2a2a] text-white">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="bg-[#181818] border-[#2a2a2a]">
            <SelectItem value="all" className="text-white focus:bg-[#59ff00]/10 focus:text-[#59ff00]">All Categories</SelectItem>
            {categories.map((c: any) => (
              <SelectItem key={c.id} value={c.slug} className="text-white focus:bg-[#59ff00]/10 focus:text-[#59ff00]">{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Card className="bg-[#181818] border-[#2a2a2a]">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-[#2a2a2a] hover:bg-transparent">
                  <TableHead className="text-gray-400">Product</TableHead>
                  <TableHead className="text-gray-400">Category</TableHead>
                  <TableHead className="text-gray-400">Price</TableHead>
                  <TableHead className="text-gray-400">Stock</TableHead>
                  <TableHead className="text-gray-400">Status</TableHead>
                  <TableHead className="text-gray-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p: any) => (
                  <TableRow key={p.id} className="border-[#2a2a2a] hover:bg-white/5">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#2a2a2a] flex items-center justify-center flex-shrink-0">
                          <Package className="w-4 h-4 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{p.name}</p>
                          <p className="text-gray-500 text-xs">{p.steelGrade || p.capacity || ''}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-300 text-sm">{p.category?.name}</TableCell>
                    <TableCell className="text-[#59ff00] text-sm font-semibold">{fmt(p.price)}</TableCell>
                    <TableCell>
                      <Badge className={p.stock <= 5 ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'}>{p.stock}</Badge>
                    </TableCell>
                    <TableCell><Badge className={statusBadgeCls(p.status)}>{p.status}</Badge></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" onClick={() => openEditProduct(p)} className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 h-8 w-8 p-0">
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteProduct(p.id)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 w-8 p-0">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {products.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center text-gray-500 py-8">No products found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  const renderOrdersTab = () => {
    const orderStatuses = ['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-4">
        <h2 className="text-white text-xl font-bold">Orders</h2>
        <div className="flex gap-2 flex-wrap">
          {orderStatuses.map((s) => (
            <Button key={s} variant={orderStatusFilter === s ? 'default' : 'ghost'} size="sm" onClick={() => setOrderStatusFilter(s)}
              className={orderStatusFilter === s ? 'bg-[#59ff00] text-black hover:bg-[#59ff00]/90 font-semibold' : 'text-gray-400 hover:text-white hover:bg-white/5 capitalize'}>
              {s === 'all' ? 'All' : s}
            </Button>
          ))}
        </div>
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input placeholder="Search orders..." className="pl-9 bg-[#181818] border-[#2a2a2a] text-white placeholder:text-gray-500" value={searchQueries.orders || ''} onChange={(e) => handleSearch('orders', e.target.value)} />
        </div>
        <Card className="bg-[#181818] border-[#2a2a2a]">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#2a2a2a] hover:bg-transparent">
                    <TableHead className="text-gray-400">Order #</TableHead>
                    <TableHead className="text-gray-400">Customer</TableHead>
                    <TableHead className="text-gray-400">Items</TableHead>
                    <TableHead className="text-gray-400">Total</TableHead>
                    <TableHead className="text-gray-400">Payment</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                    <TableHead className="text-gray-400">Date</TableHead>
                    <TableHead className="text-gray-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((o: any) => (
                    <TableRow key={o.id} className="border-[#2a2a2a] hover:bg-white/5">
                      <TableCell className="text-white text-xs font-mono">{o.orderNumber}</TableCell>
                      <TableCell className="text-gray-300 text-sm">{o.customer?.name}</TableCell>
                      <TableCell className="text-gray-300 text-sm">{o.items?.length || 0} items</TableCell>
                      <TableCell className="text-[#59ff00] text-sm font-semibold">{fmt(o.total)}</TableCell>
                      <TableCell><Badge className={`text-[10px] ${paymentBadge(o.paymentStatus)}`}>{o.paymentStatus}</Badge></TableCell>
                      <TableCell><Badge className={`text-[10px] ${orderBadge(o.orderStatus)}`}>{o.orderStatus}</Badge></TableCell>
                      <TableCell className="text-gray-400 text-xs">{fmtDate(o.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="ghost" onClick={() => openOrderDetail(o)} className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 h-8 w-8 p-0">
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Select onValueChange={(v) => handleUpdateOrderStatus(o.id, v)}>
                            <SelectTrigger className="h-8 w-8 p-0 border-0 bg-transparent text-gray-400 hover:text-white">
                              <ChevronDown className="w-3.5 h-3.5" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#181818] border-[#2a2a2a]">
                              {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
                                <SelectItem key={s} value={s} className="text-white focus:bg-[#59ff00]/10 focus:text-[#59ff00] capitalize">{s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {orders.length === 0 && (
                    <TableRow><TableCell colSpan={8} className="text-center text-gray-500 py-8">No orders found</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  const renderLeadsTab = () => {
    const pipelineColumns = [
      { key: 'new', label: 'New', color: 'border-blue-500/30' },
      { key: 'contacted', label: 'Contacted', color: 'border-cyan-500/30' },
      { key: 'quotation_sent', label: 'Quotation Sent', color: 'border-purple-500/30' },
      { key: 'negotiation', label: 'Negotiation', color: 'border-yellow-500/30' },
      { key: 'won', label: 'Won', color: 'border-emerald-500/30' },
      { key: 'lost', label: 'Lost', color: 'border-red-500/30' },
    ]
    const getLeadsByStatus = (status: string) => leads.filter((l: any) => l.status === status)

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-white text-xl font-bold">Leads Pipeline</h2>
          <Button onClick={() => { setLeadForm(emptyLeadForm); setLeadDialog(true) }} className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90 font-semibold">
            <Plus className="w-4 h-4 mr-1" /> Add Lead
          </Button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar">
          {pipelineColumns.map(({ key, label, color }) => (
            <div key={key} className="flex-shrink-0 w-64">
              <div className={`rounded-xl border ${color} bg-[#181818] overflow-hidden`}>
                <div className="px-3 py-2 border-b border-[#2a2a2a] flex items-center justify-between">
                  <span className="text-white text-sm font-semibold">{label}</span>
                  <Badge className="bg-white/10 text-gray-300 border-white/10 text-[10px]">{getLeadsByStatus(key).length}</Badge>
                </div>
                <div className="p-2 space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
                  {getLeadsByStatus(key).map((l: any) => (
                    <div key={l.id} onClick={() => openLeadDetail(l)} className="p-3 rounded-lg bg-[#0b0b0b] border border-[#2a2a2a] hover:border-[#59ff00]/30 cursor-pointer transition-all">
                      <p className="text-white text-sm font-medium">{l.name}</p>
                      {l.company && <p className="text-gray-400 text-xs flex items-center gap-1 mt-1"><Building2 className="w-3 h-3" />{l.company}</p>}
                      {l.city && <p className="text-gray-400 text-xs flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{l.city}</p>}
                      {l.phone && <p className="text-gray-400 text-xs flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3" />{l.phone}</p>}
                      {l.assignee && <p className="text-[#59ff00] text-[10px] mt-1.5 font-medium">Assigned: {l.assignee.name}</p>}
                    </div>
                  ))}
                  {getLeadsByStatus(key).length === 0 && (
                    <p className="text-gray-600 text-xs text-center py-4">No leads</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    )
  }

  const renderEmployeesTab = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white text-xl font-bold">Employees</h2>
        <Button onClick={() => { setEmployeeForm(emptyEmployeeForm); setEmployeeDialog(true) }} className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90 font-semibold">
          <Plus className="w-4 h-4 mr-1" /> Add Employee
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.map((e: any) => (
          <Card key={e.id} className="bg-[#181818] border-[#2a2a2a] hover:border-[#59ff00]/20 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-full bg-[#2a2a2a] flex items-center justify-center flex-shrink-0">
                  <UserCog className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm">{e.user?.name}</p>
                  <p className="text-gray-400 text-xs">{e.designation}</p>
                  <p className="text-gray-500 text-xs">{e.department}</p>
                </div>
                <Badge className={statusBadgeCls(e.status)}>{e.status}</Badge>
              </div>
              <Separator className="bg-[#2a2a2a] my-3" />
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><p className="text-gray-500">Salary</p><p className="text-[#59ff00] font-semibold">{fmt(e.salary)}</p></div>
                <div><p className="text-gray-500">Joined</p><p className="text-gray-300">{fmtDate(e.joiningDate)}</p></div>
                <div><p className="text-gray-500">Email</p><p className="text-gray-300 truncate">{e.user?.email}</p></div>
                <div><p className="text-gray-500">Tasks</p><p className="text-gray-300">{e._count?.tasks || 0}</p></div>
              </div>
            </CardContent>
          </Card>
        ))}
        {employees.length === 0 && <div className="col-span-3 text-center text-gray-500 py-12">No employees found</div>}
      </div>
    </motion.div>
  )

  const renderAmcTab = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-white text-xl font-bold">AMC Contracts</h2>
          <Button onClick={() => { setAmcForm(emptyAmcForm); setAmcDialog(true) }} className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90 font-semibold">
            <Plus className="w-4 h-4 mr-1" /> Add Contract
          </Button>
        </div>
        <Card className="bg-[#181818] border-[#2a2a2a]">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#2a2a2a] hover:bg-transparent">
                    <TableHead className="text-gray-400">Customer</TableHead>
                    <TableHead className="text-gray-400">Plan</TableHead>
                    <TableHead className="text-gray-400">Start Date</TableHead>
                    <TableHead className="text-gray-400">End Date</TableHead>
                    <TableHead className="text-gray-400">Amount</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                    <TableHead className="text-gray-400">Service Req</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {amcContracts.map((c: any) => (
                    <TableRow key={c.id} className="border-[#2a2a2a] hover:bg-white/5">
                      <TableCell className="text-white text-sm">{c.customer?.name}</TableCell>
                      <TableCell className="text-gray-300 text-sm">{c.plan}</TableCell>
                      <TableCell className="text-gray-300 text-xs">{fmtDate(c.startDate)}</TableCell>
                      <TableCell className="text-gray-300 text-xs">{fmtDate(c.endDate)}</TableCell>
                      <TableCell className="text-[#59ff00] text-sm font-semibold">{fmt(c.amount)}</TableCell>
                      <TableCell><Badge className={statusBadgeCls(c.status)}>{c.status}</Badge></TableCell>
                      <TableCell className="text-gray-300 text-sm">{c._count?.serviceRequests || 0}</TableCell>
                    </TableRow>
                  ))}
                  {amcContracts.length === 0 && (
                    <TableRow><TableCell colSpan={7} className="text-center text-gray-500 py-8">No AMC contracts found</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-white text-xl font-bold flex items-center gap-2">
            <Wrench className="w-5 h-5 text-[#59ff00]" /> Service Requests
          </h2>
          <Button onClick={() => { setServiceForm(emptyServiceForm); setServiceDialog(true) }} className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90 font-semibold">
            <Plus className="w-4 h-4 mr-1" /> Add Request
          </Button>
        </div>
        <Card className="bg-[#181818] border-[#2a2a2a]">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#2a2a2a] hover:bg-transparent">
                    <TableHead className="text-gray-400">Customer</TableHead>
                    <TableHead className="text-gray-400">Issue</TableHead>
                    <TableHead className="text-gray-400">Priority</TableHead>
                    <TableHead className="text-gray-400">Assigned To</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                    <TableHead className="text-gray-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {serviceRequests.map((sr: any) => (
                    <TableRow key={sr.id} className="border-[#2a2a2a] hover:bg-white/5">
                      <TableCell className="text-white text-sm">{sr.customer?.name}</TableCell>
                      <TableCell className="text-gray-300 text-sm max-w-[200px] truncate">{sr.issue}</TableCell>
                      <TableCell><Badge className={priorityBadge(sr.priority)}>{sr.priority}</Badge></TableCell>
                      <TableCell className="text-gray-300 text-sm">{sr.technician?.name || 'Unassigned'}</TableCell>
                      <TableCell><Badge className={statusBadgeCls(sr.status)}>{sr.status.replace('_', ' ')}</Badge></TableCell>
                      <TableCell>
                        <Select onValueChange={(v) => handleUpdateServiceRequest(sr.id, { status: v })}>
                          <SelectTrigger className="h-8 w-8 p-0 border-0 bg-transparent text-gray-400 hover:text-white">
                            <ChevronDown className="w-3.5 h-3.5" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#181818] border-[#2a2a2a]">
                            {['open', 'in_progress', 'resolved', 'closed'].map((s) => (
                              <SelectItem key={s} value={s} className="text-white focus:bg-[#59ff00]/10 focus:text-[#59ff00]">{s.replace('_', ' ')}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                  {serviceRequests.length === 0 && (
                    <TableRow><TableCell colSpan={6} className="text-center text-gray-500 py-8">No service requests found</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )

  const renderSettingsTab = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-4">
      <h2 className="text-white text-xl font-bold">Company Settings</h2>
      <Card className="bg-[#181818] border-[#2a2a2a] max-w-2xl">
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-300">Company Name</Label>
            <Input className="bg-[#0b0b0b] border-[#2a2a2a] text-white" value={settingsData.name} onChange={(e) => setSettingsData(prev => ({ ...prev, name: e.target.value }))} placeholder="Urban Kitchen Manufacturing & Solutions" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Email</Label>
              <Input className="bg-[#0b0b0b] border-[#2a2a2a] text-white" value={settingsData.email} onChange={(e) => setSettingsData(prev => ({ ...prev, email: e.target.value }))} placeholder="info@urbankitchens.com" />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Phone</Label>
              <Input className="bg-[#0b0b0b] border-[#2a2a2a] text-white" value={settingsData.phone} onChange={(e) => setSettingsData(prev => ({ ...prev, phone: e.target.value }))} placeholder="+91 98765 43210" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Address</Label>
            <Textarea className="bg-[#0b0b0b] border-[#2a2a2a] text-white" value={settingsData.address} onChange={(e) => setSettingsData(prev => ({ ...prev, address: e.target.value }))} placeholder="Company address..." rows={3} />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">GST Number</Label>
            <Input className="bg-[#0b0b0b] border-[#2a2a2a] text-white" value={settingsData.gstNumber} onChange={(e) => setSettingsData(prev => ({ ...prev, gstNumber: e.target.value }))} placeholder="29AAACR1234F1ZG" />
          </div>
          <Button onClick={() => alert('Settings saved successfully!')} className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90 font-semibold mt-4">Save Settings</Button>
        </CardContent>
      </Card>
    </motion.div>
  )

  const renderTabContent = () => {
    switch (adminTab) {
      case 'dashboard': return renderDashboardTab()
      case 'products': return renderProductsTab()
      case 'orders': return renderOrdersTab()
      case 'leads': return renderLeadsTab()
      case 'employees': return renderEmployeesTab()
      case 'amc': return renderAmcTab()
      case 'settings': return renderSettingsTab()
      default: return renderDashboardTab()
    }
  }

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════
  return (
    <div className="flex h-screen bg-[#0b0b0b] overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col bg-[#101010] border-r border-[#2a2a2a] transition-all duration-300 relative ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
        <div className="flex flex-col h-full">
          <div className="p-4 flex items-center gap-3 border-b border-[#2a2a2a]">
            <Image src="/logo.jpg" alt="Urban Kitchen" width={36} height={36} className="w-9 h-9 rounded-lg object-contain flex-shrink-0" />
            {!sidebarCollapsed && (
              <div className="overflow-hidden">
                <h1 className="text-white font-bold text-sm leading-tight">Urban Kitchen</h1>
                <p className="text-[#59ff00] text-[10px] font-medium tracking-wider uppercase">Admin Panel</p>
              </div>
            )}
          </div>
          <nav className="flex-1 py-4 px-2 space-y-1">
            {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => { setAdminTab(key); setMobileOpen(false) }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium
                  ${adminTab === key
                    ? 'bg-[#59ff00]/10 text-[#59ff00] border border-[#59ff00]/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && <span>{label}</span>}
              </button>
            ))}
          </nav>
          <div className="p-2 border-t border-[#2a2a2a]">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 text-sm"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute top-5 z-10 w-6 h-6 rounded-full bg-[#181818] border border-[#2a2a2a] flex items-center justify-center text-gray-400 hover:text-[#59ff00] transition-colors"
          style={{ right: '-12px' }}
        >
          {sidebarCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="bg-[#101010] border-[#2a2a2a] w-64 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col h-full">
            <div className="p-4 flex items-center gap-3 border-b border-[#2a2a2a]">
              <Image src="/logo.jpg" alt="Urban Kitchen" width={36} height={36} className="w-9 h-9 rounded-lg object-contain flex-shrink-0" />
              <div className="overflow-hidden">
                <h1 className="text-white font-bold text-sm leading-tight">Urban Kitchen</h1>
                <p className="text-[#59ff00] text-[10px] font-medium tracking-wider uppercase">Admin Panel</p>
              </div>
            </div>
            <nav className="flex-1 py-4 px-2 space-y-1">
              {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => { setAdminTab(key); setMobileOpen(false) }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium
                    ${adminTab === key
                      ? 'bg-[#59ff00]/10 text-[#59ff00] border border-[#59ff00]/20'
                      : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
            <div className="p-2 border-t border-[#2a2a2a]">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 text-sm"
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex items-center justify-between px-4 lg:px-6 py-3 border-b border-[#2a2a2a] bg-[#0b0b0b]">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="lg:hidden text-gray-400 hover:text-white" onClick={() => setMobileOpen(true)}>
              <Menu className="w-5 h-5" />
            </Button>
            <div>
              <h2 className="text-white font-semibold text-lg capitalize">{adminTab}</h2>
              <p className="text-gray-500 text-xs">Urban Kitchen Admin Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-[#181818] border border-[#2a2a2a] rounded-lg px-3 py-1.5">
              <div className="w-2 h-2 rounded-full bg-[#59ff00] animate-pulse" />
              <span className="text-gray-400 text-xs">System Online</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#59ff00]/20 border border-[#59ff00]/30 flex items-center justify-center">
              <span className="text-[#59ff00] text-xs font-bold">A</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-6">
          <AnimatePresence mode="wait">
            <div key={adminTab}>
              {renderTabContent()}
            </div>
          </AnimatePresence>
        </div>
      </main>

      {/* ─── DIALOGS ────────────────────────────────────────── */}

      {/* Product Dialog */}
      <Dialog open={productDialog} onOpenChange={setProductDialog}>
        <DialogContent className="bg-[#181818] border-[#2a2a2a] text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">{editProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
            <DialogDescription className="text-gray-400">Fill in the product details below.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-gray-300 text-sm">Name *</Label>
              <Input className="bg-[#0b0b0b] border-[#2a2a2a] text-white" value={productForm.name} onChange={(e) => setProductForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-gray-300 text-sm">Category *</Label>
                <Select value={productForm.categoryId} onValueChange={(v) => setProductForm(p => ({ ...p, categoryId: v }))}>
                  <SelectTrigger className="bg-[#0b0b0b] border-[#2a2a2a] text-white"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent className="bg-[#181818] border-[#2a2a2a]">
                    {categories.map((c: any) => (
                      <SelectItem key={c.id} value={c.id} className="text-white focus:bg-[#59ff00]/10 focus:text-[#59ff00]">{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-gray-300 text-sm">Price (₹) *</Label>
                <Input type="number" className="bg-[#0b0b0b] border-[#2a2a2a] text-white" value={productForm.price} onChange={(e) => setProductForm(p => ({ ...p, price: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-gray-300 text-sm">Description *</Label>
              <Textarea className="bg-[#0b0b0b] border-[#2a2a2a] text-white" rows={3} value={productForm.description} onChange={(e) => setProductForm(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-gray-300 text-sm">Stock</Label>
                <Input type="number" className="bg-[#0b0b0b] border-[#2a2a2a] text-white" value={productForm.stock} onChange={(e) => setProductForm(p => ({ ...p, stock: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-gray-300 text-sm">Status</Label>
                <Select value={productForm.status} onValueChange={(v) => setProductForm(p => ({ ...p, status: v }))}>
                  <SelectTrigger className="bg-[#0b0b0b] border-[#2a2a2a] text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#181818] border-[#2a2a2a]">
                    <SelectItem value="active" className="text-white focus:bg-[#59ff00]/10 focus:text-[#59ff00]">Active</SelectItem>
                    <SelectItem value="draft" className="text-white focus:bg-[#59ff00]/10 focus:text-[#59ff00]">Draft</SelectItem>
                    <SelectItem value="archived" className="text-white focus:bg-[#59ff00]/10 focus:text-[#59ff00]">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-gray-300 text-sm">Steel Grade</Label>
                <Input className="bg-[#0b0b0b] border-[#2a2a2a] text-white" value={productForm.steelGrade} onChange={(e) => setProductForm(p => ({ ...p, steelGrade: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-gray-300 text-sm">Capacity</Label>
                <Input className="bg-[#0b0b0b] border-[#2a2a2a] text-white" value={productForm.capacity} onChange={(e) => setProductForm(p => ({ ...p, capacity: e.target.value }))} />
              </div>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="ghost" onClick={() => setProductDialog(false)} className="text-gray-400 hover:text-white">Cancel</Button>
            <Button onClick={handleSaveProduct} className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90 font-semibold">{editProduct ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Detail Dialog */}
      <Dialog open={orderDialog} onOpenChange={setOrderDialog}>
        <DialogContent className="bg-[#181818] border-[#2a2a2a] text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Order {selectedOrder?.orderNumber}</DialogTitle>
            <DialogDescription className="text-gray-400">Order details and items</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-gray-500">Customer</p><p className="text-white">{selectedOrder.customer?.name}</p></div>
                <div><p className="text-gray-500">Email</p><p className="text-gray-300 truncate">{selectedOrder.customer?.email}</p></div>
                <div><p className="text-gray-500">Payment</p><Badge className={paymentBadge(selectedOrder.paymentStatus)}>{selectedOrder.paymentStatus}</Badge></div>
                <div><p className="text-gray-500">Status</p><Badge className={orderBadge(selectedOrder.orderStatus)}>{selectedOrder.orderStatus}</Badge></div>
              </div>
              <Separator className="bg-[#2a2a2a]" />
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Items</p>
                {(selectedOrder.items || []).map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-[#2a2a2a] last:border-0">
                    <div>
                      <p className="text-white text-sm">{item.product?.name}</p>
                      <p className="text-gray-500 text-xs">Qty: {item.qty} × {fmt(item.price)}</p>
                    </div>
                    <p className="text-[#59ff00] text-sm font-semibold">{fmt(item.qty * item.price)}</p>
                  </div>
                ))}
              </div>
              <Separator className="bg-[#2a2a2a]" />
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-gray-400">Subtotal</span><span className="text-white">{fmt(selectedOrder.subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Tax (18%)</span><span className="text-white">{fmt(selectedOrder.tax)}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Shipping</span><span className="text-white">{fmt(selectedOrder.shipping)}</span></div>
                <Separator className="bg-[#2a2a2a] my-1" />
                <div className="flex justify-between font-bold"><span className="text-white">Total</span><span className="text-[#59ff00]">{fmt(selectedOrder.total)}</span></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Lead Dialog */}
      <Dialog open={leadDialog} onOpenChange={setLeadDialog}>
        <DialogContent className="bg-[#181818] border-[#2a2a2a] text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Add Lead</DialogTitle>
            <DialogDescription className="text-gray-400">Enter lead information</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label className="text-gray-300 text-sm">Name *</Label><Input className="bg-[#0b0b0b] border-[#2a2a2a] text-white" value={leadForm.name} onChange={(e) => setLeadForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-gray-300 text-sm">Company</Label><Input className="bg-[#0b0b0b] border-[#2a2a2a] text-white" value={leadForm.company} onChange={(e) => setLeadForm(p => ({ ...p, company: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label className="text-gray-300 text-sm">City</Label><Input className="bg-[#0b0b0b] border-[#2a2a2a] text-white" value={leadForm.city} onChange={(e) => setLeadForm(p => ({ ...p, city: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-gray-300 text-sm">Phone</Label><Input className="bg-[#0b0b0b] border-[#2a2a2a] text-white" value={leadForm.phone} onChange={(e) => setLeadForm(p => ({ ...p, phone: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label className="text-gray-300 text-sm">Email</Label><Input className="bg-[#0b0b0b] border-[#2a2a2a] text-white" value={leadForm.email} onChange={(e) => setLeadForm(p => ({ ...p, email: e.target.value }))} /></div>
            </div>
            <div className="space-y-1.5"><Label className="text-gray-300 text-sm">Requirement</Label><Textarea className="bg-[#0b0b0b] border-[#2a2a2a] text-white" rows={2} value={leadForm.requirement} onChange={(e) => setLeadForm(p => ({ ...p, requirement: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-gray-300 text-sm">Source</Label>
                <Select value={leadForm.source} onValueChange={(v) => setLeadForm(p => ({ ...p, source: v }))}>
                  <SelectTrigger className="bg-[#0b0b0b] border-[#2a2a2a] text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#181818] border-[#2a2a2a]">
                    <SelectItem value="website" className="text-white focus:bg-[#59ff00]/10 focus:text-[#59ff00]">Website</SelectItem>
                    <SelectItem value="referral" className="text-white focus:bg-[#59ff00]/10 focus:text-[#59ff00]">Referral</SelectItem>
                    <SelectItem value="social" className="text-white focus:bg-[#59ff00]/10 focus:text-[#59ff00]">Social</SelectItem>
                    <SelectItem value="direct" className="text-white focus:bg-[#59ff00]/10 focus:text-[#59ff00]">Direct</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-gray-300 text-sm">Assign To</Label>
                <Select value={leadForm.assignedTo} onValueChange={(v) => setLeadForm(p => ({ ...p, assignedTo: v }))}>
                  <SelectTrigger className="bg-[#0b0b0b] border-[#2a2a2a] text-white"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent className="bg-[#181818] border-[#2a2a2a]">
                    {employees.map((e: any) => (
                      <SelectItem key={e.id} value={e.userId} className="text-white focus:bg-[#59ff00]/10 focus:text-[#59ff00]">{e.user?.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="ghost" onClick={() => setLeadDialog(false)} className="text-gray-400 hover:text-white">Cancel</Button>
            <Button onClick={handleSaveLead} className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90 font-semibold">Create Lead</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lead Detail Dialog */}
      <Dialog open={leadDetailDialog} onOpenChange={setLeadDetailDialog}>
        <DialogContent className="bg-[#181818] border-[#2a2a2a] text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Lead Details</DialogTitle>
            <DialogDescription className="text-gray-400">Manage lead information</DialogDescription>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#59ff00]/10 border border-[#59ff00]/30 flex items-center justify-center">
                  <Users className="w-5 h-5 text-[#59ff00]" />
                </div>
                <div>
                  <p className="text-white font-bold text-lg">{selectedLead.name}</p>
                  {selectedLead.company && <p className="text-gray-400 text-sm">{selectedLead.company}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {selectedLead.phone && <div className="flex items-center gap-2 text-gray-300"><Phone className="w-3.5 h-3.5 text-gray-500" />{selectedLead.phone}</div>}
                {selectedLead.email && <div className="flex items-center gap-2 text-gray-300"><Mail className="w-3.5 h-3.5 text-gray-500" />{selectedLead.email}</div>}
                {selectedLead.city && <div className="flex items-center gap-2 text-gray-300"><MapPin className="w-3.5 h-3.5 text-gray-500" />{selectedLead.city}</div>}
                {selectedLead.source && <div className="flex items-center gap-2 text-gray-300"><TrendingUp className="w-3.5 h-3.5 text-gray-500" />{selectedLead.source}</div>}
              </div>
              {selectedLead.requirement && (
                <div className="p-3 rounded-lg bg-[#0b0b0b] border border-[#2a2a2a]">
                  <p className="text-gray-500 text-xs mb-1">Requirement</p>
                  <p className="text-gray-300 text-sm">{selectedLead.requirement}</p>
                </div>
              )}
              <Separator className="bg-[#2a2a2a]" />
              <div className="space-y-2">
                <Label className="text-gray-300 text-sm">Update Status</Label>
                <Select value={selectedLead.status} onValueChange={(v) => handleUpdateLeadStatus(selectedLead.id, v)}>
                  <SelectTrigger className="bg-[#0b0b0b] border-[#2a2a2a] text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#181818] border-[#2a2a2a]">
                    {['new', 'contacted', 'quotation_sent', 'negotiation', 'won', 'lost'].map((s) => (
                      <SelectItem key={s} value={s} className="text-white focus:bg-[#59ff00]/10 focus:text-[#59ff00] capitalize">{s.replace('_', ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedLead.quotations?.length > 0 && (
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Quotations</p>
                  {selectedLead.quotations.map((q: any) => (
                    <div key={q.id} className="flex items-center justify-between py-2 border-b border-[#2a2a2a]">
                      <div>
                        <p className="text-white text-sm font-mono">{q.quotationNumber}</p>
                        <p className="text-gray-500 text-xs">{fmtDate(q.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[#59ff00] text-sm font-semibold">{fmt(q.amount)}</p>
                        <Badge className={q.status === 'accepted' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : q.status === 'rejected' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-gray-500/20 text-gray-400 border-gray-500/30'}>{q.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Button onClick={() => { setQuotationAmount(''); setQuotationItems(''); setQuotationValidUntil(''); setQuotationDialog(true) }} className="w-full bg-[#59ff00]/10 text-[#59ff00] hover:bg-[#59ff00]/20 border border-[#59ff00]/30 font-semibold">
                <FileText className="w-4 h-4 mr-2" /> Create Quotation
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Quotation Dialog */}
      <Dialog open={quotationDialog} onOpenChange={setQuotationDialog}>
        <DialogContent className="bg-[#181818] border-[#2a2a2a] text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Create Quotation</DialogTitle>
            <DialogDescription className="text-gray-400">Create a quotation for {selectedLead?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label className="text-gray-300 text-sm">Amount (₹) *</Label><Input type="number" className="bg-[#0b0b0b] border-[#2a2a2a] text-white" value={quotationAmount} onChange={(e) => setQuotationAmount(e.target.value)} /></div>
            <div className="space-y-1.5"><Label className="text-gray-300 text-sm">Items Description</Label><Textarea className="bg-[#0b0b0b] border-[#2a2a2a] text-white" rows={3} value={quotationItems} onChange={(e) => setQuotationItems(e.target.value)} placeholder="Describe the items/services..." /></div>
            <div className="space-y-1.5"><Label className="text-gray-300 text-sm">Valid Until</Label><Input type="date" className="bg-[#0b0b0b] border-[#2a2a2a] text-white" value={quotationValidUntil} onChange={(e) => setQuotationValidUntil(e.target.value)} /></div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="ghost" onClick={() => setQuotationDialog(false)} className="text-gray-400 hover:text-white">Cancel</Button>
            <Button onClick={handleSaveQuotation} className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90 font-semibold">Create Quotation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Employee Dialog */}
      <Dialog open={employeeDialog} onOpenChange={setEmployeeDialog}>
        <DialogContent className="bg-[#181818] border-[#2a2a2a] text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Add Employee</DialogTitle>
            <DialogDescription className="text-gray-400">Enter employee details</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-gray-300 text-sm">Name *</Label><Input className="bg-[#0b0b0b] border-[#2a2a2a] text-white" value={employeeForm.name} onChange={(e) => setEmployeeForm(p => ({ ...p, name: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label className="text-gray-300 text-sm">Email *</Label><Input type="email" className="bg-[#0b0b0b] border-[#2a2a2a] text-white" value={employeeForm.email} onChange={(e) => setEmployeeForm(p => ({ ...p, email: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-gray-300 text-sm">Phone</Label><Input className="bg-[#0b0b0b] border-[#2a2a2a] text-white" value={employeeForm.phone} onChange={(e) => setEmployeeForm(p => ({ ...p, phone: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label className="text-gray-300 text-sm">Password</Label><Input type="password" className="bg-[#0b0b0b] border-[#2a2a2a] text-white" value={employeeForm.password} onChange={(e) => setEmployeeForm(p => ({ ...p, password: e.target.value }))} placeholder="Default: employee123" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-gray-300 text-sm">Department *</Label><Input className="bg-[#0b0b0b] border-[#2a2a2a] text-white" value={employeeForm.department} onChange={(e) => setEmployeeForm(p => ({ ...p, department: e.target.value }))} placeholder="e.g. Sales, Engineering" /></div>
              <div className="space-y-1.5"><Label className="text-gray-300 text-sm">Designation *</Label><Input className="bg-[#0b0b0b] border-[#2a2a2a] text-white" value={employeeForm.designation} onChange={(e) => setEmployeeForm(p => ({ ...p, designation: e.target.value }))} placeholder="e.g. Sales Manager" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-gray-300 text-sm">Salary (₹) *</Label><Input type="number" className="bg-[#0b0b0b] border-[#2a2a2a] text-white" value={employeeForm.salary} onChange={(e) => setEmployeeForm(p => ({ ...p, salary: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label className="text-gray-300 text-sm">Joining Date</Label><Input type="date" className="bg-[#0b0b0b] border-[#2a2a2a] text-white" value={employeeForm.joiningDate} onChange={(e) => setEmployeeForm(p => ({ ...p, joiningDate: e.target.value }))} /></div>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="ghost" onClick={() => setEmployeeDialog(false)} className="text-gray-400 hover:text-white">Cancel</Button>
            <Button onClick={handleSaveEmployee} className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90 font-semibold">Create Employee</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AMC Contract Dialog */}
      <Dialog open={amcDialog} onOpenChange={setAmcDialog}>
        <DialogContent className="bg-[#181818] border-[#2a2a2a] text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Add AMC Contract</DialogTitle>
            <DialogDescription className="text-gray-400">Enter contract details</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label className="text-gray-300 text-sm">Plan *</Label><Input className="bg-[#0b0b0b] border-[#2a2a2a] text-white" value={amcForm.plan} onChange={(e) => setAmcForm(p => ({ ...p, plan: e.target.value }))} placeholder="e.g. Premium, Standard" /></div>
            <div className="space-y-1.5"><Label className="text-gray-300 text-sm">Amount (₹) *</Label><Input type="number" className="bg-[#0b0b0b] border-[#2a2a2a] text-white" value={amcForm.amount} onChange={(e) => setAmcForm(p => ({ ...p, amount: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-gray-300 text-sm">Start Date *</Label><Input type="date" className="bg-[#0b0b0b] border-[#2a2a2a] text-white" value={amcForm.startDate} onChange={(e) => setAmcForm(p => ({ ...p, startDate: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label className="text-gray-300 text-sm">End Date *</Label><Input type="date" className="bg-[#0b0b0b] border-[#2a2a2a] text-white" value={amcForm.endDate} onChange={(e) => setAmcForm(p => ({ ...p, endDate: e.target.value }))} /></div>
            </div>
            <div className="space-y-1.5"><Label className="text-gray-300 text-sm">Coverage</Label><Textarea className="bg-[#0b0b0b] border-[#2a2a2a] text-white" rows={2} value={amcForm.coverage} onChange={(e) => setAmcForm(p => ({ ...p, coverage: e.target.value }))} placeholder="List covered items..." /></div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="ghost" onClick={() => setAmcDialog(false)} className="text-gray-400 hover:text-white">Cancel</Button>
            <Button onClick={handleSaveAmc} className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90 font-semibold">Create Contract</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Service Request Dialog */}
      <Dialog open={serviceDialog} onOpenChange={setServiceDialog}>
        <DialogContent className="bg-[#181818] border-[#2a2a2a] text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Add Service Request</DialogTitle>
            <DialogDescription className="text-gray-400">Enter service request details</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label className="text-gray-300 text-sm">Issue *</Label><Textarea className="bg-[#0b0b0b] border-[#2a2a2a] text-white" rows={3} value={serviceForm.issue} onChange={(e) => setServiceForm(p => ({ ...p, issue: e.target.value }))} placeholder="Describe the issue..." /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-gray-300 text-sm">Priority</Label>
                <Select value={serviceForm.priority} onValueChange={(v) => setServiceForm(p => ({ ...p, priority: v }))}>
                  <SelectTrigger className="bg-[#0b0b0b] border-[#2a2a2a] text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#181818] border-[#2a2a2a]">
                    <SelectItem value="low" className="text-white focus:bg-[#59ff00]/10 focus:text-[#59ff00]">Low</SelectItem>
                    <SelectItem value="medium" className="text-white focus:bg-[#59ff00]/10 focus:text-[#59ff00]">Medium</SelectItem>
                    <SelectItem value="high" className="text-white focus:bg-[#59ff00]/10 focus:text-[#59ff00]">High</SelectItem>
                    <SelectItem value="critical" className="text-white focus:bg-[#59ff00]/10 focus:text-[#59ff00]">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-gray-300 text-sm">Assign Technician</Label>
                <Select value={serviceForm.assignedTechnician} onValueChange={(v) => setServiceForm(p => ({ ...p, assignedTechnician: v }))}>
                  <SelectTrigger className="bg-[#0b0b0b] border-[#2a2a2a] text-white"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent className="bg-[#181818] border-[#2a2a2a]">
                    {employees.map((e: any) => (
                      <SelectItem key={e.id} value={e.userId} className="text-white focus:bg-[#59ff00]/10 focus:text-[#59ff00]">{e.user?.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="ghost" onClick={() => setServiceDialog(false)} className="text-gray-400 hover:text-white">Cancel</Button>
            <Button onClick={handleSaveServiceRequest} className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90 font-semibold">Create Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Global custom scrollbar styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #0b0b0b; border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3a3a3a; }
      `}</style>
    </div>
  )
}
