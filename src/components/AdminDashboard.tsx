'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import {
  Menu, Search, X, Bell, LogOut, ChevronDown, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { useAppStore, type AdminTab } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { toast } from 'sonner'

import {
  MAIN_NAV_ITEMS, CRM_GROUP, HRM_GROUP, filterSidebarItems,
  emptyProductForm, emptyCategoryForm,
  type ProductForm, type CategoryForm, type VariantForm, type QuotationItem,
} from './admin/types'

import DashboardTab from './admin/DashboardTab'
import ProductsTab from './admin/ProductsTab'
import CategoriesTab from './admin/CategoriesTab'
import OrdersTab from './admin/OrdersTab'
import LeadsTab from './admin/LeadsTab'
import QuotationsTab from './admin/QuotationsTab'
import CustomersTab from './admin/CustomersTab'
import EmployeesTab from './admin/EmployeesTab'
import AttendanceTab from './admin/AttendanceTab'
import LeavesTab from './admin/LeavesTab'
import AmcTab from './admin/AmcTab'
import ServiceTab from './admin/ServiceTab'
import InquiriesTab from './admin/InquiriesTab'
import SettingsTab from './admin/SettingsTab'
import ActivityTab from './admin/ActivityTab'
import CrmModules from './admin/CrmModules'
import Dialogs from './admin/Dialogs'

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
  const [editQuotation, setEditQuotation] = useState<any>(null)
  const [employeeDialog, setEmployeeDialog] = useState(false)
  const [amcDialog, setAmcDialog] = useState(false)
  const [serviceDialog, setServiceDialog] = useState(false)

  // ─── Form States ────────────────────────────────────────
  const [productForm, setProductForm] = useState<ProductForm>(emptyProductForm)
  const [categoryForm, setCategoryForm] = useState<CategoryForm>(emptyCategoryForm)
  const [productVariants, setProductVariants] = useState<VariantForm[]>([])
  const [leadForm, setLeadForm] = useState({ name: '', company: '', phone: '', email: '', city: '', requirement: '', message: '', source: 'website', assignedTo: '' })
  const [quotationCustomerName, setQuotationCustomerName] = useState('')
  const [quotationCustomerCompany, setQuotationCustomerCompany] = useState('')
  const [quotationCustomerEmail, setQuotationCustomerEmail] = useState('')
  const [quotationCustomerPhone, setQuotationCustomerPhone] = useState('')
  const [quotationCustomerAddress, setQuotationCustomerAddress] = useState('')
  const [quotationCustomerGst, setQuotationCustomerGst] = useState('')
  const [quotationItems, setQuotationItems] = useState<QuotationItem[]>([{ desc: '', hsn: '', qty: '1', unit: 'Nos', rate: '', discount: '0', gstPercent: '18' }])
  const [quotationValidUntil, setQuotationValidUntil] = useState('')
  const [quotationNotes, setQuotationNotes] = useState('')
  const [quotationDeliveryPeriod, setQuotationDeliveryPeriod] = useState('2-3 weeks')
  const [quotationInstallation, setQuotationInstallation] = useState('Included')
  const [quotationWarranty, setQuotationWarranty] = useState('12 months against manufacturing defects')
  const [quotationDetailDialog, setQuotationDetailDialog] = useState(false)
  const [selectedQuotation, setSelectedQuotation] = useState<any>(null)
  const [sendingQuotation, setSendingQuotation] = useState(false)
  const [quotationTemplate, setQuotationTemplate] = useState<'modern' | 'minimal' | 'corporate' | 'premium'>('modern')
  const [companyCustomization, setCompanyCustomization] = useState({ logo: '', name: 'Urban Kitchen Manufacturing & Solutions', address: 'Sector 12, Industrial Area, New Delhi', contact: '+91-9876543210', email: 'sales@urbankitchen.com', website: 'www.urbankitchen.com', gstNumber: '07AABCU9603R1ZM', signature: '', terms: '', brandColor: '#59ff00', footerNotes: 'Thank you for your business!' })
  const [employeeForm, setEmployeeForm] = useState({ name: '', email: '', phone: '', password: '', department: '', designation: '', salary: '', joiningDate: '' })
  const [amcForm, setAmcForm] = useState({ customerId: '', plan: '', startDate: '', endDate: '', amount: '', coverage: '' })
  const [serviceForm, setServiceForm] = useState({ customerId: '', contractId: '', issue: '', priority: 'medium', assignedTechnician: '' })
  const [uploading, setUploading] = useState(false)

  // ─── Tab-specific States ────────────────────────────────
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
  const [crmExpanded, setCrmExpanded] = useState(false)
  const [hrmExpanded, setHrmExpanded] = useState(false)
  const [sidebarSearch, setSidebarSearch] = useState('')
  const [headerSearch, setHeaderSearch] = useState('')
  const [orderStatusFilter, setOrderStatusFilter] = useState('all')
  const [productCategoryFilter, setProductCategoryFilter] = useState('all')
  const [searchQueries, setSearchQueries] = useState<Record<string, string>>({})

  // ─── Fetch helpers ──────────────────────────────────────
  const doFetchProducts = useCallback(() => {
    const params = new URLSearchParams()
    if (searchQueries.products) params.set('search', searchQueries.products)
    if (productCategoryFilter !== 'all') params.set('category', productCategoryFilter)
    params.set('status', 'active'); params.set('limit', '50')
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
      .then(([amcJ, srJ]) => { if (amcJ.status) setAmcContracts(amcJ.data.contracts); if (srJ.status) setServiceRequests(srJ.data.serviceRequests) })
      .catch(console.error)
  }, [])

  const doFetchUsers = useCallback(() => {
    const params = new URLSearchParams()
    if (roleFilter !== 'all') params.set('role', roleFilter)
    fetch(`/api/users?${params}`).then(r => r.json()).then(j => { if (j.status) { setUserList(j.data.users || j.data || []); if (j.data.roles) setRoleList(j.data.roles) } }).catch(console.error)
  }, [roleFilter])

  // ─── Effects ────────────────────────────────────────────
  useEffect(() => { fetch('/api/dashboard').then(r => r.json()).then(j => { if (j.status) setDashboardData(j.data) }).catch(console.error) }, [])
  useEffect(() => { if (adminTab === 'products') { doFetchProducts(); doFetchCategories() } }, [adminTab, doFetchProducts, doFetchCategories])
  useEffect(() => { if (adminTab === 'categories') doFetchCategories() }, [adminTab, doFetchCategories])
  useEffect(() => { if (adminTab === 'orders') doFetchOrders() }, [adminTab, doFetchOrders])
  useEffect(() => { if (adminTab === 'leads') doFetchLeads() }, [adminTab, doFetchLeads])
  useEffect(() => { if (adminTab === 'employees') doFetchEmployees() }, [adminTab, doFetchEmployees])
  useEffect(() => { if (adminTab === 'amc' || adminTab === 'service') doFetchAmc() }, [adminTab, doFetchAmc])
  useEffect(() => { if (adminTab === 'quotations') fetch('/api/quotations?limit=50').then(r => r.json()).then(j => { if (j.status) setQuotationList(j.data.quotations || j.data || []) }).catch(console.error) }, [adminTab])
  useEffect(() => { if (adminTab === 'customers') doFetchUsers() }, [adminTab, doFetchUsers])
  useEffect(() => { if (adminTab === 'attendance') fetch('/api/attendance?limit=50').then(r => r.json()).then(j => { if (j.status) setAttendanceRecords(j.data.attendance || j.data || []) }).catch(console.error) }, [adminTab])
  useEffect(() => { if (adminTab === 'leaves') { const params = leaveFilter !== 'all' ? `?status=${leaveFilter}` : ''; fetch(`/api/leaves${params}`).then(r => r.json()).then(j => { if (j.status) setLeaveList(j.data.leaves || j.data || []) }).catch(console.error) } }, [adminTab, leaveFilter])
  useEffect(() => { if (adminTab === 'inquiries') fetch('/api/inquiries?limit=50').then(r => r.json()).then(j => { if (j.status) setInquiryList(j.data.inquiries || j.data || []) }).catch(console.error) }, [adminTab])
  useEffect(() => { if (adminTab === 'settings') fetch('/api/settings').then(r => r.json()).then(j => { if (j.status) setSettingsObj(j.data || {}) }).catch(console.error) }, [adminTab])
  useEffect(() => { if (adminTab === 'activity') { Promise.all([fetch('/api/orders?limit=10'), fetch('/api/leads?limit=10')]).then(([oR, lR]) => Promise.all([oR.json(), lR.json()])).then(([oJ, lJ]) => { const a: any[] = []; if (oJ.status) (oJ.data.orders || []).forEach((o: any) => a.push({ type: 'order', description: `Order ${o.orderNumber} by ${o.customer?.name}`, status: o.orderStatus, date: o.createdAt })); if (lJ.status) (lJ.data.leads || []).forEach((l: any) => a.push({ type: 'lead', description: `Lead: ${l.name} (${l.company || 'N/A'})`, status: l.status, date: l.createdAt })); a.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); setActivityList(a) }).catch(console.error) } }, [adminTab])
  // Fetch leads/employees for CRM/HRM sub-tabs
  useEffect(() => {
    const isCrmSubTab = adminTab.startsWith('crm-')
    const isHrmSubTab = adminTab.startsWith('hrm-')
    if (isCrmSubTab || isHrmSubTab) {
      doFetchLeads()
      doFetchEmployees()
    }
  }, [adminTab, doFetchLeads, doFetchEmployees])

  // ─── Image Upload Handler ──────────────────────────────
  const handleImageUpload = async (file: File) => {
    setUploading(true)
    try {
      const formData = new FormData(); formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const json = await res.json()
      if (json.status) { setProductForm(p => ({ ...p, featuredImage: json.data.url })); toast.success('Image uploaded successfully') }
      else { toast.error(json.message || 'Upload failed') }
    } catch (e) { console.error(e); toast.error('Failed to upload image') } finally { setUploading(false) }
  }

  // ─── Compute Quotation Totals ──────────────────────────
  const computeQuotationTotals = () => {
    let subtotal = 0, totalDiscount = 0, totalGst = 0
    quotationItems.forEach(item => {
      const qty = parseFloat(item.qty) || 0, rate = parseFloat(item.rate) || 0, discount = parseFloat(item.discount) || 0, gstPercent = parseFloat(item.gstPercent) || 0
      const lineTotal = qty * rate, discAmt = lineTotal * discount / 100, afterDisc = lineTotal - discAmt, gstAmt = afterDisc * gstPercent / 100
      subtotal += lineTotal; totalDiscount += discAmt; totalGst += gstAmt
    })
    const afterDiscount = subtotal - totalDiscount, cgst = totalGst / 2, sgst = totalGst / 2, grandTotal = afterDiscount + totalGst
    return { subtotal, totalDiscount, afterDiscount, totalGst, cgst, sgst, grandTotal }
  }

  // ─── CRUD Handlers ──────────────────────────────────────
  const handleSaveProduct = async () => { try { const url = editProduct ? `/api/products/${editProduct.id}` : '/api/products'; const method = editProduct ? 'PUT' : 'POST'; const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...productForm, variants: productVariants }) }); const json = await res.json(); if (json.status) { setProductDialog(false); setEditProduct(null); doFetchProducts(); toast.success(editProduct ? 'Product updated' : 'Product created') } else { toast.error(json.message || 'Failed') } } catch (e) { console.error(e); toast.error('Failed to save product') } }
  const handleDeleteProduct = async (id: string) => { if (!confirm('Delete this product?')) return; try { await fetch(`/api/products/${id}`, { method: 'DELETE' }); doFetchProducts(); toast.success('Product deleted') } catch (e) { console.error(e); toast.error('Failed to delete product') } }
  const handleSaveCategory = async () => { try { const url = editCategory ? `/api/categories/${editCategory.id}` : '/api/categories'; const method = editCategory ? 'PUT' : 'POST'; const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(categoryForm) }); const json = await res.json(); if (json.status) { setCategoryDialog(false); setEditCategory(null); doFetchCategories(); toast.success(editCategory ? 'Category updated' : 'Category created') } else { toast.error(json.message || 'Failed') } } catch (e) { console.error(e); toast.error('Failed to save category') } }
  const handleDeleteCategory = async (id: string) => { try { const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' }); const json = await res.json(); if (json.status) { doFetchCategories(); toast.success('Category deleted') } else { toast.error(json.message || 'Cannot delete') } } catch (e) { console.error(e); toast.error('Failed') } setDeleteCategoryDialog(false); setCategoryToDelete(null) }
  const handleUpdateOrderStatus = async (id: string, orderStatus: string) => { try { await fetch(`/api/orders/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderStatus }) }); doFetchOrders(); toast.success('Order status updated') } catch (e) { console.error(e); toast.error('Failed') } }
  const handleSaveLead = async () => { try { const res = await fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(leadForm) }); const json = await res.json(); if (json.status) { setLeadDialog(false); doFetchLeads(); toast.success('Lead created') } else { toast.error(json.message || 'Failed') } } catch (e) { console.error(e); toast.error('Failed') } }
  const handleUpdateLeadStatus = async (id: string, status: string) => { try { await fetch(`/api/leads/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }); doFetchLeads(); if (selectedLead) { fetch(`/api/leads/${id}`).then(r => r.json()).then(j => { if (j.status) setSelectedLead(j.data) }).catch(console.error) } toast.success('Lead status updated') } catch (e) { console.error(e); toast.error('Failed') } }
  const handleSaveQuotation = async () => { try { const custName = quotationCustomerName || selectedLead?.name || ''; if (!custName) { toast.error('Customer name is required'); return } const hasValidItems = quotationItems.some(item => item.desc && item.rate); if (!hasValidItems) { toast.error('Add at least one item'); return } const totals = computeQuotationTotals(); const itemsWithAmount = quotationItems.map(item => { const qty = parseFloat(item.qty) || 0, rate = parseFloat(item.rate) || 0, discount = parseFloat(item.discount) || 0, gstPercent = parseFloat(item.gstPercent) || 0; const lineTotal = qty * rate, discAmt = lineTotal * discount / 100, afterDisc = lineTotal - discAmt, gstAmt = afterDisc * gstPercent / 100; return { ...item, amount: afterDisc + gstAmt } }); const payload = { leadId: selectedLead?.id || (editQuotation?.leadId ?? null), customerName: custName, customerCompany: quotationCustomerCompany || selectedLead?.company || '', customerEmail: quotationCustomerEmail || selectedLead?.email || '', customerPhone: quotationCustomerPhone || selectedLead?.phone || '', customerAddress: quotationCustomerAddress || (selectedLead?.city ? `${selectedLead.city}, India` : ''), customerGst: quotationCustomerGst, amount: totals.grandTotal, subtotal: totals.subtotal, discountAmount: totals.totalDiscount, cgstAmount: totals.cgst, sgstAmount: totals.sgst, totalGst: totals.totalGst, items: JSON.stringify(itemsWithAmount), notes: quotationNotes, terms: JSON.stringify(['Prices are exclusive of freight & insurance charges unless stated otherwise.', 'GST @18% applicable as per government norms.', '50% advance payment with order, balance before dispatch.', 'Delivery subject to confirmation at the time of order.', 'Goods once sold will not be taken back.', 'Subject to Delhi jurisdiction.', 'This quotation is valid for 30 days from the date of issue.']), bankDetails: JSON.stringify({ bankName: 'HDFC Bank', accountName: 'Urban Kitchen Manufacturing & Solutions', accountNo: '50100XXXXX1234', ifsc: 'HDFC0001234', branch: 'Sector 12, Industrial Area, New Delhi' }), validUntil: quotationValidUntil || null, deliveryPeriod: quotationDeliveryPeriod, installation: quotationInstallation, warranty: quotationWarranty }; let res: Response; if (editQuotation) { res = await fetch(`/api/quotations/${editQuotation.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }) } else { res = await fetch('/api/quotations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }) } const json = await res.json(); if (json.status) { setQuotationDialog(false); setEditQuotation(null); doFetchLeads(); if (adminTab === 'quotations') fetch('/api/quotations?limit=50').then(r => r.json()).then(j => { if (j.status) setQuotationList(j.data.quotations || j.data || []) }).catch(console.error); toast.success(editQuotation ? 'Quotation updated' : 'Quotation created') } else { toast.error(json.message || 'Failed') } } catch (e) { console.error(e); toast.error('Failed') } }
  const handleSaveEmployee = async () => { try { const res = await fetch('/api/employees', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(employeeForm) }); const json = await res.json(); if (json.status) { setEmployeeDialog(false); doFetchEmployees(); toast.success('Employee created') } else { toast.error(json.message || 'Failed') } } catch (e) { console.error(e); toast.error('Failed') } }
  const handleSaveAmc = async () => { try { const res = await fetch('/api/amc', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(amcForm) }); const json = await res.json(); if (json.status) { setAmcDialog(false); doFetchAmc(); toast.success('AMC contract created') } else { toast.error(json.message || 'Failed') } } catch (e) { console.error(e); toast.error('Failed') } }
  const handleSaveServiceRequest = async () => { try { const res = await fetch('/api/service-requests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(serviceForm) }); const json = await res.json(); if (json.status) { setServiceDialog(false); doFetchAmc(); toast.success('Service request created') } else { toast.error(json.message || 'Failed') } } catch (e) { console.error(e); toast.error('Failed') } }
  const handleUpdateServiceRequest = async (id: string, data: any) => { try { await fetch('/api/service-requests', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ requestId: id, ...data }) }); doFetchAmc(); toast.success('Service request updated') } catch (e) { console.error(e); toast.error('Failed') } }
  const handleLogout = () => { setUser(null); setView('home') }
  const handleSearch = (key: string, value: string) => { setSearchQueries(prev => ({ ...prev, [key]: value })) }

  // ─── Open helpers ───────────────────────────────────────
  const openEditProduct = (p: any) => { setEditProduct(p); setProductForm({ name: p.name, categoryId: p.categoryId, description: p.description || '', shortDescription: p.shortDescription || '', price: String(p.price), stock: String(p.stock), status: p.status, steelGrade: p.steelGrade || '', capacity: p.capacity || '', dimensions: p.dimensions || '', moq: p.moq ? String(p.moq) : '', leadTime: p.leadTime || '', featuredImage: p.featuredImage || '', featured: p.featured || false }); setProductVariants((p.variants || []).map((v: any) => ({ id: v.id, name: v.name || '', sku: v.sku || '', price: String(v.price ?? ''), stock: String(v.stock ?? ''), weight: v.weight || '', dimensions: v.dimensions || '', isDefault: v.isDefault || false, sortOrder: v.sortOrder || 0 }))); setProductDialog(true) }
  const openNewProduct = () => { setEditProduct(null); setProductForm(emptyProductForm); setProductVariants([]); setProductDialog(true) }
  const openEditCategory = (c: any) => { setEditCategory(c); setCategoryForm({ name: c.name, slug: c.slug || '', image: c.image || '', parentId: c.parentId || '', description: c.description || '', displayType: c.displayType || 'products', menuOrder: String(c.menuOrder ?? '0'), thumbnail: c.thumbnail || '', bannerImage: c.bannerImage || '', seoTitle: c.seoTitle || '', seoDescription: c.seoDescription || '', status: c.status || 'active' }); setCategoryDialog(true) }
  const openNewCategory = () => { setEditCategory(null); setCategoryForm(emptyCategoryForm); setCategoryDialog(true) }
  const openDeleteCategory = (c: any) => { setCategoryToDelete(c); setDeleteCategoryDialog(true) }
  const openLeadDetail = (lead: any) => { fetch(`/api/leads/${lead.id}`).then(r => r.json()).then(j => { if (j.status) { setSelectedLead(j.data); setLeadDetailDialog(true) } }).catch(console.error) }
  const openNewQuotation = () => { setSelectedLead(null); setEditQuotation(null); setQuotationCustomerName(''); setQuotationCustomerCompany(''); setQuotationCustomerEmail(''); setQuotationCustomerPhone(''); setQuotationCustomerAddress(''); setQuotationCustomerGst(''); setQuotationItems([{ desc: '', hsn: '', qty: '1', unit: 'Nos', rate: '', discount: '0', gstPercent: '18' }]); setQuotationValidUntil(''); setQuotationNotes(''); setQuotationDeliveryPeriod('2-3 weeks'); setQuotationInstallation('Included'); setQuotationWarranty('12 months against manufacturing defects'); setQuotationDialog(true) }
  const openEditQuotation = async (q: any) => { try { const res = await fetch(`/api/quotations/${q.id}`); const json = await res.json(); if (!json.status) { toast.error('Failed to load quotation'); return } const data = json.data; setEditQuotation(data); setQuotationCustomerName(data.customerName || ''); setQuotationCustomerCompany(data.customerCompany || ''); setQuotationCustomerEmail(data.customerEmail || ''); setQuotationCustomerPhone(data.customerPhone || ''); setQuotationCustomerAddress(data.customerAddress || ''); setQuotationCustomerGst(data.customerGst || ''); const parsedItems = data.items ? (typeof data.items === 'string' ? JSON.parse(data.items) : data.items) : []; setQuotationItems(parsedItems.length > 0 ? parsedItems.map((it: any) => ({ desc: it.desc || '', hsn: it.hsn || '', qty: String(it.qty || '1'), unit: it.unit || 'Nos', rate: String(it.rate || ''), discount: String(it.discount || '0'), gstPercent: String(it.gstPercent || '18') })) : [{ desc: '', hsn: '', qty: '1', unit: 'Nos', rate: '', discount: '0', gstPercent: '18' }]); setQuotationValidUntil(data.validUntil ? data.validUntil.split('T')[0] : ''); setQuotationNotes(data.notes || ''); setQuotationDeliveryPeriod(data.deliveryPeriod || ''); setQuotationInstallation(data.installation || ''); setQuotationWarranty(data.warranty || ''); setQuotationDialog(true) } catch (e) { console.error(e); toast.error('Failed to load quotation') } }
  const openOrderDetail = (order: any) => { fetch(`/api/orders/${order.id}`).then(r => r.json()).then(j => { if (j.status) { setSelectedOrder(j.data); setOrderDialog(true) } }).catch(console.error) }
  const onOpenQuotationFromLead = () => { setQuotationCustomerName(selectedLead?.name || ''); setQuotationCustomerCompany(selectedLead?.company || ''); setQuotationCustomerEmail(selectedLead?.email || ''); setQuotationCustomerPhone(selectedLead?.phone || ''); setQuotationCustomerAddress(selectedLead?.city ? `${selectedLead.city}, India` : ''); setQuotationCustomerGst(''); setQuotationItems([{ desc: '', hsn: '', qty: '1', unit: 'Nos', rate: '', discount: '0', gstPercent: '18' }]); setQuotationValidUntil(''); setQuotationNotes(''); setQuotationDeliveryPeriod('2-3 weeks'); setQuotationInstallation('Included'); setQuotationWarranty('12 months against manufacturing defects'); setQuotationDialog(true) }

  // ─── Sidebar state ──────────────────────────────────────
  const isCrmTab = CRM_GROUP.sections.flatMap(s => s.items).some(i => i.key === adminTab)
  const isHrmTab = HRM_GROUP.sections.flatMap(s => s.items).some(i => i.key === adminTab)
  const effectiveCrmExpanded = isCrmTab ? true : crmExpanded
  const effectiveHrmExpanded = isHrmTab ? true : hrmExpanded

  // ─── Tab Router ─────────────────────────────────────────
  const renderTabContent = () => {
    switch (adminTab) {
      case 'dashboard': return <DashboardTab dashboardData={dashboardData} openOrderDetail={openOrderDetail} openLeadDetail={openLeadDetail} />
      case 'products': return <ProductsTab products={products} categories={categories} searchQueries={searchQueries} productCategoryFilter={productCategoryFilter} setProductCategoryFilter={setProductCategoryFilter} handleSearch={handleSearch} openNewProduct={openNewProduct} openEditProduct={openEditProduct} handleDeleteProduct={handleDeleteProduct} />
      case 'categories': return <CategoriesTab categories={categories} openNewCategory={openNewCategory} openEditCategory={openEditCategory} openDeleteCategory={openDeleteCategory} />
      case 'orders': return <OrdersTab orders={orders} orderStatusFilter={orderStatusFilter} setOrderStatusFilter={setOrderStatusFilter} searchQueries={searchQueries} handleSearch={handleSearch} openOrderDetail={openOrderDetail} handleUpdateOrderStatus={handleUpdateOrderStatus} />
      case 'leads': return <LeadsTab leads={leads} setLeadForm={setLeadForm} setLeadDialog={setLeadDialog} openLeadDetail={openLeadDetail} handleUpdateLeadStatus={handleUpdateLeadStatus} />
      case 'quotations': return <QuotationsTab quotationList={quotationList} openNewQuotation={openNewQuotation} openEditQuotation={openEditQuotation} selectedQuotation={selectedQuotation} setSelectedQuotation={setSelectedQuotation} quotationDetailDialog={quotationDetailDialog} setQuotationDetailDialog={setQuotationDetailDialog} sendingQuotation={sendingQuotation} />
      case 'customers': return <CustomersTab userList={userList} roleList={roleList} userDialog={userDialog} setUserDialog={setUserDialog} editUser={editUser} setEditUser={setEditUser} userForm={userForm} setUserForm={setUserForm} roleFilter={roleFilter} setRoleFilter={setRoleFilter} doFetchUsers={doFetchUsers} />
      case 'employees': return <EmployeesTab employees={employees} empEditDialog={empEditDialog} setEmpEditDialog={setEmpEditDialog} editEmp={editEmp} setEditEmp={setEditEmp} empEditForm={empEditForm} setEmpEditForm={setEmpEditForm} employeeDialog={employeeDialog} setEmployeeDialog={setEmployeeDialog} employeeForm={employeeForm} setEmployeeForm={setEmployeeForm} doFetchEmployees={doFetchEmployees} />
      case 'attendance': return <AttendanceTab attendanceRecords={attendanceRecords} />
      case 'leaves': return <LeavesTab leaveList={leaveList} leaveFilter={leaveFilter} setLeaveFilter={setLeaveFilter} />
      case 'amc': return <AmcTab amcContracts={amcContracts} setAmcForm={setAmcForm} setAmcDialog={setAmcDialog} />
      case 'service': return <ServiceTab serviceRequests={serviceRequests} setServiceForm={setServiceForm} setServiceDialog={setServiceDialog} handleUpdateServiceRequest={handleUpdateServiceRequest} />
      case 'inquiries': return <InquiriesTab inquiryList={inquiryList} setInquiryList={setInquiryList} />
      case 'settings': return <SettingsTab settingsObj={settingsObj} setSettingsObj={setSettingsObj} settingsLoading={settingsLoading} />
      case 'activity': return <ActivityTab activityList={activityList} />
      default: {
        const crmResult = <CrmModules adminTab={adminTab} leads={leads} employees={employees} />
        if (crmResult) return crmResult
        return <DashboardTab dashboardData={dashboardData} openOrderDetail={openOrderDetail} openLeadDetail={openLeadDetail} />
      }
    }
  }

  // ─── Sidebar Nav Items Renderer ─────────────────────────
  const renderNavItems = (isMobile: boolean) => (
    <>
      {filterSidebarItems(MAIN_NAV_ITEMS, sidebarSearch).map(({ key, label, icon: Icon }) => (
        <button key={key} onClick={() => { setAdminTab(key); setMobileOpen(false) }}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${adminTab === key ? 'bg-[#59ff00]/10 text-[#59ff00] border border-[#59ff00]/20' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}`}
          title={sidebarCollapsed && !isMobile ? label : undefined}>
          <Icon className="w-5 h-5 flex-shrink-0" />
          {(!sidebarCollapsed || isMobile) && <span>{label}</span>}
        </button>
      ))}
    </>
  )

  const renderGroupDropdown = (group: typeof CRM_GROUP, isExpanded: boolean, setExpanded: (v: boolean) => void, isActive: boolean, isMobile: boolean) => {
    const filtered = { ...group, sections: group.sections.map(s => ({ ...s, items: filterSidebarItems(s.items, sidebarSearch) })).filter(s => s.items.length > 0) }
    if (sidebarSearch && filtered.sections.flatMap(s => s.items).length === 0) return null
    const GroupIcon = group.icon
    return (
      <div className="mt-1">
        <button onClick={() => setExpanded(!isExpanded)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${isActive ? 'text-[#59ff00]' : 'text-gray-400 hover:text-white'} hover:bg-white/5`} title={sidebarCollapsed && !isMobile ? group.label : undefined}>
          <GroupIcon className="w-5 h-5 flex-shrink-0" />
          {(!sidebarCollapsed || isMobile) && (<><span className="flex-1 text-left">{group.label}</span><motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}><ChevronDown className="w-4 h-4" /></motion.div></>)}
        </button>
        <AnimatePresence>
          {isExpanded && (!sidebarCollapsed || isMobile) && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: 'easeInOut' }} className="overflow-hidden">
              <div className="ml-3 pl-3 border-l border-[#2a2a2a] space-y-0.5 py-1">
                {filtered.sections.map((section, si) => (
                  <div key={si}>
                    {section.label && <p className="text-gray-600 text-[10px] font-bold tracking-widest px-3 py-1.5 mt-1">{section.label}</p>}
                    {section.items.map(({ key, label, icon: ItemIcon }) => (
                      <button key={key} onClick={() => { setAdminTab(key); setMobileOpen(false) }}
                        className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md transition-all duration-200 text-xs font-medium ${adminTab === key ? 'bg-[#59ff00]/10 text-[#59ff00]' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
                        <ItemIcon className="w-4 h-4 flex-shrink-0" /><span>{label}</span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
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
            {!sidebarCollapsed && (<div className="overflow-hidden"><h1 className="text-white font-bold text-sm leading-tight">Urban Kitchen</h1><p className="text-[#59ff00] text-[10px] font-medium tracking-wider uppercase">Admin Panel</p></div>)}
          </div>
          {!sidebarCollapsed && (<div className="px-3 py-2"><div className="relative"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" /><Input placeholder="Search menu..." value={sidebarSearch} onChange={(e) => setSidebarSearch(e.target.value)} className="pl-8 bg-[#0b0b0b] border-[#2a2a2a] text-white placeholder:text-gray-600 h-8 text-xs rounded-lg" />{sidebarSearch && (<button onClick={() => setSidebarSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"><X className="w-3 h-3" /></button>)}</div></div>)}
          <nav className="flex-1 py-1 px-2 space-y-0.5 overflow-y-auto custom-scrollbar">
            {renderNavItems(false)}
            {renderGroupDropdown(CRM_GROUP, effectiveCrmExpanded, setCrmExpanded, isCrmTab, false)}
            {renderGroupDropdown(HRM_GROUP, effectiveHrmExpanded, setHrmExpanded, isHrmTab, false)}
          </nav>
          <div className="p-2 border-t border-[#2a2a2a]"><button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 text-sm" title={sidebarCollapsed ? 'Logout' : undefined}><LogOut className="w-5 h-5 flex-shrink-0" />{!sidebarCollapsed && <span>Logout</span>}</button></div>
        </div>
        <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="absolute top-5 z-10 w-6 h-6 rounded-full bg-[#181818] border border-[#2a2a2a] flex items-center justify-center text-gray-400 hover:text-[#59ff00] transition-colors" style={{ right: '-12px' }}>{sidebarCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}</button>
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="bg-[#101010] border-[#2a2a2a] w-72 p-0">
          <SheetHeader className="sr-only"><SheetTitle>Navigation</SheetTitle></SheetHeader>
          <div className="flex flex-col h-full">
            <div className="p-4 flex items-center gap-3 border-b border-[#2a2a2a]"><Image src="/logo.jpg" alt="Urban Kitchen" width={36} height={36} className="w-9 h-9 rounded-lg object-contain flex-shrink-0" /><div className="overflow-hidden"><h1 className="text-white font-bold text-sm leading-tight">Urban Kitchen</h1><p className="text-[#59ff00] text-[10px] font-medium tracking-wider uppercase">Admin Panel</p></div></div>
            <div className="px-3 py-2"><div className="relative"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" /><Input placeholder="Search menu..." value={sidebarSearch} onChange={(e) => setSidebarSearch(e.target.value)} className="pl-8 bg-[#0b0b0b] border-[#2a2a2a] text-white placeholder:text-gray-600 h-8 text-xs rounded-lg" /></div></div>
            <nav className="flex-1 py-1 px-2 space-y-0.5 overflow-y-auto custom-scrollbar">
              {renderNavItems(true)}
              {renderGroupDropdown(CRM_GROUP, effectiveCrmExpanded, setCrmExpanded, isCrmTab, true)}
              {renderGroupDropdown(HRM_GROUP, effectiveHrmExpanded, setHrmExpanded, isHrmTab, true)}
            </nav>
            <div className="p-2 border-t border-[#2a2a2a]"><button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 text-sm"><LogOut className="w-5 h-5 flex-shrink-0" /><span>Logout</span></button></div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-4 lg:px-6 py-3 border-b border-[#2a2a2a] bg-[#0b0b0b]">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="lg:hidden text-gray-400 hover:text-white" onClick={() => setMobileOpen(true)}><Menu className="w-5 h-5" /></Button>
            <div><h2 className="text-white font-semibold text-lg capitalize">{adminTab.replace(/_/g, ' ').replace(/crm-|hrm-/g, '')}</h2><p className="text-gray-500 text-xs">Urban Kitchen Admin Panel</p></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-[#181818] border border-[#2a2a2a] rounded-lg px-3 py-1.5 w-64">
              <Search className="w-4 h-4 text-gray-500 flex-shrink-0" /><input type="text" placeholder="Search anything..." value={headerSearch} onChange={(e) => setHeaderSearch(e.target.value)} className="bg-transparent text-white text-sm placeholder:text-gray-500 outline-none w-full" />{headerSearch && <button onClick={() => setHeaderSearch('')} className="text-gray-500 hover:text-white"><X className="w-3 h-3" /></button>}
            </div>
            <div className="hidden sm:flex items-center gap-2 bg-[#181818] border border-[#2a2a2a] rounded-lg px-3 py-1.5"><div className="w-2 h-2 rounded-full bg-[#59ff00] animate-pulse" /><span className="text-gray-400 text-xs">Online</span></div>
            <button className="relative w-9 h-9 rounded-lg bg-[#181818] border border-[#2a2a2a] flex items-center justify-center text-gray-400 hover:text-white hover:border-[#59ff00]/30 transition-all"><Bell className="w-4 h-4" /><span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">3</span></button>
            <div className="flex items-center gap-2 pl-2 border-l border-[#2a2a2a]"><div className="w-8 h-8 rounded-full bg-[#59ff00]/20 border border-[#59ff00]/30 flex items-center justify-center"><span className="text-[#59ff00] text-xs font-bold">A</span></div><div className="hidden xl:block"><p className="text-white text-xs font-medium">Admin</p><p className="text-gray-500 text-[10px]">Super Admin</p></div></div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-6">
          <AnimatePresence mode="wait"><div key={adminTab}>{renderTabContent()}</div></AnimatePresence>
        </div>
      </main>

      {/* All Dialogs */}
      <Dialogs
        productDialog={productDialog} setProductDialog={setProductDialog} editProduct={editProduct} productForm={productForm} setProductForm={setProductForm} productVariants={productVariants} setProductVariants={setProductVariants} categories={categories} uploading={uploading} handleImageUpload={handleImageUpload} handleSaveProduct={handleSaveProduct} fileInputRef={fileInputRef}
        categoryDialog={categoryDialog} setCategoryDialog={setCategoryDialog} editCategory={editCategory} categoryForm={categoryForm} setCategoryForm={setCategoryForm} handleSaveCategory={handleSaveCategory}
        deleteCategoryDialog={deleteCategoryDialog} setDeleteCategoryDialog={setDeleteCategoryDialog} categoryToDelete={categoryToDelete} setCategoryToDelete={setCategoryToDelete} handleDeleteCategory={handleDeleteCategory}
        orderDialog={orderDialog} setOrderDialog={setOrderDialog} selectedOrder={selectedOrder}
        leadDialog={leadDialog} setLeadDialog={setLeadDialog} leadForm={leadForm} setLeadForm={setLeadForm} employees={employees} handleSaveLead={handleSaveLead}
        leadDetailDialog={leadDetailDialog} setLeadDetailDialog={setLeadDetailDialog} selectedLead={selectedLead} handleUpdateLeadStatus={handleUpdateLeadStatus} onOpenQuotationFromLead={onOpenQuotationFromLead}
        quotationDialog={quotationDialog} setQuotationDialog={setQuotationDialog} editQuotation={editQuotation}
        quotationTemplate={quotationTemplate} setQuotationTemplate={setQuotationTemplate} companyCustomization={companyCustomization} setCompanyCustomization={setCompanyCustomization}
        quotationCustomerName={quotationCustomerName} setQuotationCustomerName={setQuotationCustomerName} quotationCustomerCompany={quotationCustomerCompany} setQuotationCustomerCompany={setQuotationCustomerCompany} quotationCustomerEmail={quotationCustomerEmail} setQuotationCustomerEmail={setQuotationCustomerEmail} quotationCustomerPhone={quotationCustomerPhone} setQuotationCustomerPhone={setQuotationCustomerPhone} quotationCustomerAddress={quotationCustomerAddress} setQuotationCustomerAddress={setQuotationCustomerAddress} quotationCustomerGst={quotationCustomerGst} setQuotationCustomerGst={setQuotationCustomerGst}
        quotationItems={quotationItems} setQuotationItems={setQuotationItems} quotationValidUntil={quotationValidUntil} setQuotationValidUntil={setQuotationValidUntil} quotationNotes={quotationNotes} setQuotationNotes={setQuotationNotes} quotationDeliveryPeriod={quotationDeliveryPeriod} setQuotationDeliveryPeriod={setQuotationDeliveryPeriod} quotationInstallation={quotationInstallation} setQuotationInstallation={setQuotationInstallation} quotationWarranty={quotationWarranty} setQuotationWarranty={setQuotationWarranty}
        computeQuotationTotals={computeQuotationTotals} handleSaveQuotation={handleSaveQuotation}
        employeeDialog={employeeDialog} setEmployeeDialog={setEmployeeDialog} employeeForm={employeeForm} setEmployeeForm={setEmployeeForm} handleSaveEmployee={handleSaveEmployee}
        amcDialog={amcDialog} setAmcDialog={setAmcDialog} amcForm={amcForm} setAmcForm={setAmcForm} handleSaveAmc={handleSaveAmc}
        serviceDialog={serviceDialog} setServiceDialog={setServiceDialog} serviceForm={serviceForm} setServiceForm={setServiceForm} handleSaveServiceRequest={handleSaveServiceRequest}
      />
    </div>
  )
}
