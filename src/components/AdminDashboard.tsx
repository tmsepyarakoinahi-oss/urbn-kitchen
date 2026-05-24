'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import {
  LayoutDashboard, Package, ShoppingCart, Users, UserCog, Shield,
  Settings, LogOut, Menu, Search, Plus, Edit, Trash2, Eye,
  ChevronDown, IndianRupee, TrendingUp, AlertTriangle, Clock,
  Phone, Mail, MapPin, Building2, FileText, Wrench, X,
  ChevronLeft, ChevronRight, Grid3X3, UserCircle, CalendarDays,
  MessageSquare, Activity, Upload, ImageIcon, Check
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
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
  { key: 'categories', label: 'Categories', icon: Grid3X3 },
  { key: 'orders', label: 'Orders', icon: ShoppingCart },
  { key: 'leads', label: 'Leads', icon: Users },
  { key: 'quotations', label: 'Quotations', icon: FileText },
  { key: 'customers', label: 'Customers', icon: UserCircle },
  { key: 'employees', label: 'Employees', icon: UserCog },
  { key: 'attendance', label: 'Attendance', icon: Clock },
  { key: 'leaves', label: 'Leaves', icon: CalendarDays },
  { key: 'amc', label: 'AMC', icon: Shield },
  { key: 'service', label: 'Service', icon: Wrench },
  { key: 'inquiries', label: 'Inquiries', icon: MessageSquare },
  { key: 'settings', label: 'Settings', icon: Settings },
  { key: 'activity', label: 'Activity', icon: Activity },
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
    draft: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    archived: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    sent: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    accepted: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
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
  name: string
  categoryId: string
  description: string
  shortDescription: string
  price: string
  stock: string
  status: string
  steelGrade: string
  capacity: string
  dimensions: string
  moq: string
  leadTime: string
  featuredImage: string
  featured: boolean
}

interface CategoryForm {
  name: string
  slug: string
  image: string
  parentId: string
  description: string
  displayType: string
  menuOrder: string
  thumbnail: string
  bannerImage: string
  seoTitle: string
  seoDescription: string
  status: string
}

interface VariantForm {
  id?: string
  name: string
  sku: string
  price: string
  stock: string
  weight: string
  dimensions: string
  isDefault: boolean
  sortOrder: number
}

const emptyProductForm: ProductForm = {
  name: '', categoryId: '', description: '', shortDescription: '', price: '',
  stock: '', status: 'active', steelGrade: '', capacity: '', dimensions: '',
  moq: '', leadTime: '', featuredImage: '', featured: false,
}

const emptyCategoryForm: CategoryForm = {
  name: '', slug: '', image: '', parentId: '',
  description: '', displayType: 'products', menuOrder: '0',
  thumbnail: '', bannerImage: '', seoTitle: '', seoDescription: '',
  status: 'active',
}

