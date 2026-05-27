import React from 'react'
import {
  LayoutDashboard, Package, ShoppingCart, Users, UserCog, Shield,
  Settings, Grid3X3, Clock, CalendarDays, FileText, Wrench,
  Eye, ChevronDown, Plus, Edit, Trash2, Check, X,
  TrendingUp, AlertTriangle, IndianRupee,
  BarChart3, PieChart as PieChartIcon, Target, Kanban, CalendarCheck,
  ClipboardList, Import, MessagesSquare, Link2, MailOpen, MailPlus,
  DollarSign, Receipt, CreditCard, CalendarRange, Briefcase,
  Network, Award, Banknote, Wallet, UserPlus, BriefcaseMedical,
  Mic, Star, GraduationCap, PartyPopper, Bell, Monitor,
  FolderOpen, Clock4, UsersRound, Lock, Gauge,
  Filter, Megaphone, Webhook, FormInput, Database,
  TrendingDown, Timer, CalendarClock, FileSpreadsheet,
  ArrowRight, LayoutGrid, Send, Zap,
  // Also import PieChart under its original name for re-export
  PieChart,
} from 'lucide-react'
import type { AdminTab } from '@/lib/store'

// ─── Constants ──────────────────────────────────────────────
export const NEON = '#59ff00'
export const CHART_COLORS = ['#59ff00', '#00b4d8', '#f77f00', '#d62828', '#7209b7', '#4cc9f0']

// ─── Sidebar Navigation Types ────────────────────────────────
export interface SidebarItem {
  key: AdminTab
  label: string
  icon: React.ElementType
}

export interface SidebarSection {
  label: string
  items: SidebarItem[]
}

export interface SidebarGroup {
  id: string
  label: string
  icon: React.ElementType
  sections: SidebarSection[]
}

// ─── Form Types ────────────────────────────────────────────
export interface ProductForm {
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

export interface CategoryForm {
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

export interface VariantForm {
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

export interface QuotationItem {
  desc: string
  hsn: string
  qty: string
  unit: string
  rate: string
  discount: string
  gstPercent: string
}

// ─── Empty Forms ───────────────────────────────────────────
export const emptyProductForm: ProductForm = {
  name: '', categoryId: '', description: '', shortDescription: '', price: '',
  stock: '', status: 'active', steelGrade: '', capacity: '', dimensions: '',
  moq: '', leadTime: '', featuredImage: '', featured: false,
}

export const emptyCategoryForm: CategoryForm = {
  name: '', slug: '', image: '', parentId: '',
  description: '', displayType: 'products', menuOrder: '0',
  thumbnail: '', bannerImage: '', seoTitle: '', seoDescription: '',
  status: 'active',
}

export const emptyVariantForm: VariantForm = {
  name: '', sku: '', price: '', stock: '',
  weight: '', dimensions: '', isDefault: false, sortOrder: 0,
}

// ─── Sidebar Navigation Structure ──────────────────────────
export const MAIN_NAV_ITEMS: SidebarItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'products', label: 'Products', icon: Package },
  { key: 'categories', label: 'Categories', icon: Grid3X3 },
  { key: 'orders', label: 'Order Management', icon: ShoppingCart },
  { key: 'amc', label: 'AMC', icon: Shield },
  { key: 'service', label: 'Service', icon: Wrench },
  { key: 'settings', label: 'Settings', icon: Settings },
  { key: 'activity', label: 'Activity', icon: AlertTriangle },
]

export const CRM_GROUP: SidebarGroup = {
  id: 'crm',
  label: 'CRM',
  icon: PieChartIcon,
  sections: [
    {
      label: '',
      items: [
        { key: 'crm-dashboard', label: 'CRM Dashboard', icon: Gauge },
        { key: 'leads', label: 'All Leads', icon: Users },
        { key: 'quotations', label: 'Quotations', icon: FileText },
        { key: 'customers', label: 'Customers', icon: UserCog },
        { key: 'orders', label: 'Orders', icon: ShoppingCart },
        { key: 'inquiries', label: 'Inquiries', icon: ClipboardList },
        { key: 'crm-companies', label: 'Companies', icon: Network },
        { key: 'crm-pipelines', label: 'Pipelines', icon: Target },
        { key: 'crm-pipeline', label: 'Pipeline', icon: Filter },
      ],
    },
  ],
}

export const HRM_GROUP: SidebarGroup = {
  id: 'hrm',
  label: 'HRM',
  icon: Briefcase,
  sections: [
    {
      label: '',
      items: [
        { key: 'hrm-dashboard', label: 'HR Dashboard', icon: Gauge },
        { key: 'employees', label: 'Employees', icon: UserCog },
        { key: 'attendance', label: 'Attendance', icon: Clock },
        { key: 'leaves', label: 'Leaves', icon: CalendarDays },
        { key: 'hrm-departments', label: 'Departments', icon: Network },
        { key: 'hrm-designations', label: 'Designations', icon: Award },
        { key: 'hrm-payroll', label: 'Payroll', icon: Banknote },
        { key: 'hrm-salary-slips', label: 'Salary Slips', icon: Wallet },
        { key: 'hrm-recruitment', label: 'Recruitment', icon: UserPlus },
        { key: 'hrm-job-openings', label: 'Job Openings', icon: BriefcaseMedical },
        { key: 'hrm-interviews', label: 'Interviews', icon: Mic },
        { key: 'hrm-performance', label: 'Performance', icon: Star },
        { key: 'hrm-appraisals', label: 'Appraisals', icon: TrendingUp },
        { key: 'hrm-training', label: 'Training', icon: GraduationCap },
        { key: 'hrm-holidays', label: 'Holidays', icon: PartyPopper },
        { key: 'hrm-notices', label: 'Notices', icon: Bell },
        { key: 'hrm-assets', label: 'Assets', icon: Monitor },
        { key: 'hrm-documents', label: 'Documents', icon: FolderOpen },
        { key: 'hrm-shifts', label: 'Shift Management', icon: Clock4 },
        { key: 'hrm-work-reports', label: 'Work Reports', icon: FileSpreadsheet },
        { key: 'hrm-team', label: 'Team Management', icon: UsersRound },
        { key: 'hrm-permissions', label: 'Permissions & Roles', icon: Lock },
      ],
    },
  ],
}

// ─── Badge Helpers ─────────────────────────────────────────
export const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

export const fmtDate = (d: string | Date) =>
  new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

export const paymentBadge = (s: string) => {
  const m: Record<string, string> = {
    paid: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    failed: 'bg-red-500/20 text-red-400 border-red-500/30',
    refunded: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  }
  return m[s] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
}

export const orderBadge = (s: string) => {
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

export const leadBadge = (s: string) => {
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

export const priorityBadge = (s: string) => {
  const m: Record<string, string> = {
    low: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  }
  return m[s] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
}

export const statusBadgeCls = (s: string) => {
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

// ─── Sidebar Helpers ──────────────────────────────────────
export const filterSidebarItems = (items: SidebarItem[], query: string) => {
  if (!query) return items
  return items.filter(i => i.label.toLowerCase().includes(query.toLowerCase()))
}

// ─── Custom Tooltip ────────────────────────────────────────
export function CustomTooltip({ active, payload, label }: any) {
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

// ─── Re-exported icons for convenience ──────────────────────
export {
  LayoutDashboard, Package, ShoppingCart, Users, UserCog, Shield,
  Settings, Grid3X3, Clock, CalendarDays, FileText, Wrench,
  Eye, ChevronDown, Plus, Edit, Trash2, Check, X,
  TrendingUp, AlertTriangle, IndianRupee,
  BarChart3, PieChart as PieChartIcon, Target, Kanban, CalendarCheck,
  ClipboardList, Import, MessagesSquare, Link2, MailOpen, MailPlus,
  DollarSign, Receipt, CreditCard, CalendarRange, Briefcase,
  Network, Award, Banknote, Wallet, UserPlus, BriefcaseMedical,
  Mic, Star, GraduationCap, PartyPopper, Bell, Monitor,
  FolderOpen, Clock4, UsersRound, Lock, Gauge,
  Filter, Megaphone, Webhook, FormInput, Database,
  TrendingDown, Timer, CalendarClock, FileSpreadsheet,
  ArrowRight, LayoutGrid, Send, Zap,
}