const emptyVariantForm: VariantForm = {
  name: '', sku: '', price: '', stock: '',
  weight: '', dimensions: '', isDefault: false, sortOrder: 0,
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function AdminDashboard() {
  const { adminTab, setAdminTab, setUser, setView } = useAppStore()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
  const [categoryDialog, setCategoryDialog] = useState(false)
  const [editCategory, setEditCategory] = useState<any>(null)
  const [deleteCategoryDialog, setDeleteCategoryDialog] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<any>(null)
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
  const [categoryForm, setCategoryForm] = useState<CategoryForm>(emptyCategoryForm)
  const [productVariants, setProductVariants] = useState<VariantForm[]>([])
  const [leadForm, setLeadForm] = useState({
    name: '', company: '', phone: '', email: '', city: '', requirement: '', message: '', source: 'website', assignedTo: '',
  })
  const [quotationAmount, setQuotationAmount] = useState('')
  const [quotationValidUntil, setQuotationValidUntil] = useState('')
  const [quotationItems, setQuotationItems] = useState<Array<{desc: string, hsn: string, qty: string, unit: string, rate: string, discount: string, gstPercent: string}>>(
    [{ desc: '', hsn: '', qty: '1', unit: 'Nos', rate: '', discount: '0', gstPercent: '18' }]
  )
  const [quotationCustomerName, setQuotationCustomerName] = useState('')
  const [quotationCustomerCompany, setQuotationCustomerCompany] = useState('')
  const [quotationCustomerEmail, setQuotationCustomerEmail] = useState('')
  const [quotationCustomerPhone, setQuotationCustomerPhone] = useState('')
  const [quotationCustomerAddress, setQuotationCustomerAddress] = useState('')
  const [quotationCustomerGst, setQuotationCustomerGst] = useState('')
  const [quotationNotes, setQuotationNotes] = useState('')
  const [quotationDeliveryPeriod, setQuotationDeliveryPeriod] = useState('2-3 weeks')
  const [quotationInstallation, setQuotationInstallation] = useState('Included')
  const [quotationWarranty, setQuotationWarranty] = useState('12 months against manufacturing defects')
  const [quotationDetailDialog, setQuotationDetailDialog] = useState(false)
  const [selectedQuotation, setSelectedQuotation] = useState<any>(null)
  const [sendingQuotation, setSendingQuotation] = useState(false)

  const computeQuotationTotals = () => {
    let subtotal = 0
    let totalDiscount = 0
    let totalGst = 0
    quotationItems.forEach(item => {
      const qty = parseFloat(item.qty) || 0
      const rate = parseFloat(item.rate) || 0
      const discount = parseFloat(item.discount) || 0
      const gstPercent = parseFloat(item.gstPercent) || 0
      const lineTotal = qty * rate
      const discAmt = lineTotal * discount / 100
      const afterDisc = lineTotal - discAmt
      const gstAmt = afterDisc * gstPercent / 100
      subtotal += lineTotal
      totalDiscount += discAmt
      totalGst += gstAmt
    })
    const afterDiscount = subtotal - totalDiscount
    const cgst = totalGst / 2
    const sgst = totalGst / 2
    const grandTotal = afterDiscount + totalGst
    return { subtotal, totalDiscount, afterDiscount, totalGst, cgst, sgst, grandTotal }
  }

  const [employeeForm, setEmployeeForm] = useState({
    name: '', email: '', phone: '', password: '', department: '', designation: '', salary: '', joiningDate: '',
  })
  const [amcForm, setAmcForm] = useState({
    customerId: '', plan: '', startDate: '', endDate: '', amount: '', coverage: '',
  })
  const [serviceForm, setServiceForm] = useState({
    customerId: '', contractId: '', issue: '', priority: 'medium', assignedTechnician: '',
  })
  const [settingsData, setSettingsData] = useState({ name: '', email: '', phone: '', address: '', gstNumber: '' })
  const [uploading, setUploading] = useState(false)

  // ─── Tab-specific States (moved from render functions for hooks rules) ──
  const [quotationList, setQuotationList] = useState<any[]>([])
  const [userList, setUserList] = useState<any[]>([])
  const [roleList, setRoleList] = useState<any[]>([])
  const [userDialog, setUserDialog] = useState(false)
  const [editUser, setEditUser] = useState<any>(null)
  const [userForm, setUserForm] = useState({ name: '', email: '', phone: '', password: '', roleId: '', status: 'active' })
  const [roleFilter, setRoleFilter] = useState('all')
  const [empEditDialog, setEmpEditDialog] = useState(false)
  const [editEmp, setEditEmp] = useState<any>(null)
  const [empEditForm, setEmpEditForm] = useState({ name: '', email: '', phone: '', password: '', department: '', designation: '', salary: '', joiningDate: '', status: 'active' })
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([])
  const [leaveList, setLeaveList] = useState<any[]>([])
  const [leaveFilter, setLeaveFilter] = useState('all')
  const [inquiryList, setInquiryList] = useState<any[]>([])
  const [settingsObj, setSettingsObj] = useState<Record<string, string>>({})
  const [settingsLoading, setSettingsLoading] = useState(false)
  const [activityList, setActivityList] = useState<any[]>([])

  // ─── Filter States ──────────────────────────────────────
  const [orderStatusFilter, setOrderStatusFilter] = useState('all')
  const [productCategoryFilter, setProductCategoryFilter] = useState('all')
  const [searchQueries, setSearchQueries] = useState<Record<string, string>>({})

  // ─── Fetch helpers ──────────────────────────────────────
  const doFetchProducts = useCallback(() => {
    const params = new URLSearchParams()
    if (searchQueries.products) params.set('search', searchQueries.products)
    if (productCategoryFilter !== 'all') params.set('category', productCategoryFilter)
    params.set('status', 'active')
    params.set('limit', '50')
    fetch(`/api/products?${params}`).then(r => r.json()).then(j => { if (j.status) setProducts(j.data.products) }).catch(console.error)
  }, [searchQueries.products, productCategoryFilter])

  const doFetchCategories = useCallback(() => {
    fetch('/api/categories').then(r => r.json()).then(j => { if (j.status) setCategories(j.data) }).catch(console.error)
  }, [])

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
      doFetchCategories()
    }
  }, [adminTab, doFetchProducts, doFetchCategories])

  useEffect(() => {
    if (adminTab === 'categories') doFetchCategories()
  }, [adminTab, doFetchCategories])

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
    if (adminTab === 'amc' || adminTab === 'service') doFetchAmc()
  }, [adminTab, doFetchAmc])

  useEffect(() => {
    if (adminTab === 'quotations') fetch('/api/quotations?limit=50').then(r => r.json()).then(j => { if (j.status) setQuotationList(j.data.quotations || j.data || []) }).catch(console.error)
  }, [adminTab])

  const doFetchUsers = useCallback(() => {
    const params = new URLSearchParams()
    if (roleFilter !== 'all') params.set('role', roleFilter)
    fetch(`/api/users?${params}`).then(r => r.json()).then(j => { if (j.status) { setUserList(j.data.users || j.data || []); if (j.data.roles) setRoleList(j.data.roles) } }).catch(console.error)
  }, [roleFilter])

  useEffect(() => { if (adminTab === 'customers') doFetchUsers() }, [adminTab, doFetchUsers])

  useEffect(() => {
    if (adminTab === 'attendance') fetch('/api/attendance?limit=50').then(r => r.json()).then(j => { if (j.status) setAttendanceRecords(j.data.attendance || j.data || []) }).catch(console.error)
  }, [adminTab])

  useEffect(() => {
    if (adminTab === 'leaves') {
      const params = leaveFilter !== 'all' ? `?status=${leaveFilter}` : ''
      fetch(`/api/leaves${params}`).then(r => r.json()).then(j => { if (j.status) setLeaveList(j.data.leaves || j.data || []) }).catch(console.error)
    }
  }, [adminTab, leaveFilter])

  useEffect(() => {
    if (adminTab === 'inquiries') fetch('/api/inquiries?limit=50').then(r => r.json()).then(j => { if (j.status) setInquiryList(j.data.inquiries || j.data || []) }).catch(console.error)
  }, [adminTab])

  useEffect(() => {
    if (adminTab === 'settings') fetch('/api/settings').then(r => r.json()).then(j => { if (j.status) setSettingsObj(j.data || {}) }).catch(console.error)
  }, [adminTab])

  useEffect(() => {
    if (adminTab === 'activity') {
      Promise.all([fetch('/api/orders?limit=10'), fetch('/api/leads?limit=10')])
        .then(([oR, lR]) => Promise.all([oR.json(), lR.json()]))
        .then(([oJ, lJ]) => {
          const activities: any[] = []
          if (oJ.status) (oJ.data.orders || []).forEach((o: any) => activities.push({ type: 'order', description: `Order ${o.orderNumber} by ${o.customer?.name}`, status: o.orderStatus, date: o.createdAt }))
          if (lJ.status) (lJ.data.leads || []).forEach((l: any) => activities.push({ type: 'lead', description: `Lead: ${l.name} (${l.company || 'N/A'})`, status: l.status, date: l.createdAt }))
          activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          setActivityList(activities)
        })
        .catch(console.error)
    }
  }, [adminTab])

  // ─── Image Upload Handler ──────────────────────────────
  const handleImageUpload = async (file: File) => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const json = await res.json()
      if (json.status) {
        setProductForm(p => ({ ...p, featuredImage: json.data.url }))
        toast.success('Image uploaded successfully')
      } else {
        toast.error(json.message || 'Upload failed')
      }
    } catch (e) {
      console.error(e)
      toast.error('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  // ─── CRUD Handlers ──────────────────────────────────────
  const handleSaveProduct = async () => {
    try {
      const url = editProduct ? `/api/products/${editProduct.id}` : '/api/products'
      const method = editProduct ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...productForm, variants: productVariants }),
      })
      const json = await res.json()
      if (json.status) {
        setProductDialog(false)
        setEditProduct(null)
        doFetchProducts()
        toast.success(editProduct ? 'Product updated' : 'Product created')
      } else {
        toast.error(json.message || 'Failed to save product')
      }
    } catch (e) {
      console.error(e)
      toast.error('Failed to save product')
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' })
      doFetchProducts()
      toast.success('Product deleted')
    } catch (e) {
      console.error(e)
      toast.error('Failed to delete product')
    }
  }

  const handleSaveCategory = async () => {
    try {
      if (editCategory) {
        const res = await fetch(`/api/categories/${editCategory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(categoryForm),
        })
        const json = await res.json()
        if (json.status) {
          setCategoryDialog(false)
          setEditCategory(null)
          doFetchCategories()
          toast.success('Category updated')
        } else {
          toast.error(json.message || 'Failed to update category')
        }
      } else {
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(categoryForm),
        })
        const json = await res.json()
        if (json.status) {
          setCategoryDialog(false)
          doFetchCategories()
          toast.success('Category created')
        } else {
          toast.error(json.message || 'Failed to create category')
        }
      }
    } catch (e) {
      console.error(e)
      toast.error('Failed to save category')
    }
  }

  const handleDeleteCategory = async (id: string) => {
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.status) {
        doFetchCategories()
        toast.success('Category deleted')
      } else {
        toast.error(json.message || 'Cannot delete category')
      }
    } catch (e) {
      console.error(e)
      toast.error('Failed to delete category')
    }
    setDeleteCategoryDialog(false)
    setCategoryToDelete(null)
  }

  const handleUpdateOrderStatus = async (id: string, orderStatus: string) => {
    try {
      await fetch(`/api/orders/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderStatus }) })
      doFetchOrders()
      toast.success('Order status updated')
    } catch (e) {
      console.error(e)
      toast.error('Failed to update order status')
    }
  }

  const handleSaveLead = async () => {
    try {
      const res = await fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(leadForm) })
      const json = await res.json()
      if (json.status) { setLeadDialog(false); doFetchLeads(); toast.success('Lead created') }
      else { toast.error(json.message || 'Failed to create lead') }
    } catch (e) { console.error(e); toast.error('Failed to create lead') }
  }

  const handleUpdateLeadStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/leads/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
      doFetchLeads()
      if (selectedLead) {
        fetch(`/api/leads/${id}`).then(r => r.json()).then(j => { if (j.status) setSelectedLead(j.data) }).catch(console.error)
      }
      toast.success('Lead status updated')
    } catch (e) { console.error(e); toast.error('Failed to update lead') }
  }

  const handleSaveQuotation = async () => {
    try {
      const totals = computeQuotationTotals()
      const itemsWithAmount = quotationItems.map(item => {
        const qty = parseFloat(item.qty) || 0
        const rate = parseFloat(item.rate) || 0
        const discount = parseFloat(item.discount) || 0
        const gstPercent = parseFloat(item.gstPercent) || 0
        const lineTotal = qty * rate
        const discAmt = lineTotal * discount / 100
        const afterDisc = lineTotal - discAmt
        const gstAmt = afterDisc * gstPercent / 100
        return { ...item, amount: afterDisc + gstAmt }
      })
      const res = await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: selectedLead?.id,
          customerName: quotationCustomerName || selectedLead?.name || '',
          customerCompany: quotationCustomerCompany || selectedLead?.company || '',
          customerEmail: quotationCustomerEmail || selectedLead?.email || '',
          customerPhone: quotationCustomerPhone || selectedLead?.phone || '',
          customerAddress: quotationCustomerAddress || (selectedLead?.city ? `${selectedLead.city}, India` : ''),
          customerGst: quotationCustomerGst,
          amount: totals.grandTotal,
          subtotal: totals.subtotal,
          discountAmount: totals.totalDiscount,
          cgstAmount: totals.cgst,
          sgstAmount: totals.sgst,
          totalGst: totals.totalGst,
          items: JSON.stringify(itemsWithAmount),
          notes: quotationNotes,
          terms: JSON.stringify([
            'Prices are exclusive of freight & insurance charges unless stated otherwise.',
            'GST @18% applicable as per government norms.',
            '50% advance payment with order, balance before dispatch.',
            'Delivery subject to confirmation at the time of order.',
            'Goods once sold will not be taken back.',
            'Subject to Delhi jurisdiction.',
            'This quotation is valid for 30 days from the date of issue.',
          ]),
          bankDetails: JSON.stringify({
            bankName: 'HDFC Bank',
            accountName: 'Urban Kitchen Manufacturing & Solutions',
            accountNo: '50100XXXXX1234',
            ifsc: 'HDFC0001234',
            branch: 'Sector 12, Industrial Area, New Delhi',
          }),
          validUntil: quotationValidUntil || null,
          deliveryPeriod: quotationDeliveryPeriod,
          installation: quotationInstallation,
          warranty: quotationWarranty,
        }),
      })
      const json = await res.json()
      if (json.status) {
        setQuotationDialog(false)
        doFetchLeads()
        if (adminTab === 'quotations') fetch('/api/quotations?limit=50').then(r => r.json()).then(j => { if (j.status) setQuotationList(j.data.quotations || j.data || []) }).catch(console.error)
        toast.success('Quotation created successfully')
      } else {
        toast.error(json.message || 'Failed to create quotation')
      }
    } catch (e) { console.error(e); toast.error('Failed to create quotation') }
  }

  const handleSaveEmployee = async () => {
    try {
      const res = await fetch('/api/employees', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(employeeForm) })
      const json = await res.json()
      if (json.status) { setEmployeeDialog(false); doFetchEmployees(); toast.success('Employee created') }
      else { toast.error(json.message || 'Failed to create employee') }
    } catch (e) { console.error(e); toast.error('Failed to create employee') }
  }

  const handleSaveAmc = async () => {
    try {
      const res = await fetch('/api/amc', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(amcForm) })
      const json = await res.json()
      if (json.status) { setAmcDialog(false); doFetchAmc(); toast.success('AMC contract created') }
      else { toast.error(json.message || 'Failed to create AMC contract') }
    } catch (e) { console.error(e); toast.error('Failed to create AMC contract') }
  }

  const handleSaveServiceRequest = async () => {
    try {
      const res = await fetch('/api/service-requests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(serviceForm) })
      const json = await res.json()
      if (json.status) { setServiceDialog(false); doFetchAmc(); toast.success('Service request created') }
      else { toast.error(json.message || 'Failed to create service request') }
    } catch (e) { console.error(e); toast.error('Failed to create service request') }
  }

  const handleUpdateServiceRequest = async (id: string, data: any) => {
    try {
      await fetch('/api/service-requests', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ requestId: id, ...data }) })
      doFetchAmc()
      toast.success('Service request updated')
    } catch (e) { console.error(e); toast.error('Failed to update service request') }
  }

  const handleLogout = () => { setUser(null); setView('home') }

  const handleSearch = (key: string, value: string) => {
    setSearchQueries(prev => ({ ...prev, [key]: value }))
  }

  // ─── Open helpers ───────────────────────────────────────
  const openEditProduct = (p: any) => {
    setEditProduct(p)
    setProductForm({
      name: p.name,
      categoryId: p.categoryId,
      description: p.description || '',
      shortDescription: p.shortDescription || '',
      price: String(p.price),
      stock: String(p.stock),
      status: p.status,
      steelGrade: p.steelGrade || '',
      capacity: p.capacity || '',
      dimensions: p.dimensions || '',
      moq: p.moq ? String(p.moq) : '',
      leadTime: p.leadTime || '',
      featuredImage: p.featuredImage || '',
      featured: p.featured || false,
    })
    setProductVariants(
      (p.variants || []).map((v: any) => ({
        id: v.id,
        name: v.name || '',
        sku: v.sku || '',
        price: String(v.price ?? ''),
        stock: String(v.stock ?? ''),
        weight: v.weight || '',
        dimensions: v.dimensions || '',
        isDefault: v.isDefault || false,
        sortOrder: v.sortOrder || 0,
      }))
    )
    setProductDialog(true)
  }

  const openNewProduct = () => {
    setEditProduct(null)
    setProductForm(emptyProductForm)
    setProductVariants([])
    setProductDialog(true)
  }

  const openEditCategory = (c: any) => {
    setEditCategory(c)
    setCategoryForm({
      name: c.name,
      slug: c.slug || '',
      image: c.image || '',
      parentId: c.parentId || '',
      description: c.description || '',
      displayType: c.displayType || 'products',
      menuOrder: String(c.menuOrder ?? '0'),
      thumbnail: c.thumbnail || '',
      bannerImage: c.bannerImage || '',
      seoTitle: c.seoTitle || '',
      seoDescription: c.seoDescription || '',
      status: c.status || 'active',
    })
    setCategoryDialog(true)
  }

  const openNewCategory = () => {
    setEditCategory(null)
    setCategoryForm(emptyCategoryForm)
    setCategoryDialog(true)
  }

  const openDeleteCategory = (c: any) => {
    setCategoryToDelete(c)
    setDeleteCategoryDialog(true)
  }

  const openLeadDetail = (lead: any) => {
    fetch(`/api/leads/${lead.id}`).then(r => r.json()).then(j => { if (j.status) { setSelectedLead(j.data); setLeadDetailDialog(true) } }).catch(console.error)
  }

  const openNewQuotation = () => {
    setSelectedLead(null)
    setQuotationCustomerName('')
    setQuotationCustomerCompany('')
    setQuotationCustomerEmail('')
    setQuotationCustomerPhone('')
    setQuotationCustomerAddress('')
    setQuotationCustomerGst('')
    setQuotationAmount('')
    setQuotationItems([{ desc: '', hsn: '', qty: '1', unit: 'Nos', rate: '', discount: '0', gstPercent: '18' }])
    setQuotationValidUntil('')
    setQuotationNotes('')
    setQuotationDeliveryPeriod('2-3 weeks')
    setQuotationInstallation('Included')
    setQuotationWarranty('12 months against manufacturing defects')
    setQuotationDialog(true)
  }

  const openOrderDetail = (order: any) => {
    fetch(`/api/orders/${order.id}`).then(r => r.json()).then(j => { if (j.status) { setSelectedOrder(j.data); setOrderDialog(true) } }).catch(console.error)
  }

  // ═══════════════════════════════════════════════════════════
  // TAB CONTENT RENDERERS
  // ═══════════════════════════════════════════════════════════

  // ─── Dashboard Tab ──────────────────────────────────────
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

  // ─── Products Tab (with image upload) ───────────────────
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
                  <TableHead className="text-gray-400">Featured</TableHead>
                  <TableHead className="text-gray-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p: any) => (
                  <TableRow key={p.id} className="border-[#2a2a2a] hover:bg-white/5">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#2a2a2a] flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {p.featuredImage ? (
                            <Image src={p.featuredImage} alt={p.name} width={40} height={40} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-4 h-4 text-gray-500" />
                          )}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{p.name}</p>
                          <p className="text-gray-500 text-xs">{p.steelGrade || p.capacity || ''}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-300 text-sm">{p.category?.name}</TableCell>
                    <TableCell>
                      <div>
                        <span className="text-[#59ff00] text-sm font-semibold">
                          {p.variants && p.variants.length > 0
                            ? (p.priceRange?.min != null && p.priceRange?.max != null
                                ? `${fmt(p.priceRange.min)} - ${fmt(p.priceRange.max)}`
                                : fmt(p.price))
                            : fmt(p.price)}
                        </span>
                        {p.variants && p.variants.length > 0 && (
                          <Badge className="ml-2 bg-[#59ff00]/10 text-[#59ff00] border-[#59ff00]/30 text-[10px]">
                            {p.variants.length} {p.variants.length === 1 ? 'size' : 'sizes'}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={p.stock <= 5 ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'}>{p.stock}</Badge>
                    </TableCell>
                    <TableCell><Badge className={statusBadgeCls(p.status)}>{p.status}</Badge></TableCell>
                    <TableCell>
                      {p.featured ? (
                        <Check className="w-4 h-4 text-[#59ff00]" />
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </TableCell>
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
                  <TableRow><TableCell colSpan={7} className="text-center text-gray-500 py-8">No products found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  // ─── Categories Tab ─────────────────────────────────────
  const renderCategoriesTab = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <h2 className="text-white text-xl font-bold">Categories</h2>
        <Button onClick={openNewCategory} className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90 font-semibold">
          <Plus className="w-4 h-4 mr-1" /> Add Category
        </Button>
      </div>
      <Card className="bg-[#181818] border-[#2a2a2a]">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-[#2a2a2a] hover:bg-transparent">
                  <TableHead className="text-gray-400">Category</TableHead>
                  <TableHead className="text-gray-400">Slug</TableHead>
                  <TableHead className="text-gray-400">Parent</TableHead>
                  <TableHead className="text-gray-400">Products</TableHead>
                  <TableHead className="text-gray-400">Status</TableHead>
                  <TableHead className="text-gray-400">Display</TableHead>
                  <TableHead className="text-gray-400">Sort</TableHead>
                  <TableHead className="text-gray-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((c: any) => (
                  <TableRow key={c.id} className="border-[#2a2a2a] hover:bg-white/5">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#2a2a2a] flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {c.image ? (
                            <Image src={c.image} alt={c.name} width={40} height={40} className="w-full h-full object-cover" />
                          ) : (
                            <Grid3X3 className="w-4 h-4 text-gray-500" />
                          )}
                        </div>
                        <span className="text-white text-sm font-medium">{c.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-400 text-sm font-mono">{c.slug}</TableCell>
                    <TableCell className="text-gray-300 text-sm">{c.parent?.name || '—'}</TableCell>
                    <TableCell>
                      <Badge className="bg-[#59ff00]/10 text-[#59ff00] border-[#59ff00]/30">
                        {c._count?.products || 0}
                      </Badge>
                    </TableCell>
                    <TableCell><Badge className={statusBadgeCls(c.status || 'active')}>{c.status || 'active'}</Badge></TableCell>
                    <TableCell className="text-gray-300 text-sm capitalize">{c.displayType || 'products'}</TableCell>
                    <TableCell className="text-gray-300 text-sm">{c.menuOrder ?? '0'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" onClick={() => openEditCategory(c)} className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 h-8 w-8 p-0">
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => openDeleteCategory(c)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 w-8 p-0">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {categories.length === 0 && (
                  <TableRow><TableCell colSpan={8} className="text-center text-gray-500 py-8">No categories found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  // ─── Orders Tab ─────────────────────────────────────────
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

  // ─── Placeholder Tabs (Part 2) ──────────────────────────
  // ─── Leads Tab ──────────────────────────────────────────
  const renderLeadsTab = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white text-xl font-bold">Leads</h2>
        <Button onClick={() => { setLeadForm({ name: '', company: '', phone: '', email: '', city: '', requirement: '', message: '', source: 'website', assignedTo: '' }); setLeadDialog(true) }} className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90 font-semibold"><Plus className="w-4 h-4 mr-1" /> Add Lead</Button>
      </div>
      <Card className="bg-[#181818] border-[#2a2a2a]">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow className="border-[#2a2a2a] hover:bg-transparent"><TableHead className="text-gray-400">Name</TableHead><TableHead className="text-gray-400">Company</TableHead><TableHead className="text-gray-400">City</TableHead><TableHead className="text-gray-400">Source</TableHead><TableHead className="text-gray-400">Status</TableHead><TableHead className="text-gray-400">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {leads.map((l: any) => (
                  <TableRow key={l.id} className="border-[#2a2a2a] hover:bg-white/5">
                    <TableCell className="text-white text-sm">{l.name}</TableCell>
                    <TableCell className="text-gray-300 text-sm">{l.company || '-'}</TableCell>
                    <TableCell className="text-gray-300 text-sm">{l.city || '-'}</TableCell>
                    <TableCell className="text-gray-300 text-sm capitalize">{l.source || '-'}</TableCell>
                    <TableCell><Badge className={`text-[10px] ${leadBadge(l.status)}`}>{l.status.replace('_', ' ')}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => openLeadDetail(l)} className="text-blue-400 hover:text-blue-300 h-8 w-8 p-0"><Eye className="w-3.5 h-3.5" /></Button>
                        <Select onValueChange={(v) => handleUpdateLeadStatus(l.id, v)}>
                          <SelectTrigger className="h-8 w-8 p-0 border-0 bg-transparent text-gray-400"><ChevronDown className="w-3.5 h-3.5" /></SelectTrigger>
                          <SelectContent className="bg-[#181818] border-[#2a2a2a]">
                            {['new', 'contacted', 'quotation_sent', 'negotiation', 'won', 'lost'].map(s => <SelectItem key={s} value={s} className="text-white capitalize">{s.replace('_', ' ')}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {leads.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-gray-500 py-8">No leads found</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  // ─── Quotations Tab ─────────────────────────────────────
  const renderQuotationsTab = () => {
    const openQuotationDetail = (q: any) => {
      fetch(`/api/quotations/${q.id}`).then(r => r.json()).then(j => {
        if (j.status) { setSelectedQuotation(j.data); setQuotationDetailDialog(true) }
      }).catch(console.error)
    }

    const handleQuotationStatusChange = async (id: string, status: string) => {
      try {
        await fetch(`/api/quotations/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
        fetch('/api/quotations?limit=50').then(r => r.json()).then(j => { if (j.status) setQuotationList(j.data.quotations || j.data || []) }).catch(console.error)
        toast.success(`Quotation ${status}`)
      } catch (e) { toast.error('Failed to update') }
    }

    const handleDeleteQuotation = async (id: string) => {
      if (!confirm('Delete this quotation?')) return
      try {
        await fetch(`/api/quotations/${id}`, { method: 'DELETE' })
        fetch('/api/quotations?limit=50').then(r => r.json()).then(j => { if (j.status) setQuotationList(j.data.quotations || j.data || []) }).catch(console.error)
        toast.success('Quotation deleted')
      } catch (e) { toast.error('Failed to delete') }
    }

    const handleGeneratePdf = (id: string) => {
      window.open(`/api/quotations/generate-pdf?id=${id}`, '_blank')
    }

    const handleSendQuotation = async (id: string, method: 'email' | 'whatsapp' | 'both') => {
      setSendingQuotation(true)
      try {
        const res = await fetch('/api/quotations/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quotationId: id, method }),
        })
        const json = await res.json()
        if (json.status) {
          if (method === 'whatsapp' && json.data?.whatsappUrl) {
            window.open(json.data.whatsappUrl, '_blank')
          }
          fetch('/api/quotations?limit=50').then(r => r.json()).then(j => { if (j.status) setQuotationList(j.data.quotations || j.data || []) }).catch(console.error)
          if (selectedQuotation?.id === id) {
            fetch(`/api/quotations/${id}`).then(r => r.json()).then(j => { if (j.status) setSelectedQuotation(j.data) }).catch(console.error)
          }
          toast.success(`Quotation sent via ${method === 'both' ? 'email & WhatsApp' : method}`)
        } else {
          toast.error(json.message || `Failed to send via ${method}`)
        }
      } catch (e) {
        toast.error('Failed to send quotation')
      } finally {
        setSendingQuotation(false)
      }
    }

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-white text-xl font-bold">Quotations</h2>
          <Button onClick={openNewQuotation} className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90 font-semibold">
            <Plus className="w-4 h-4 mr-2" /> New Quotation
          </Button>
        </div>
        <Card className="bg-[#181818] border-[#2a2a2a]">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#2a2a2a] hover:bg-transparent">
                    <TableHead className="text-gray-400">Quotation #</TableHead>
                    <TableHead className="text-gray-400">Customer</TableHead>
                    <TableHead className="text-gray-400">Amount</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                    <TableHead className="text-gray-400">Valid Until</TableHead>
                    <TableHead className="text-gray-400">Sent</TableHead>
                    <TableHead className="text-gray-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotationList.map((q: any) => (
                    <TableRow key={q.id} className="border-[#2a2a2a] hover:bg-white/5">
                      <TableCell className="text-white text-sm font-mono cursor-pointer hover:text-[#59ff00]" onClick={() => openQuotationDetail(q)}>{q.quotationNumber}</TableCell>
                      <TableCell className="text-gray-300 text-sm">
                        <div>{q.customerName || q.lead?.name || '-'}</div>
                        {q.customerCompany && <div className="text-gray-500 text-xs">{q.customerCompany}</div>}
                      </TableCell>
                      <TableCell className="text-[#59ff00] text-sm font-semibold">{fmt(q.amount)}</TableCell>
                      <TableCell>
                        <Select value={q.status} onValueChange={(v) => handleQuotationStatusChange(q.id, v)}>
                          <SelectTrigger className="h-7 w-28 text-xs bg-transparent border-0 p-0">
                            <Badge className={`text-[10px] ${statusBadgeCls(q.status)}`}>{q.status}</Badge>
                          </SelectTrigger>
                          <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="sent">Sent</SelectItem>
                            <SelectItem value="accepted">Accepted</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                            <SelectItem value="expired">Expired</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-gray-400 text-sm">{q.validUntil ? fmtDate(q.validUntil) : '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {q.emailSent && <Badge className="text-[9px] bg-blue-500/20 text-blue-400 border-blue-500/30">Email</Badge>}
                          {q.whatsappSent && <Badge className="text-[9px] bg-green-500/20 text-green-400 border-green-500/30">WhatsApp</Badge>}
                          {!q.emailSent && !q.whatsappSent && <span className="text-gray-600 text-xs">—</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openQuotationDetail(q)} className="text-gray-400 hover:text-[#59ff00] h-7 w-7 p-0"><Eye className="w-3.5 h-3.5" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleGeneratePdf(q.id)} className="text-gray-400 hover:text-blue-400 h-7 w-7 p-0"><FileText className="w-3.5 h-3.5" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleSendQuotation(q.id, 'email')} className="text-gray-400 hover:text-purple-400 h-7 w-7 p-0" title="Send via Email"><Mail className="w-3.5 h-3.5" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleSendQuotation(q.id, 'whatsapp')} className="text-gray-400 hover:text-green-400 h-7 w-7 p-0" title="Send via WhatsApp"><MessageSquare className="w-3.5 h-3.5" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteQuotation(q.id)} className="text-gray-400 hover:text-red-400 h-7 w-7 p-0"><Trash2 className="w-3.5 h-3.5" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {quotationList.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-gray-500 py-8">No quotations found. Create one from a lead or click &quot;New Quotation&quot;.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Quotation Detail Dialog */}
        <Dialog open={quotationDetailDialog} onOpenChange={setQuotationDetailDialog}>
          <DialogContent className="bg-[#181818] border-[#2a2a2a] text-white max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-3">
                <span>Quotation {selectedQuotation?.quotationNumber}</span>
                <Badge className={`text-xs ${statusBadgeCls(selectedQuotation?.status)}`}>{selectedQuotation?.status}</Badge>
              </DialogTitle>
            </DialogHeader>
            {selectedQuotation && (
              <div className="space-y-4">
                {/* Customer Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#0b0b0b] border border-[#2a2a2a] rounded-lg p-3">
                    <p className="text-gray-500 text-xs mb-1">Bill To</p>
                    <p className="text-white font-semibold">{selectedQuotation.customerName}</p>
                    {selectedQuotation.customerCompany && <p className="text-gray-400 text-sm">{selectedQuotation.customerCompany}</p>}
                    {selectedQuotation.customerAddress && <p className="text-gray-500 text-sm">{selectedQuotation.customerAddress}</p>}
                    {selectedQuotation.customerGst && <p className="text-gray-500 text-xs mt-1">GSTIN: {selectedQuotation.customerGst}</p>}
                  </div>
                  <div className="bg-[#0b0b0b] border border-[#2a2a2a] rounded-lg p-3">
                    <p className="text-gray-500 text-xs mb-1">Quotation Details</p>
                    <p className="text-gray-300 text-sm">Date: {fmtDate(selectedQuotation.createdAt)}</p>
                    {selectedQuotation.validUntil && <p className="text-gray-300 text-sm">Valid Until: {fmtDate(selectedQuotation.validUntil)}</p>}
                    {selectedQuotation.deliveryPeriod && <p className="text-gray-300 text-sm">Delivery: {selectedQuotation.deliveryPeriod}</p>}
                    {selectedQuotation.warranty && <p className="text-gray-300 text-sm">Warranty: {selectedQuotation.warranty}</p>}
                  </div>
                </div>

                {/* Items */}
                {selectedQuotation.items && (
                  <div className="bg-[#0b0b0b] border border-[#2a2a2a] rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader><TableRow className="border-[#2a2a2a] hover:bg-transparent">
                        <TableHead className="text-gray-400 text-xs">#</TableHead>
                        <TableHead className="text-gray-400 text-xs">Description</TableHead>
                        <TableHead className="text-gray-400 text-xs text-right">Qty</TableHead>
                        <TableHead className="text-gray-400 text-xs text-right">Rate</TableHead>
                        <TableHead className="text-gray-400 text-xs text-right">GST%</TableHead>
                        <TableHead className="text-gray-400 text-xs text-right">Amount</TableHead>
                      </TableRow></TableHeader>
                      <TableBody>
                        {(JSON.parse(selectedQuotation.items || '[]')).map((item: any, i: number) => (
                          <TableRow key={i} className="border-[#2a2a2a] hover:bg-transparent">
                            <TableCell className="text-gray-400 text-xs">{i + 1}</TableCell>
                            <TableCell className="text-white text-xs">{item.desc}{item.hsn ? <span className="text-gray-500 ml-1">({item.hsn})</span> : ''}</TableCell>
                            <TableCell className="text-gray-300 text-xs text-right">{item.qty} {item.unit || 'Nos'}</TableCell>
                            <TableCell className="text-gray-300 text-xs text-right">{fmt(item.rate || 0)}</TableCell>
                            <TableCell className="text-gray-400 text-xs text-right">{item.gstPercent || 0}%</TableCell>
                            <TableCell className="text-[#59ff00] text-xs text-right font-semibold">{fmt(item.amount || 0)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* Totals */}
                <div className="flex justify-end">
                  <div className="w-64 space-y-1.5">
                    <div className="flex justify-between text-sm"><span className="text-gray-400">Subtotal</span><span className="text-gray-300">{fmt(selectedQuotation.subtotal || 0)}</span></div>
                    {selectedQuotation.discountAmount > 0 && <div className="flex justify-between text-sm"><span className="text-gray-400">Discount</span><span className="text-red-400">-{fmt(selectedQuotation.discountAmount)}</span></div>}
                    <div className="flex justify-between text-sm"><span className="text-gray-400">CGST</span><span className="text-gray-300">{fmt(selectedQuotation.cgstAmount || 0)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-400">SGST</span><span className="text-gray-300">{fmt(selectedQuotation.sgstAmount || 0)}</span></div>
                    <div className="flex justify-between text-sm pt-2 border-t border-[#2a2a2a]"><span className="text-white font-bold">Grand Total</span><span className="text-[#59ff00] font-bold text-lg">{fmt(selectedQuotation.amount)}</span></div>
                  </div>
                </div>

                {/* Send tracking */}
                <div className="flex items-center gap-4 text-xs">
                  {selectedQuotation.emailSent && <span className="text-blue-400">📧 Email sent {selectedQuotation.emailSentAt ? fmtDate(selectedQuotation.emailSentAt) : ''}</span>}
                  {selectedQuotation.whatsappSent && <span className="text-green-400">💬 WhatsApp sent {selectedQuotation.whatsappSentAt ? fmtDate(selectedQuotation.whatsappSentAt) : ''}</span>}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-[#2a2a2a]">
                  <Button onClick={() => handleGeneratePdf(selectedQuotation.id)} variant="outline" className="border-[#2a2a2a] text-gray-300 hover:text-white">
                    <FileText className="w-4 h-4 mr-2" /> Download PDF
                  </Button>
                  <Button onClick={() => handleSendQuotation(selectedQuotation.id, 'email')} className="bg-blue-600 text-white hover:bg-blue-700" disabled={sendingQuotation}>
                    <Mail className="w-4 h-4 mr-2" /> Send Email
                  </Button>
                  <Button onClick={() => handleSendQuotation(selectedQuotation.id, 'whatsapp')} className="bg-green-600 text-white hover:bg-green-700" disabled={sendingQuotation}>
                    <MessageSquare className="w-4 h-4 mr-2" /> WhatsApp
                  </Button>
                  <Button onClick={() => handleSendQuotation(selectedQuotation.id, 'both')} className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90" disabled={sendingQuotation}>
                    Send Both
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </motion.div>
    )
  }

  // ─── Customers Tab (User Management) ────────────────────
  const renderCustomersTab = () => {
    const openNewUser = () => { setEditUser(null); setUserForm({ name: '', email: '', phone: '', password: '', roleId: '', status: 'active' }); setUserDialog(true) }
    const openEditUser = (u: any) => { setEditUser(u); setUserForm({ name: u.name, email: u.email, phone: u.phone || '', password: '', roleId: u.roleId, status: u.status }); setUserDialog(true) }

    const handleSaveUser = async () => {
      try {
        if (editUser) {
          const body: any = { name: userForm.name, email: userForm.email, phone: userForm.phone, status: userForm.status, roleId: userForm.roleId }
          if (userForm.password) body.password = userForm.password
          const res = await fetch(`/api/users/${editUser.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
          const json = await res.json()
          if (json.status) { setUserDialog(false); doFetchUsers(); toast.success('User updated') } else { toast.error(json.message || 'Failed') }
        } else {
          const res = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(userForm) })
          const json = await res.json()
          if (json.status) { setUserDialog(false); doFetchUsers(); toast.success('User created') } else { toast.error(json.message || 'Failed') }
        }
      } catch (e) { console.error(e); toast.error('Failed to save user') }
    }

    const handleDeleteUser = async (id: string) => {
      if (!confirm('Delete this user?')) return
      try { await fetch(`/api/users/${id}`, { method: 'DELETE' }); doFetchUsers(); toast.success('User deleted') } catch (e) { toast.error('Failed to delete') }
    }

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-white text-xl font-bold">Users & Customers</h2>
          <Button onClick={openNewUser} className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90 font-semibold"><Plus className="w-4 h-4 mr-1" /> Add User</Button>
        </div>
        <div className="flex gap-2">
          {['all', 'admin', 'manager', 'employee', 'customer'].map(r => (
            <Button key={r} variant={roleFilter === r ? 'default' : 'ghost'} size="sm" onClick={() => setRoleFilter(r)}
              className={roleFilter === r ? 'bg-[#59ff00] text-black' : 'text-gray-400 hover:text-white capitalize'}>{r === 'all' ? 'All' : r}</Button>
          ))}
        </div>
        <Card className="bg-[#181818] border-[#2a2a2a]">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow className="border-[#2a2a2a] hover:bg-transparent"><TableHead className="text-gray-400">Name</TableHead><TableHead className="text-gray-400">Email</TableHead><TableHead className="text-gray-400">Phone</TableHead><TableHead className="text-gray-400">Role</TableHead><TableHead className="text-gray-400">Status</TableHead><TableHead className="text-gray-400">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {userList.map((u: any) => (
                    <TableRow key={u.id} className="border-[#2a2a2a] hover:bg-white/5">
                      <TableCell className="text-white text-sm">{u.name}</TableCell>
                      <TableCell className="text-gray-300 text-sm">{u.email}</TableCell>
                      <TableCell className="text-gray-300 text-sm">{u.phone || '-'}</TableCell>
                      <TableCell><Badge className="bg-[#59ff00]/20 text-[#59ff00] border-[#59ff00]/30 text-[10px]">{u.role?.roleName || '-'}</Badge></TableCell>
                      <TableCell><Badge className={`text-[10px] ${statusBadgeCls(u.status)}`}>{u.status}</Badge></TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => openEditUser(u)} className="text-blue-400 h-8 w-8 p-0"><Edit className="w-3.5 h-3.5" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteUser(u.id)} className="text-red-400 h-8 w-8 p-0"><Trash2 className="w-3.5 h-3.5" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {userList.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-gray-500 py-8">No users found</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        <Dialog open={userDialog} onOpenChange={setUserDialog}>
          <DialogContent className="bg-[#181818] border-[#2a2a2a] text-white max-w-md">
            <DialogHeader><DialogTitle>{editUser ? 'Edit User' : 'Add User'}</DialogTitle><DialogDescription>Fill in user details</DialogDescription></DialogHeader>
            <div className="space-y-3">
              <div><Label className="text-gray-400 text-xs">Name</Label><Input value={userForm.name} onChange={(e) => setUserForm(f => ({ ...f, name: e.target.value }))} className="bg-[#0b0b0b] border-[#2a2a2a] text-white" /></div>
              <div><Label className="text-gray-400 text-xs">Email</Label><Input value={userForm.email} onChange={(e) => setUserForm(f => ({ ...f, email: e.target.value }))} className="bg-[#0b0b0b] border-[#2a2a2a] text-white" /></div>
              <div><Label className="text-gray-400 text-xs">Phone</Label><Input value={userForm.phone} onChange={(e) => setUserForm(f => ({ ...f, phone: e.target.value }))} className="bg-[#0b0b0b] border-[#2a2a2a] text-white" /></div>
              <div><Label className="text-gray-400 text-xs">Password {editUser && '(leave blank to keep)'}</Label><Input type="password" value={userForm.password} onChange={(e) => setUserForm(f => ({ ...f, password: e.target.value }))} className="bg-[#0b0b0b] border-[#2a2a2a] text-white" /></div>
              <div><Label className="text-gray-400 text-xs">Role</Label>
                <Select value={userForm.roleId} onValueChange={(v) => setUserForm(f => ({ ...f, roleId: v }))}>
                  <SelectTrigger className="bg-[#0b0b0b] border-[#2a2a2a] text-white"><SelectValue placeholder="Select role" /></SelectTrigger>
                  <SelectContent className="bg-[#181818] border-[#2a2a2a]">
                    {roleList.map((r: any) => <SelectItem key={r.id} value={r.id} className="text-white capitalize">{r.roleName}</SelectItem>)}
                    {roleList.length === 0 && ['admin', 'manager', 'employee', 'customer'].map(r => <SelectItem key={r} value={r} className="text-white capitalize">{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label className="text-gray-400 text-xs">Status</Label>
                <Select value={userForm.status} onValueChange={(v) => setUserForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger className="bg-[#0b0b0b] border-[#2a2a2a] text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#181818] border-[#2a2a2a]"><SelectItem value="active" className="text-white">Active</SelectItem><SelectItem value="inactive" className="text-white">Inactive</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter><Button variant="ghost" onClick={() => setUserDialog(false)} className="text-gray-400">Cancel</Button><Button onClick={handleSaveUser} className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90">{editUser ? 'Update' : 'Create'}</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    )
  }

  // ─── Employees Tab ──────────────────────────────────────
  const renderEmployeesTab = () => {
    const openNewEmp = () => { setEditEmp(null); setEmpEditForm({ name: '', email: '', phone: '', password: '', department: '', designation: '', salary: '', joiningDate: '', status: 'active' }); setEmpEditDialog(true) }
    const openEditEmp = (e: any) => { setEditEmp(e); setEmpEditForm({ name: e.user?.name || '', email: e.user?.email || '', phone: e.user?.phone || '', password: '', department: e.department || '', designation: e.designation || '', salary: String(e.salary || ''), joiningDate: e.joiningDate ? new Date(e.joiningDate).toISOString().split('T')[0] : '', status: e.status || 'active' }); setEmpEditDialog(true) }

    const handleSaveEmp = async () => {
      try {
        if (editEmp) {
          const res = await fetch(`/api/employees/${editEmp.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ department: empEditForm.department, designation: empEditForm.designation, salary: Number(empEditForm.salary), status: empEditForm.status }) })
          const json = await res.json()
          if (json.status) { setEmpEditDialog(false); doFetchEmployees(); toast.success('Employee updated') } else { toast.error(json.message || 'Failed') }
        } else {
          const res = await fetch('/api/employees', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(empEditForm) })
          const json = await res.json()
          if (json.status) { setEmpEditDialog(false); doFetchEmployees(); toast.success('Employee created') } else { toast.error(json.message || 'Failed') }
        }
      } catch (e) { console.error(e); toast.error('Failed to save employee') }
    }

    const handleDeleteEmp = async (id: string) => {
      if (!confirm('Delete this employee?')) return
      try { await fetch(`/api/employees/${id}`, { method: 'DELETE' }); doFetchEmployees(); toast.success('Employee deleted') } catch (e) { toast.error('Failed') }
    }

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-white text-xl font-bold">Employees</h2>
          <Button onClick={openNewEmp} className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90 font-semibold"><Plus className="w-4 h-4 mr-1" /> Add Employee</Button>
        </div>
        <Card className="bg-[#181818] border-[#2a2a2a]">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow className="border-[#2a2a2a] hover:bg-transparent"><TableHead className="text-gray-400">Name</TableHead><TableHead className="text-gray-400">Department</TableHead><TableHead className="text-gray-400">Designation</TableHead><TableHead className="text-gray-400">Salary</TableHead><TableHead className="text-gray-400">Join Date</TableHead><TableHead className="text-gray-400">Status</TableHead><TableHead className="text-gray-400">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {employees.map((e: any) => (
                    <TableRow key={e.id} className="border-[#2a2a2a] hover:bg-white/5">
                      <TableCell className="text-white text-sm">{e.user?.name || '-'}</TableCell>
                      <TableCell className="text-gray-300 text-sm">{e.department}</TableCell>
                      <TableCell className="text-gray-300 text-sm">{e.designation}</TableCell>
                      <TableCell className="text-[#59ff00] text-sm font-semibold">{fmt(e.salary)}</TableCell>
                      <TableCell className="text-gray-400 text-sm">{fmtDate(e.joiningDate)}</TableCell>
                      <TableCell><Badge className={`text-[10px] ${statusBadgeCls(e.status)}`}>{e.status}</Badge></TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => openEditEmp(e)} className="text-blue-400 h-8 w-8 p-0"><Edit className="w-3.5 h-3.5" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteEmp(e.id)} className="text-red-400 h-8 w-8 p-0"><Trash2 className="w-3.5 h-3.5" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {employees.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-gray-500 py-8">No employees found</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        <Dialog open={empEditDialog} onOpenChange={setEmpEditDialog}>
          <DialogContent className="bg-[#181818] border-[#2a2a2a] text-white max-w-md">
            <DialogHeader><DialogTitle>{editEmp ? 'Edit Employee' : 'Add Employee'}</DialogTitle><DialogDescription>Fill in employee details</DialogDescription></DialogHeader>
            <div className="space-y-3">
              <div><Label className="text-gray-400 text-xs">Name</Label><Input value={empEditForm.name} onChange={(e) => setEmpEditForm(f => ({ ...f, name: e.target.value }))} disabled={!!editEmp} className="bg-[#0b0b0b] border-[#2a2a2a] text-white" /></div>
              <div><Label className="text-gray-400 text-xs">Email</Label><Input value={empEditForm.email} onChange={(e) => setEmpEditForm(f => ({ ...f, email: e.target.value }))} disabled={!!editEmp} className="bg-[#0b0b0b] border-[#2a2a2a] text-white" /></div>
              {!editEmp && <div><Label className="text-gray-400 text-xs">Password</Label><Input type="password" value={empEditForm.password} onChange={(e) => setEmpEditForm(f => ({ ...f, password: e.target.value }))} className="bg-[#0b0b0b] border-[#2a2a2a] text-white" /></div>}
              <div><Label className="text-gray-400 text-xs">Department</Label><Input value={empEditForm.department} onChange={(e) => setEmpEditForm(f => ({ ...f, department: e.target.value }))} className="bg-[#0b0b0b] border-[#2a2a2a] text-white" /></div>
              <div><Label className="text-gray-400 text-xs">Designation</Label><Input value={empEditForm.designation} onChange={(e) => setEmpEditForm(f => ({ ...f, designation: e.target.value }))} className="bg-[#0b0b0b] border-[#2a2a2a] text-white" /></div>
              <div><Label className="text-gray-400 text-xs">Salary</Label><Input type="number" value={empEditForm.salary} onChange={(e) => setEmpEditForm(f => ({ ...f, salary: e.target.value }))} className="bg-[#0b0b0b] border-[#2a2a2a] text-white" /></div>
              <div><Label className="text-gray-400 text-xs">Joining Date</Label><Input type="date" value={empEditForm.joiningDate} onChange={(e) => setEmpEditForm(f => ({ ...f, joiningDate: e.target.value }))} className="bg-[#0b0b0b] border-[#2a2a2a] text-white" /></div>
              {editEmp && <div><Label className="text-gray-400 text-xs">Status</Label><Select value={empEditForm.status} onValueChange={(v) => setEmpEditForm(f => ({ ...f, status: v }))}><SelectTrigger className="bg-[#0b0b0b] border-[#2a2a2a] text-white"><SelectValue /></SelectTrigger><SelectContent className="bg-[#181818] border-[#2a2a2a]"><SelectItem value="active" className="text-white">Active</SelectItem><SelectItem value="on_leave" className="text-white">On Leave</SelectItem><SelectItem value="terminated" className="text-white">Terminated</SelectItem></SelectContent></Select></div>}
            </div>
            <DialogFooter><Button variant="ghost" onClick={() => setEmpEditDialog(false)} className="text-gray-400">Cancel</Button><Button onClick={handleSaveEmp} className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90">{editEmp ? 'Update' : 'Create'}</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    )
  }

  // ─── Attendance Tab ─────────────────────────────────────
  const renderAttendanceTab = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <h2 className="text-white text-xl font-bold">Attendance</h2>
      <Card className="bg-[#181818] border-[#2a2a2a]">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow className="border-[#2a2a2a] hover:bg-transparent"><TableHead className="text-gray-400">Employee</TableHead><TableHead className="text-gray-400">Date</TableHead><TableHead className="text-gray-400">Check In</TableHead><TableHead className="text-gray-400">Check Out</TableHead><TableHead className="text-gray-400">Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {attendanceRecords.map((a: any) => (
                  <TableRow key={a.id} className="border-[#2a2a2a] hover:bg-white/5">
                    <TableCell className="text-white text-sm">{a.employee?.user?.name || '-'}</TableCell>
                    <TableCell className="text-gray-300 text-sm">{fmtDate(a.date)}</TableCell>
                    <TableCell className="text-gray-300 text-sm">{a.checkin ? new Date(a.checkin).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '-'}</TableCell>
                    <TableCell className="text-gray-300 text-sm">{a.checkout ? new Date(a.checkout).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '-'}</TableCell>
                    <TableCell><Badge className={`text-[10px] ${statusBadgeCls(a.status)}`}>{a.status}</Badge></TableCell>
                  </TableRow>
                ))}
                {attendanceRecords.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-gray-500 py-8">No attendance records</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  // ─── Leaves Tab ─────────────────────────────────────────
  const renderLeavesTab = () => {
    const handleLeaveAction = async (id: string, status: string) => {
      try { await fetch(`/api/leaves/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }); setLeaveFilter('all'); toast.success(`Leave ${status}`) } catch (e) { toast.error('Failed') }
    }

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <h2 className="text-white text-xl font-bold">Leave Requests</h2>
        <div className="flex gap-2">
          {['all', 'pending', 'approved', 'rejected'].map(s => (
            <Button key={s} variant={leaveFilter === s ? 'default' : 'ghost'} size="sm" onClick={() => setLeaveFilter(s)}
              className={leaveFilter === s ? 'bg-[#59ff00] text-black' : 'text-gray-400 capitalize'}>{s === 'all' ? 'All' : s}</Button>
          ))}
        </div>
        <Card className="bg-[#181818] border-[#2a2a2a]">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow className="border-[#2a2a2a] hover:bg-transparent"><TableHead className="text-gray-400">Employee</TableHead><TableHead className="text-gray-400">Type</TableHead><TableHead className="text-gray-400">From</TableHead><TableHead className="text-gray-400">To</TableHead><TableHead className="text-gray-400">Reason</TableHead><TableHead className="text-gray-400">Status</TableHead><TableHead className="text-gray-400">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {leaveList.map((l: any) => (
                    <TableRow key={l.id} className="border-[#2a2a2a] hover:bg-white/5">
                      <TableCell className="text-white text-sm">{l.employee?.user?.name || '-'}</TableCell>
                      <TableCell className="text-gray-300 text-sm capitalize">{l.type}</TableCell>
                      <TableCell className="text-gray-300 text-sm">{fmtDate(l.startDate)}</TableCell>
                      <TableCell className="text-gray-300 text-sm">{fmtDate(l.endDate)}</TableCell>
                      <TableCell className="text-gray-300 text-sm max-w-[200px] truncate">{l.reason || '-'}</TableCell>
                      <TableCell><Badge className={`text-[10px] ${l.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : l.status === 'rejected' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{l.status}</Badge></TableCell>
                      <TableCell>
                        {l.status === 'pending' && (
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => handleLeaveAction(l.id, 'approved')} className="text-emerald-400 h-8 px-2"><Check className="w-3.5 h-3.5" /></Button>
                            <Button size="sm" variant="ghost" onClick={() => handleLeaveAction(l.id, 'rejected')} className="text-red-400 h-8 px-2"><X className="w-3.5 h-3.5" /></Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {leaveList.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-gray-500 py-8">No leave requests</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  // ─── AMC Tab ────────────────────────────────────────────
  const renderAmcTab = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white text-xl font-bold">AMC Contracts</h2>
        <Button onClick={() => { setAmcForm({ customerId: '', plan: '', startDate: '', endDate: '', amount: '', coverage: '' }); setAmcDialog(true) }} className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90 font-semibold"><Plus className="w-4 h-4 mr-1" /> Add Contract</Button>
      </div>
      <Card className="bg-[#181818] border-[#2a2a2a]">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow className="border-[#2a2a2a] hover:bg-transparent"><TableHead className="text-gray-400">Customer</TableHead><TableHead className="text-gray-400">Plan</TableHead><TableHead className="text-gray-400">Amount</TableHead><TableHead className="text-gray-400">Start</TableHead><TableHead className="text-gray-400">End</TableHead><TableHead className="text-gray-400">Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {amcContracts.map((c: any) => (
                  <TableRow key={c.id} className="border-[#2a2a2a] hover:bg-white/5">
                    <TableCell className="text-white text-sm">{c.customer?.name || '-'}</TableCell>
                    <TableCell className="text-gray-300 text-sm">{c.plan}</TableCell>
                    <TableCell className="text-[#59ff00] text-sm font-semibold">{fmt(c.amount)}</TableCell>
                    <TableCell className="text-gray-400 text-sm">{fmtDate(c.startDate)}</TableCell>
                    <TableCell className="text-gray-400 text-sm">{fmtDate(c.endDate)}</TableCell>
                    <TableCell><Badge className={`text-[10px] ${statusBadgeCls(c.status)}`}>{c.status}</Badge></TableCell>
                  </TableRow>
                ))}
                {amcContracts.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-gray-500 py-8">No AMC contracts</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  // ─── Service Tab ────────────────────────────────────────
  const renderServiceTab = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white text-xl font-bold">Service Requests</h2>
        <Button onClick={() => { setServiceForm({ customerId: '', contractId: '', issue: '', priority: 'medium', assignedTechnician: '' }); setServiceDialog(true) }} className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90 font-semibold"><Plus className="w-4 h-4 mr-1" /> New Request</Button>
      </div>
      <Card className="bg-[#181818] border-[#2a2a2a]">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow className="border-[#2a2a2a] hover:bg-transparent"><TableHead className="text-gray-400">Customer</TableHead><TableHead className="text-gray-400">Issue</TableHead><TableHead className="text-gray-400">Priority</TableHead><TableHead className="text-gray-400">Assigned To</TableHead><TableHead className="text-gray-400">Status</TableHead><TableHead className="text-gray-400">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {serviceRequests.map((s: any) => (
                  <TableRow key={s.id} className="border-[#2a2a2a] hover:bg-white/5">
                    <TableCell className="text-white text-sm">{s.customer?.name || '-'}</TableCell>
                    <TableCell className="text-gray-300 text-sm max-w-[200px] truncate">{s.issue}</TableCell>
                    <TableCell><Badge className={`text-[10px] ${priorityBadge(s.priority)}`}>{s.priority}</Badge></TableCell>
                    <TableCell className="text-gray-300 text-sm">{s.technician?.name || '-'}</TableCell>
                    <TableCell><Badge className={`text-[10px] ${statusBadgeCls(s.status)}`}>{s.status.replace('_', ' ')}</Badge></TableCell>
                    <TableCell>
                      <Select onValueChange={(v) => handleUpdateServiceRequest(s.id, { status: v })}>
                        <SelectTrigger className="h-8 w-8 p-0 border-0 bg-transparent text-gray-400"><ChevronDown className="w-3.5 h-3.5" /></SelectTrigger>
                        <SelectContent className="bg-[#181818] border-[#2a2a2a]">
                          {['open', 'in_progress', 'resolved', 'closed'].map(st => <SelectItem key={st} value={st} className="text-white">{st.replace('_', ' ')}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
                {serviceRequests.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-gray-500 py-8">No service requests</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  // ─── Inquiries Tab ──────────────────────────────────────
  const renderInquiriesTab = () => {
    const updateInquiryStatus = async (id: string, status: string) => {
      try { await fetch('/api/inquiries', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ inquiryId: id, status }) }); setInquiryList(prev => prev.map(i => i.id === id ? { ...i, status } : i)); toast.success(`Inquiry marked as ${status}`) } catch (e) { toast.error('Failed') }
    }

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <h2 className="text-white text-xl font-bold">Inquiries</h2>
        <Card className="bg-[#181818] border-[#2a2a2a]">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow className="border-[#2a2a2a] hover:bg-transparent"><TableHead className="text-gray-400">Name</TableHead><TableHead className="text-gray-400">Email</TableHead><TableHead className="text-gray-400">Subject</TableHead><TableHead className="text-gray-400">Message</TableHead><TableHead className="text-gray-400">Date</TableHead><TableHead className="text-gray-400">Status</TableHead><TableHead className="text-gray-400">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {inquiryList.map((i: any) => (
                    <TableRow key={i.id} className="border-[#2a2a2a] hover:bg-white/5">
                      <TableCell className="text-white text-sm">{i.name}</TableCell>
                      <TableCell className="text-gray-300 text-sm">{i.email}</TableCell>
                      <TableCell className="text-gray-300 text-sm">{i.subject || '-'}</TableCell>
                      <TableCell className="text-gray-300 text-sm max-w-[200px] truncate">{i.message}</TableCell>
                      <TableCell className="text-gray-400 text-sm">{fmtDate(i.createdAt)}</TableCell>
                      <TableCell><Badge className={`text-[10px] ${i.status === 'new' ? 'bg-blue-500/20 text-blue-400' : i.status === 'read' ? 'bg-yellow-500/20 text-yellow-400' : i.status === 'replied' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}`}>{i.status}</Badge></TableCell>
                      <TableCell>
                        {i.status === 'new' && <Button size="sm" variant="ghost" onClick={() => updateInquiryStatus(i.id, 'read')} className="text-yellow-400 h-8 px-2 text-xs">Mark Read</Button>}
                        {i.status === 'read' && <Button size="sm" variant="ghost" onClick={() => updateInquiryStatus(i.id, 'replied')} className="text-emerald-400 h-8 px-2 text-xs">Mark Replied</Button>}
                      </TableCell>
                    </TableRow>
                  ))}
                  {inquiryList.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-gray-500 py-8">No inquiries</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  // ─── Settings Tab ───────────────────────────────────────
  const renderSettingsTab = () => {
    const handleSaveSettings = async () => {
      setSettingsLoading(true)
      try {
        const entries = Object.entries(settingsObj).map(([key, value]) => ({ key, value }))
        const res = await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ settings: entries }) })
        const json = await res.json()
        if (json.status) { toast.success('Settings saved') } else { toast.error('Failed to save settings') }
      } catch (e) { toast.error('Failed to save') } finally { setSettingsLoading(false) }
    }

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <h2 className="text-white text-xl font-bold">Company Settings</h2>
        <Card className="bg-[#181818] border-[#2a2a2a]">
          <CardContent className="p-6 space-y-4">
            <div><Label className="text-gray-400 text-xs">Company Name</Label><Input value={settingsObj.company_name || ''} onChange={(e) => setSettingsObj(s => ({ ...s, company_name: e.target.value }))} className="bg-[#0b0b0b] border-[#2a2a2a] text-white" /></div>
            <div><Label className="text-gray-400 text-xs">Email</Label><Input value={settingsObj.company_email || ''} onChange={(e) => setSettingsObj(s => ({ ...s, company_email: e.target.value }))} className="bg-[#0b0b0b] border-[#2a2a2a] text-white" /></div>
            <div><Label className="text-gray-400 text-xs">Phone</Label><Input value={settingsObj.company_phone || ''} onChange={(e) => setSettingsObj(s => ({ ...s, company_phone: e.target.value }))} className="bg-[#0b0b0b] border-[#2a2a2a] text-white" /></div>
            <div><Label className="text-gray-400 text-xs">Address</Label><Textarea value={settingsObj.company_address || ''} onChange={(e) => setSettingsObj(s => ({ ...s, company_address: e.target.value }))} className="bg-[#0b0b0b] border-[#2a2a2a] text-white" rows={3} /></div>
            <div><Label className="text-gray-400 text-xs">GST Number</Label><Input value={settingsObj.gst_number || ''} onChange={(e) => setSettingsObj(s => ({ ...s, gst_number: e.target.value }))} className="bg-[#0b0b0b] border-[#2a2a2a] text-white" /></div>
            <div><Label className="text-gray-400 text-xs">Currency</Label><Input value={settingsObj.currency || ''} onChange={(e) => setSettingsObj(s => ({ ...s, currency: e.target.value }))} className="bg-[#0b0b0b] border-[#2a2a2a] text-white" /></div>
            <Button onClick={handleSaveSettings} disabled={settingsLoading} className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90 font-semibold">{settingsLoading ? 'Saving...' : 'Save Settings'}</Button>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  // ─── Activity Tab ───────────────────────────────────────
  const renderActivityTab = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <h2 className="text-white text-xl font-bold">Recent Activity</h2>
      <Card className="bg-[#181818] border-[#2a2a2a]">
        <CardContent className="p-4">
          <div className="max-h-[600px] overflow-y-auto custom-scrollbar space-y-3">
            {activityList.map((a: any, i: number) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-[#0b0b0b] border border-[#2a2a2a]">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${a.type === 'order' ? 'bg-blue-500/10' : 'bg-purple-500/10'}`}>
                  {a.type === 'order' ? <ShoppingCart className="w-4 h-4 text-blue-400" /> : <Users className="w-4 h-4 text-purple-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm">{a.description}</p>
                  <p className="text-gray-500 text-xs mt-1">{fmtDate(a.date)}</p>
                </div>
                <Badge className={`text-[10px] ${a.type === 'order' ? orderBadge(a.status) : leadBadge(a.status)}`}>{a.status?.replace('_', ' ')}</Badge>
              </div>
            ))}
            {activityList.length === 0 && <p className="text-gray-500 text-sm text-center py-8">No recent activity</p>}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  // ─── Tab Router ─────────────────────────────────────────
  const renderTabContent = () => {
    switch (adminTab) {
      case 'dashboard': return renderDashboardTab()
      case 'products': return renderProductsTab()
      case 'categories': return renderCategoriesTab()
      case 'orders': return renderOrdersTab()
      case 'leads': return renderLeadsTab()
      case 'quotations': return renderQuotationsTab()
      case 'customers': return renderCustomersTab()
      case 'employees': return renderEmployeesTab()
      case 'attendance': return renderAttendanceTab()
      case 'leaves': return renderLeavesTab()
      case 'amc': return renderAmcTab()
      case 'service': return renderServiceTab()
      case 'inquiries': return renderInquiriesTab()
      case 'settings': return renderSettingsTab()
      case 'activity': return renderActivityTab()
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
          <nav className="flex-1 py-2 px-2 space-y-0.5 overflow-y-auto custom-scrollbar">
            {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => { setAdminTab(key); setMobileOpen(false) }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium
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
            <nav className="flex-1 py-2 px-2 space-y-0.5 overflow-y-auto custom-scrollbar">
              {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => { setAdminTab(key); setMobileOpen(false) }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium
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

      {/* Product Dialog (with image upload) */}
      <Dialog open={productDialog} onOpenChange={setProductDialog}>
        <DialogContent className="bg-[#181818] border-[#2a2a2a] text-white max-w-2xl max-h-[90vh] overflow-y-auto">
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

            {/* Image Upload */}
            <div className="space-y-1.5">
              <Label className="text-gray-300 text-sm">Featured Image</Label>
              <div className="flex items-start gap-3">
                {productForm.featuredImage ? (
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-[#2a2a2a] flex-shrink-0 group">
                    <Image src={productForm.featuredImage} alt="Preview" fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => setProductForm(p => ({ ...p, featuredImage: '' }))}
                      className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-lg border border-dashed border-[#2a2a2a] flex items-center justify-center flex-shrink-0">
                    <ImageIcon className="w-6 h-6 text-gray-600" />
                  </div>
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload(file)
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full bg-[#0b0b0b] border-[#2a2a2a] text-gray-300 hover:text-white hover:border-[#59ff00]/50"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Image
                      </>
                    )}
                  </Button>
                  <p className="text-gray-600 text-[10px] mt-1">JPG, PNG, WebP, GIF (max 5MB)</p>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-gray-300 text-sm">Short Description</Label>
              <Input className="bg-[#0b0b0b] border-[#2a2a2a] text-white" placeholder="Brief product description" value={productForm.shortDescription} onChange={(e) => setProductForm(p => ({ ...p, shortDescription: e.target.value }))} />
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
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-gray-300 text-sm">Dimensions</Label>
                <Input className="bg-[#0b0b0b] border-[#2a2a2a] text-white" placeholder="e.g. 600x400x850mm" value={productForm.dimensions} onChange={(e) => setProductForm(p => ({ ...p, dimensions: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-gray-300 text-sm">MOQ</Label>
                <Input type="number" className="bg-[#0b0b0b] border-[#2a2a2a] text-white" placeholder="Minimum order qty" value={productForm.moq} onChange={(e) => setProductForm(p => ({ ...p, moq: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-gray-300 text-sm">Lead Time</Label>
                <Input className="bg-[#0b0b0b] border-[#2a2a2a] text-white" placeholder="e.g. 2-3 weeks" value={productForm.leadTime} onChange={(e) => setProductForm(p => ({ ...p, leadTime: e.target.value }))} />
              </div>
              <div className="space-y-1.5 flex items-end">
                <div className="flex items-center gap-2 pb-1">
                  <Switch
                    checked={productForm.featured}
                    onCheckedChange={(checked) => setProductForm(p => ({ ...p, featured: checked }))}
                  />
                  <Label className="text-gray-300 text-sm">Featured</Label>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Size / Variants Section ──────────────────────── */}
          <div className="mt-5 border-t border-[#2a2a2a] pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white text-sm font-semibold flex items-center gap-2">
                <Package className="w-4 h-4 text-[#59ff00]" />
                Size / Variants
              </h3>
              <Button
                type="button"
                size="sm"
                className="bg-[#59ff00]/10 text-[#59ff00] hover:bg-[#59ff00]/20 border border-[#59ff00]/30 font-semibold"
                onClick={() => {
                  setProductVariants(prev => [
                    ...prev,
                    { ...emptyVariantForm, sortOrder: prev.length, name: `Variant ${prev.length + 1}` },
                  ])
                }}
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Variant
              </Button>
            </div>

            {productVariants.length === 0 ? (
              <div className="text-center py-6 rounded-lg border border-dashed border-[#2a2a2a]">
                <Package className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No variants added yet</p>
                <p className="text-gray-600 text-xs">Click "Add Variant" to create size/variant options</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                {productVariants.map((v, idx) => (
                  <div
                    key={idx}
                    className="bg-[#0b0b0b] border border-[#2a2a2a] rounded-lg p-3 hover:border-[#59ff00]/20 transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-1 grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <Label className="text-gray-500 text-[10px] uppercase tracking-wider">Name</Label>
                          <Input
                            className="bg-[#181818] border-[#2a2a2a] text-white h-8 text-sm"
                            placeholder="e.g. Small"
                            value={v.name}
                            onChange={(e) => {
                              const updated = [...productVariants]
                              updated[idx] = { ...updated[idx], name: e.target.value }
                              setProductVariants(updated)
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-gray-500 text-[10px] uppercase tracking-wider">Price (₹)</Label>
                          <Input
                            type="number"
                            className="bg-[#181818] border-[#2a2a2a] text-white h-8 text-sm"
                            placeholder="0"
                            value={v.price}
                            onChange={(e) => {
                              const updated = [...productVariants]
                              updated[idx] = { ...updated[idx], price: e.target.value }
                              setProductVariants(updated)
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-gray-500 text-[10px] uppercase tracking-wider">Stock</Label>
                          <Input
                            type="number"
                            className="bg-[#181818] border-[#2a2a2a] text-white h-8 text-sm"
                            placeholder="0"
                            value={v.stock}
                            onChange={(e) => {
                              const updated = [...productVariants]
                              updated[idx] = { ...updated[idx], stock: e.target.value }
                              setProductVariants(updated)
                            }}
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 w-8 p-0 mt-4"
                        onClick={() => {
                          setProductVariants(prev => prev.filter((_, i) => i !== idx))
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <div className="flex items-start gap-2 mt-2">
                      <div className="flex-1 grid grid-cols-4 gap-2">
                        <div className="space-y-1">
                          <Label className="text-gray-500 text-[10px] uppercase tracking-wider">SKU</Label>
                          <Input
                            className="bg-[#181818] border-[#2a2a2a] text-white h-8 text-sm"
                            placeholder="SKU"
                            value={v.sku}
                            onChange={(e) => {
                              const updated = [...productVariants]
                              updated[idx] = { ...updated[idx], sku: e.target.value }
                              setProductVariants(updated)
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-gray-500 text-[10px] uppercase tracking-wider">Weight</Label>
                          <Input
                            className="bg-[#181818] border-[#2a2a2a] text-white h-8 text-sm"
                            placeholder="e.g. 5kg"
                            value={v.weight}
                            onChange={(e) => {
                              const updated = [...productVariants]
                              updated[idx] = { ...updated[idx], weight: e.target.value }
                              setProductVariants(updated)
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-gray-500 text-[10px] uppercase tracking-wider">Dimensions</Label>
                          <Input
                            className="bg-[#181818] border-[#2a2a2a] text-white h-8 text-sm"
                            placeholder="e.g. 600x400"
                            value={v.dimensions}
                            onChange={(e) => {
                              const updated = [...productVariants]
                              updated[idx] = { ...updated[idx], dimensions: e.target.value }
                              setProductVariants(updated)
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-gray-500 text-[10px] uppercase tracking-wider">Sort</Label>
                          <Input
                            type="number"
                            className="bg-[#181818] border-[#2a2a2a] text-white h-8 text-sm"
                            value={v.sortOrder}
                            onChange={(e) => {
                              const updated = [...productVariants]
                              updated[idx] = { ...updated[idx], sortOrder: parseInt(e.target.value) || 0 }
                              setProductVariants(updated)
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Switch
                        checked={v.isDefault}
                        onCheckedChange={(checked) => {
                          const updated = productVariants.map((variant, i) => ({
                            ...variant,
                            isDefault: i === idx ? checked : false,
                          }))
                          setProductVariants(updated)
                        }}
                      />
                      <Label className="text-gray-400 text-xs">Default variant</Label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter className="mt-4">
            <Button variant="ghost" onClick={() => setProductDialog(false)} className="text-gray-400 hover:text-white">Cancel</Button>
            <Button onClick={handleSaveProduct} className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90 font-semibold">{editProduct ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={categoryDialog} onOpenChange={setCategoryDialog}>
        <DialogContent className="bg-[#181818] border-[#2a2a2a] text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">{editCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
            <DialogDescription className="text-gray-400">Fill in the category details below.</DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="bg-[#0b0b0b] border border-[#2a2a2a] w-full">
              <TabsTrigger value="general" className="data-[state=active]:bg-[#59ff00]/10 data-[state=active]:text-[#59ff00] flex-1">General</TabsTrigger>
              <TabsTrigger value="images" className="data-[state=active]:bg-[#59ff00]/10 data-[state=active]:text-[#59ff00] flex-1">Images</TabsTrigger>
              <TabsTrigger value="seo" className="data-[state=active]:bg-[#59ff00]/10 data-[state=active]:text-[#59ff00] flex-1">SEO</TabsTrigger>
            </TabsList>
            <TabsContent value="general" className="space-y-3 mt-3">
              <div className="space-y-1.5">
                <Label className="text-gray-300 text-sm">Name *</Label>
                <Input className="bg-[#0b0b0b] border-[#2a2a2a] text-white" placeholder="Category name" value={categoryForm.name} onChange={(e) => setCategoryForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-gray-300 text-sm">Slug</Label>
                <Input className="bg-[#0b0b0b] border-[#2a2a2a] text-white" placeholder="auto-generated from name" value={categoryForm.slug} onChange={(e) => setCategoryForm(p => ({ ...p, slug: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-gray-300 text-sm">Parent Category</Label>
                <Select value={categoryForm.parentId} onValueChange={(v) => setCategoryForm(p => ({ ...p, parentId: v }))}>
                  <SelectTrigger className="bg-[#0b0b0b] border-[#2a2a2a] text-white"><SelectValue placeholder="None (Top Level)" /></SelectTrigger>
                  <SelectContent className="bg-[#181818] border-[#2a2a2a]">
                    <SelectItem value="none" className="text-white focus:bg-[#59ff00]/10 focus:text-[#59ff00]">None (Top Level)</SelectItem>
                    {categories
                      .filter((c: any) => c.id !== editCategory?.id)
                      .map((c: any) => (
                        <SelectItem key={c.id} value={c.id} className="text-white focus:bg-[#59ff00]/10 focus:text-[#59ff00]">{c.name}</SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-gray-300 text-sm">Description</Label>
                <Textarea className="bg-[#0b0b0b] border-[#2a2a2a] text-white" rows={3} placeholder="Category description..." value={categoryForm.description} onChange={(e) => setCategoryForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-gray-300 text-sm">Status</Label>
                  <Select value={categoryForm.status} onValueChange={(v) => setCategoryForm(p => ({ ...p, status: v }))}>
                    <SelectTrigger className="bg-[#0b0b0b] border-[#2a2a2a] text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#181818] border-[#2a2a2a]">
                      <SelectItem value="active" className="text-white focus:bg-[#59ff00]/10 focus:text-[#59ff00]">Active</SelectItem>
                      <SelectItem value="draft" className="text-white focus:bg-[#59ff00]/10 focus:text-[#59ff00]">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-gray-300 text-sm">Display Type</Label>
                  <Select value={categoryForm.displayType} onValueChange={(v) => setCategoryForm(p => ({ ...p, displayType: v }))}>
                    <SelectTrigger className="bg-[#0b0b0b] border-[#2a2a2a] text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#181818] border-[#2a2a2a]">
                      <SelectItem value="products" className="text-white focus:bg-[#59ff00]/10 focus:text-[#59ff00]">Products</SelectItem>
                      <SelectItem value="subcategories" className="text-white focus:bg-[#59ff00]/10 focus:text-[#59ff00]">Subcategories</SelectItem>
                      <SelectItem value="both" className="text-white focus:bg-[#59ff00]/10 focus:text-[#59ff00]">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-gray-300 text-sm">Menu Order</Label>
                  <Input type="number" className="bg-[#0b0b0b] border-[#2a2a2a] text-white" value={categoryForm.menuOrder} onChange={(e) => setCategoryForm(p => ({ ...p, menuOrder: e.target.value }))} />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="images" className="space-y-3 mt-3">
              <div className="space-y-1.5">
                <Label className="text-gray-300 text-sm">Image URL</Label>
                <Input className="bg-[#0b0b0b] border-[#2a2a2a] text-white" placeholder="/uploads/image.jpg" value={categoryForm.image} onChange={(e) => setCategoryForm(p => ({ ...p, image: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-gray-300 text-sm">Thumbnail URL</Label>
                <Input className="bg-[#0b0b0b] border-[#2a2a2a] text-white" placeholder="/uploads/thumbnail.jpg" value={categoryForm.thumbnail} onChange={(e) => setCategoryForm(p => ({ ...p, thumbnail: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-gray-300 text-sm">Banner Image URL</Label>
                <Input className="bg-[#0b0b0b] border-[#2a2a2a] text-white" placeholder="/uploads/banner.jpg" value={categoryForm.bannerImage} onChange={(e) => setCategoryForm(p => ({ ...p, bannerImage: e.target.value }))} />
              </div>
            </TabsContent>
            <TabsContent value="seo" className="space-y-3 mt-3">
              <div className="space-y-1.5">
                <Label className="text-gray-300 text-sm">SEO Title</Label>
                <Input className="bg-[#0b0b0b] border-[#2a2a2a] text-white" placeholder="SEO title for search engines" value={categoryForm.seoTitle} onChange={(e) => setCategoryForm(p => ({ ...p, seoTitle: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-gray-300 text-sm">SEO Description</Label>
                <Textarea className="bg-[#0b0b0b] border-[#2a2a2a] text-white" rows={3} placeholder="Meta description for search engines..." value={categoryForm.seoDescription} onChange={(e) => setCategoryForm(p => ({ ...p, seoDescription: e.target.value }))} />
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter className="mt-4">
            <Button variant="ghost" onClick={() => setCategoryDialog(false)} className="text-gray-400 hover:text-white">Cancel</Button>
            <Button onClick={handleSaveCategory} className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90 font-semibold">{editCategory ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Category Confirmation Dialog */}
      <Dialog open={deleteCategoryDialog} onOpenChange={setDeleteCategoryDialog}>
        <DialogContent className="bg-[#181818] border-[#2a2a2a] text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white">Delete Category</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete &quot;{categoryToDelete?.name}&quot;? This action cannot be undone.
              {(categoryToDelete?._count?.products || 0) > 0 && (
                <span className="block mt-2 text-red-400 text-xs">
                  This category has {categoryToDelete._count.products} product(s). Remove or reassign them first.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setDeleteCategoryDialog(false); setCategoryToDelete(null) }} className="text-gray-400 hover:text-white">Cancel</Button>
            <Button
              onClick={() => categoryToDelete && handleDeleteCategory(categoryToDelete.id)}
              className="bg-red-500 text-white hover:bg-red-600 font-semibold"
              disabled={(categoryToDelete?._count?.products || 0) > 0}
            >
              Delete
            </Button>
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
              <Button onClick={() => {
                setQuotationCustomerName(selectedLead?.name || '')
                setQuotationCustomerCompany(selectedLead?.company || '')
                setQuotationCustomerEmail(selectedLead?.email || '')
                setQuotationCustomerPhone(selectedLead?.phone || '')
                setQuotationCustomerAddress(selectedLead?.city ? `${selectedLead.city}, India` : '')
                setQuotationCustomerGst('')
                setQuotationAmount('')
                setQuotationItems([{ desc: '', hsn: '', qty: '1', unit: 'Nos', rate: '', discount: '0', gstPercent: '18' }])
                setQuotationValidUntil('')
                setQuotationNotes('')
                setQuotationDeliveryPeriod('2-3 weeks')
                setQuotationInstallation('Included')
                setQuotationWarranty('12 months against manufacturing defects')
                setQuotationDialog(true)
              }} className="w-full bg-[#59ff00]/10 text-[#59ff00] hover:bg-[#59ff00]/20 border border-[#59ff00]/30 font-semibold">
                <FileText className="w-4 h-4 mr-2" /> Create Quotation
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Quotation Dialog */}
      <Dialog open={quotationDialog} onOpenChange={setQuotationDialog}>
        <DialogContent className="bg-[#181818] border-[#2a2a2a] text-white max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Create Quotation</DialogTitle>
            <DialogDescription className="text-gray-400">{selectedLead ? `For ${selectedLead.name}` : 'Fill in the details below'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Customer Details */}
            <div>
              <h3 className="text-[#59ff00] text-sm font-semibold mb-2">Customer Details</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label className="text-gray-400 text-xs">Name *</Label><Input className="bg-[#0b0b0b] border-[#2a2a2a] text-white h-9 text-sm" value={quotationCustomerName} onChange={e => setQuotationCustomerName(e.target.value)} placeholder="Customer name" /></div>
                <div className="space-y-1"><Label className="text-gray-400 text-xs">Company</Label><Input className="bg-[#0b0b0b] border-[#2a2a2a] text-white h-9 text-sm" value={quotationCustomerCompany} onChange={e => setQuotationCustomerCompany(e.target.value)} placeholder="Company name" /></div>
                <div className="space-y-1"><Label className="text-gray-400 text-xs">Email</Label><Input className="bg-[#0b0b0b] border-[#2a2a2a] text-white h-9 text-sm" value={quotationCustomerEmail} onChange={e => setQuotationCustomerEmail(e.target.value)} placeholder="customer@email.com" /></div>
                <div className="space-y-1"><Label className="text-gray-400 text-xs">Phone</Label><Input className="bg-[#0b0b0b] border-[#2a2a2a] text-white h-9 text-sm" value={quotationCustomerPhone} onChange={e => setQuotationCustomerPhone(e.target.value)} placeholder="+91-XXXXXXXXXX" /></div>
                <div className="space-y-1"><Label className="text-gray-400 text-xs">Address</Label><Input className="bg-[#0b0b0b] border-[#2a2a2a] text-white h-9 text-sm" value={quotationCustomerAddress} onChange={e => setQuotationCustomerAddress(e.target.value)} placeholder="Full address" /></div>
                <div className="space-y-1"><Label className="text-gray-400 text-xs">GSTIN</Label><Input className="bg-[#0b0b0b] border-[#2a2a2a] text-white h-9 text-sm" value={quotationCustomerGst} onChange={e => setQuotationCustomerGst(e.target.value)} placeholder="GST number" /></div>
              </div>
            </div>

            <Separator className="bg-[#2a2a2a]" />

            {/* Line Items */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[#59ff00] text-sm font-semibold">Line Items</h3>
                <Button variant="ghost" size="sm" onClick={() => setQuotationItems([...quotationItems, { desc: '', hsn: '', qty: '1', unit: 'Nos', rate: '', discount: '0', gstPercent: '18' }])} className="text-[#59ff00] hover:bg-[#59ff00]/10 h-7 text-xs">
                  <Plus className="w-3 h-3 mr-1" /> Add Item
                </Button>
              </div>
              <div className="space-y-2">
                {quotationItems.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-end bg-[#0b0b0b] border border-[#2a2a2a] rounded-lg p-2">
                    <div className="col-span-4 space-y-0.5"><Label className="text-gray-500 text-[10px]">Description</Label><Input className="bg-[#181818] border-[#2a2a2a] text-white h-8 text-xs" value={item.desc} onChange={e => { const n = [...quotationItems]; n[idx] = { ...n[idx], desc: e.target.value }; setQuotationItems(n) }} placeholder="Product / Service" /></div>
                    <div className="col-span-1 space-y-0.5"><Label className="text-gray-500 text-[10px]">HSN</Label><Input className="bg-[#181818] border-[#2a2a2a] text-white h-8 text-xs" value={item.hsn} onChange={e => { const n = [...quotationItems]; n[idx] = { ...n[idx], hsn: e.target.value }; setQuotationItems(n) }} placeholder="8419" /></div>
                    <div className="col-span-1 space-y-0.5"><Label className="text-gray-500 text-[10px]">Qty</Label><Input type="number" className="bg-[#181818] border-[#2a2a2a] text-white h-8 text-xs" value={item.qty} onChange={e => { const n = [...quotationItems]; n[idx] = { ...n[idx], qty: e.target.value }; setQuotationItems(n) }} /></div>
                    <div className="col-span-1 space-y-0.5"><Label className="text-gray-500 text-[10px]">Unit</Label><Input className="bg-[#181818] border-[#2a2a2a] text-white h-8 text-xs" value={item.unit} onChange={e => { const n = [...quotationItems]; n[idx] = { ...n[idx], unit: e.target.value }; setQuotationItems(n) }} /></div>
                    <div className="col-span-2 space-y-0.5"><Label className="text-gray-500 text-[10px]">Rate (₹)</Label><Input type="number" className="bg-[#181818] border-[#2a2a2a] text-white h-8 text-xs" value={item.rate} onChange={e => { const n = [...quotationItems]; n[idx] = { ...n[idx], rate: e.target.value }; setQuotationItems(n) }} placeholder="0" /></div>
                    <div className="col-span-1 space-y-0.5"><Label className="text-gray-500 text-[10px]">Disc%</Label><Input type="number" className="bg-[#181818] border-[#2a2a2a] text-white h-8 text-xs" value={item.discount} onChange={e => { const n = [...quotationItems]; n[idx] = { ...n[idx], discount: e.target.value }; setQuotationItems(n) }} /></div>
                    <div className="col-span-1 space-y-0.5"><Label className="text-gray-500 text-[10px]">GST%</Label><Input type="number" className="bg-[#181818] border-[#2a2a2a] text-white h-8 text-xs" value={item.gstPercent} onChange={e => { const n = [...quotationItems]; n[idx] = { ...n[idx], gstPercent: e.target.value }; setQuotationItems(n) }} /></div>
                    <div className="col-span-1 flex items-center justify-center">
                      <Button variant="ghost" size="sm" onClick={() => setQuotationItems(quotationItems.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 w-8 p-0" disabled={quotationItems.length <= 1}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              {(() => {
                const t = computeQuotationTotals()
                return (
                  <div className="flex justify-end mt-3">
                    <div className="w-72 bg-[#0b0b0b] border border-[#2a2a2a] rounded-lg p-3 space-y-1.5">
                      <div className="flex justify-between text-xs"><span className="text-gray-400">Subtotal</span><span className="text-gray-300">{fmt(t.subtotal)}</span></div>
                      {t.totalDiscount > 0 && <div className="flex justify-between text-xs"><span className="text-gray-400">Discount</span><span className="text-red-400">-{fmt(t.totalDiscount)}</span></div>}
                      <div className="flex justify-between text-xs"><span className="text-gray-400">CGST (50%)</span><span className="text-gray-300">{fmt(t.cgst)}</span></div>
                      <div className="flex justify-between text-xs"><span className="text-gray-400">SGST (50%)</span><span className="text-gray-300">{fmt(t.sgst)}</span></div>
                      <div className="flex justify-between text-xs"><span className="text-gray-400">Total GST</span><span className="text-gray-300">{fmt(t.totalGst)}</span></div>
                      <div className="flex justify-between text-sm pt-2 border-t border-[#2a2a2a]"><span className="text-white font-bold">Grand Total</span><span className="text-[#59ff00] font-bold">{fmt(t.grandTotal)}</span></div>
                    </div>
                  </div>
                )
              })()}
            </div>

            <Separator className="bg-[#2a2a2a]" />

            {/* Additional Details */}
            <div>
              <h3 className="text-[#59ff00] text-sm font-semibold mb-2">Additional Details</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1"><Label className="text-gray-400 text-xs">Valid Until</Label><Input type="date" className="bg-[#0b0b0b] border-[#2a2a2a] text-white h-9 text-sm" value={quotationValidUntil} onChange={e => setQuotationValidUntil(e.target.value)} /></div>
                <div className="space-y-1"><Label className="text-gray-400 text-xs">Delivery Period</Label><Input className="bg-[#0b0b0b] border-[#2a2a2a] text-white h-9 text-sm" value={quotationDeliveryPeriod} onChange={e => setQuotationDeliveryPeriod(e.target.value)} /></div>
                <div className="space-y-1"><Label className="text-gray-400 text-xs">Installation</Label><Input className="bg-[#0b0b0b] border-[#2a2a2a] text-white h-9 text-sm" value={quotationInstallation} onChange={e => setQuotationInstallation(e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="space-y-1"><Label className="text-gray-400 text-xs">Warranty</Label><Input className="bg-[#0b0b0b] border-[#2a2a2a] text-white h-9 text-sm" value={quotationWarranty} onChange={e => setQuotationWarranty(e.target.value)} /></div>
                <div className="space-y-1"><Label className="text-gray-400 text-xs">Internal Notes</Label><Input className="bg-[#0b0b0b] border-[#2a2a2a] text-white h-9 text-sm" value={quotationNotes} onChange={e => setQuotationNotes(e.target.value)} placeholder="Notes (not shown to customer)" /></div>
              </div>
            </div>
          </div>
          <DialogFooter className="mt-4 gap-2">
            <Button variant="ghost" onClick={() => setQuotationDialog(false)} className="text-gray-400 hover:text-white">Cancel</Button>
            <Button onClick={handleSaveQuotation} className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90 font-semibold">
              <FileText className="w-4 h-4 mr-2" /> Create Quotation
            </Button>
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
            <div className="space-y-1.5"><Label className="text-gray-300 text-sm">Name *</Label><Input className="bg-[#0b0b0b] border-[#2a2a2a] text-white" value={employeeForm.name} onChange={(e) => setEmployeeForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-gray-300 text-sm">Email *</Label><Input type="email" className="bg-[#0b0b0b] border-[#2a2a2a] text-white" value={employeeForm.email} onChange={(e) => setEmployeeForm(p => ({ ...p, email: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label className="text-gray-300 text-sm">Phone</Label><Input className="bg-[#0b0b0b] border-[#2a2a2a] text-white" value={employeeForm.phone} onChange={(e) => setEmployeeForm(p => ({ ...p, phone: e.target.value }))} /></div>
            </div>
            <div className="space-y-1.5"><Label className="text-gray-300 text-sm">Password *</Label><Input type="password" className="bg-[#0b0b0b] border-[#2a2a2a] text-white" value={employeeForm.password} onChange={(e) => setEmployeeForm(p => ({ ...p, password: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-gray-300 text-sm">Department</Label><Input className="bg-[#0b0b0b] border-[#2a2a2a] text-white" value={employeeForm.department} onChange={(e) => setEmployeeForm(p => ({ ...p, department: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label className="text-gray-300 text-sm">Designation</Label><Input className="bg-[#0b0b0b] border-[#2a2a2a] text-white" value={employeeForm.designation} onChange={(e) => setEmployeeForm(p => ({ ...p, designation: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-gray-300 text-sm">Salary</Label><Input type="number" className="bg-[#0b0b0b] border-[#2a2a2a] text-white" value={employeeForm.salary} onChange={(e) => setEmployeeForm(p => ({ ...p, salary: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label className="text-gray-300 text-sm">Joining Date</Label><Input type="date" className="bg-[#0b0b0b] border-[#2a2a2a] text-white" value={employeeForm.joiningDate} onChange={(e) => setEmployeeForm(p => ({ ...p, joiningDate: e.target.value }))} /></div>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="ghost" onClick={() => setEmployeeDialog(false)} className="text-gray-400 hover:text-white">Cancel</Button>
            <Button onClick={handleSaveEmployee} className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90 font-semibold">Create Employee</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AMC Dialog */}
      <Dialog open={amcDialog} onOpenChange={setAmcDialog}>
        <DialogContent className="bg-[#181818] border-[#2a2a2a] text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Add AMC Contract</DialogTitle>
            <DialogDescription className="text-gray-400">Enter contract details</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label className="text-gray-300 text-sm">Customer ID *</Label><Input className="bg-[#0b0b0b] border-[#2a2a2a] text-white" value={amcForm.customerId} onChange={(e) => setAmcForm(p => ({ ...p, customerId: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label className="text-gray-300 text-sm">Plan</Label><Input className="bg-[#0b0b0b] border-[#2a2a2a] text-white" value={amcForm.plan} onChange={(e) => setAmcForm(p => ({ ...p, plan: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-gray-300 text-sm">Start Date</Label><Input type="date" className="bg-[#0b0b0b] border-[#2a2a2a] text-white" value={amcForm.startDate} onChange={(e) => setAmcForm(p => ({ ...p, startDate: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label className="text-gray-300 text-sm">End Date</Label><Input type="date" className="bg-[#0b0b0b] border-[#2a2a2a] text-white" value={amcForm.endDate} onChange={(e) => setAmcForm(p => ({ ...p, endDate: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-gray-300 text-sm">Amount</Label><Input type="number" className="bg-[#0b0b0b] border-[#2a2a2a] text-white" value={amcForm.amount} onChange={(e) => setAmcForm(p => ({ ...p, amount: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label className="text-gray-300 text-sm">Coverage</Label><Input className="bg-[#0b0b0b] border-[#2a2a2a] text-white" value={amcForm.coverage} onChange={(e) => setAmcForm(p => ({ ...p, coverage: e.target.value }))} /></div>
            </div>
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
            <div className="space-y-1.5"><Label className="text-gray-300 text-sm">Customer ID *</Label><Input className="bg-[#0b0b0b] border-[#2a2a2a] text-white" value={serviceForm.customerId} onChange={(e) => setServiceForm(p => ({ ...p, customerId: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label className="text-gray-300 text-sm">Contract ID</Label><Input className="bg-[#0b0b0b] border-[#2a2a2a] text-white" value={serviceForm.contractId} onChange={(e) => setServiceForm(p => ({ ...p, contractId: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label className="text-gray-300 text-sm">Issue *</Label><Textarea className="bg-[#0b0b0b] border-[#2a2a2a] text-white" rows={3} value={serviceForm.issue} onChange={(e) => setServiceForm(p => ({ ...p, issue: e.target.value }))} /></div>
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
              <div className="space-y-1.5"><Label className="text-gray-300 text-sm">Assigned Technician</Label><Input className="bg-[#0b0b0b] border-[#2a2a2a] text-white" value={serviceForm.assignedTechnician} onChange={(e) => setServiceForm(p => ({ ...p, assignedTechnician: e.target.value }))} /></div>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="ghost" onClick={() => setServiceDialog(false)} className="text-gray-400 hover:text-white">Cancel</Button>
            <Button onClick={handleSaveServiceRequest} className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90 font-semibold">Create Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
