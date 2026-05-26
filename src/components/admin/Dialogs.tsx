'use client'

import React, { useRef } from 'react'
import Image from 'next/image'
import {
  Plus, Edit, Trash2, Upload, X, Package, ImageIcon,
  FileText, Printer, Palette, Building2, ChevronDown,
  Phone, Mail, MapPin, TrendingUp, Users,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  fmt, fmtDate, paymentBadge, orderBadge,
  emptyVariantForm, type ProductForm, type CategoryForm, type VariantForm, type QuotationItem,
} from './types'

interface DialogsProps {
  // Product dialog
  productDialog: boolean
  setProductDialog: (v: boolean) => void
  editProduct: any
  productForm: ProductForm
  setProductForm: React.Dispatch<React.SetStateAction<ProductForm>>
  productVariants: VariantForm[]
  setProductVariants: React.Dispatch<React.SetStateAction<VariantForm[]>>
  categories: any[]
  uploading: boolean
  handleImageUpload: (file: File) => void
  handleSaveProduct: () => void
  fileInputRef: React.RefObject<HTMLInputElement | null>

  // Category dialog
  categoryDialog: boolean
  setCategoryDialog: (v: boolean) => void
  editCategory: any
  categoryForm: CategoryForm
  setCategoryForm: React.Dispatch<React.SetStateAction<CategoryForm>>
  handleSaveCategory: () => void

  // Delete category dialog
  deleteCategoryDialog: boolean
  setDeleteCategoryDialog: (v: boolean) => void
  categoryToDelete: any
  setCategoryToDelete: (v: any) => void
  handleDeleteCategory: (id: string) => void

  // Order dialog
  orderDialog: boolean
  setOrderDialog: (v: boolean) => void
  selectedOrder: any

  // Lead dialog
  leadDialog: boolean
  setLeadDialog: (v: boolean) => void
  leadForm: any
  setLeadForm: React.Dispatch<React.SetStateAction<any>>
  employees: any[]
  handleSaveLead: () => void

  // Lead detail dialog
  leadDetailDialog: boolean
  setLeadDetailDialog: (v: boolean) => void
  selectedLead: any
  handleUpdateLeadStatus: (id: string, status: string) => void
  onOpenQuotationFromLead: () => void

  // Quotation dialog
  quotationDialog: boolean
  setQuotationDialog: (v: boolean) => void
  editQuotation: any
  quotationTemplate: 'modern' | 'minimal' | 'corporate' | 'premium'
  setQuotationTemplate: (v: 'modern' | 'minimal' | 'corporate' | 'premium') => void
  companyCustomization: any
  setCompanyCustomization: React.Dispatch<React.SetStateAction<any>>
  quotationCustomerName: string
  setQuotationCustomerName: (v: string) => void
  quotationCustomerCompany: string
  setQuotationCustomerCompany: (v: string) => void
  quotationCustomerEmail: string
  setQuotationCustomerEmail: (v: string) => void
  quotationCustomerPhone: string
  setQuotationCustomerPhone: (v: string) => void
  quotationCustomerAddress: string
  setQuotationCustomerAddress: (v: string) => void
  quotationCustomerGst: string
  setQuotationCustomerGst: (v: string) => void
  quotationItems: QuotationItem[]
  setQuotationItems: React.Dispatch<React.SetStateAction<QuotationItem[]>>
  quotationValidUntil: string
  setQuotationValidUntil: (v: string) => void
  quotationNotes: string
  setQuotationNotes: (v: string) => void
  quotationDeliveryPeriod: string
  setQuotationDeliveryPeriod: (v: string) => void
  quotationInstallation: string
  setQuotationInstallation: (v: string) => void
  quotationWarranty: string
  setQuotationWarranty: (v: string) => void
  computeQuotationTotals: () => { subtotal: number; totalDiscount: number; afterDiscount: number; totalGst: number; cgst: number; sgst: number; grandTotal: number }
  handleSaveQuotation: () => void

  // Employee dialog
  employeeDialog: boolean
  setEmployeeDialog: (v: boolean) => void
  employeeForm: any
  setEmployeeForm: React.Dispatch<React.SetStateAction<any>>
  handleSaveEmployee: () => void

  // AMC dialog
  amcDialog: boolean
  setAmcDialog: (v: boolean) => void
  amcForm: any
  setAmcForm: React.Dispatch<React.SetStateAction<any>>
  handleSaveAmc: () => void

  // Service dialog
  serviceDialog: boolean
  setServiceDialog: (v: boolean) => void
  serviceForm: any
  setServiceForm: React.Dispatch<React.SetStateAction<any>>
  handleSaveServiceRequest: () => void
}

export default function Dialogs(props: DialogsProps) {
  const {
    productDialog, setProductDialog, editProduct, productForm, setProductForm,
    productVariants, setProductVariants, categories, uploading, handleImageUpload,
    handleSaveProduct, fileInputRef,
    categoryDialog, setCategoryDialog, editCategory, categoryForm, setCategoryForm,
    handleSaveCategory,
    deleteCategoryDialog, setDeleteCategoryDialog, categoryToDelete, setCategoryToDelete,
    handleDeleteCategory,
    orderDialog, setOrderDialog, selectedOrder,
    leadDialog, setLeadDialog, leadForm, setLeadForm, employees, handleSaveLead,
    leadDetailDialog, setLeadDetailDialog, selectedLead, handleUpdateLeadStatus,
    onOpenQuotationFromLead,
    quotationDialog, setQuotationDialog, editQuotation,
    quotationTemplate, setQuotationTemplate, companyCustomization, setCompanyCustomization,
    quotationCustomerName, setQuotationCustomerName,
    quotationCustomerCompany, setQuotationCustomerCompany,
    quotationCustomerEmail, setQuotationCustomerEmail,
    quotationCustomerPhone, setQuotationCustomerPhone,
    quotationCustomerAddress, setQuotationCustomerAddress,
    quotationCustomerGst, setQuotationCustomerGst,
    quotationItems, setQuotationItems,
    quotationValidUntil, setQuotationValidUntil,
    quotationNotes, setQuotationNotes,
    quotationDeliveryPeriod, setQuotationDeliveryPeriod,
    quotationInstallation, setQuotationInstallation,
    quotationWarranty, setQuotationWarranty,
    computeQuotationTotals, handleSaveQuotation,
    employeeDialog, setEmployeeDialog, employeeForm, setEmployeeForm, handleSaveEmployee,
    amcDialog, setAmcDialog, amcForm, setAmcForm, handleSaveAmc,
    serviceDialog, setServiceDialog, serviceForm, setServiceForm, handleSaveServiceRequest,
  } = props

  return (
    <>
      {/* Product Dialog */}
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
                    <button type="button" onClick={() => setProductForm(p => ({ ...p, featuredImage: '' }))} className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-lg border border-dashed border-[#2a2a2a] flex items-center justify-center flex-shrink-0">
                    <ImageIcon className="w-6 h-6 text-gray-600" />
                  </div>
                )}
                <div className="flex-1">
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleImageUpload(file) }} />
                  <Button type="button" variant="outline" className="w-full bg-[#0b0b0b] border-[#2a2a2a] text-gray-300 hover:text-white hover:border-[#59ff00]/50" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                    {uploading ? (<><div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2" />Uploading...</>) : (<><Upload className="w-4 h-4 mr-2" />Upload Image</>)}
                  </Button>
                  <p className="text-gray-600 text-[10px] mt-1">JPG, PNG, WebP, GIF (max 5MB)</p>
                </div>
              </div>
            </div>
            <div className="space-y-1.5"><Label className="text-gray-300 text-sm">Short Description</Label><Input className="bg-[#0b0b0b] border-[#2a2a2a] text-white" placeholder="Brief product description" value={productForm.shortDescription} onChange={(e) => setProductForm(p => ({ ...p, shortDescription: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label className="text-gray-300 text-sm">Description *</Label><Textarea className="bg-[#0b0b0b] border-[#2a2a2a] text-white" rows={3} value={productForm.description} onChange={(e) => setProductForm(p => ({ ...p, description: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-gray-300 text-sm">Stock</Label><Input type="number" className="bg-[#0b0b0b] border-[#2a2a2a] text-white" value={productForm.stock} onChange={(e) => setProductForm(p => ({ ...p, stock: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label className="text-gray-300 text-sm">Status</Label>
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
              <div className="space-y-1.5"><Label className="text-gray-300 text-sm">Steel Grade</Label><Input className="bg-[#0b0b0b] border-[#2a2a2a] text-white" value={productForm.steelGrade} onChange={(e) => setProductForm(p => ({ ...p, steelGrade: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label className="text-gray-300 text-sm">Capacity</Label><Input className="bg-[#0b0b0b] border-[#2a2a2a] text-white" value={productForm.capacity} onChange={(e) => setProductForm(p => ({ ...p, capacity: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-gray-300 text-sm">Dimensions</Label><Input className="bg-[#0b0b0b] border-[#2a2a2a] text-white" placeholder="e.g. 600x400x850mm" value={productForm.dimensions} onChange={(e) => setProductForm(p => ({ ...p, dimensions: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label className="text-gray-300 text-sm">MOQ</Label><Input type="number" className="bg-[#0b0b0b] border-[#2a2a2a] text-white" placeholder="Minimum order qty" value={productForm.moq} onChange={(e) => setProductForm(p => ({ ...p, moq: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-gray-300 text-sm">Lead Time</Label><Input className="bg-[#0b0b0b] border-[#2a2a2a] text-white" placeholder="e.g. 2-3 weeks" value={productForm.leadTime} onChange={(e) => setProductForm(p => ({ ...p, leadTime: e.target.value }))} /></div>
              <div className="space-y-1.5 flex items-end">
                <div className="flex items-center gap-2 pb-1">
                  <Switch checked={productForm.featured} onCheckedChange={(checked) => setProductForm(p => ({ ...p, featured: checked }))} />
                  <Label className="text-gray-300 text-sm">Featured</Label>
                </div>
              </div>
            </div>
          </div>
          {/* Variants */}
          <div className="mt-5 border-t border-[#2a2a2a] pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white text-sm font-semibold flex items-center gap-2"><Package className="w-4 h-4 text-[#59ff00]" />Size / Variants</h3>
              <Button type="button" size="sm" className="bg-[#59ff00]/10 text-[#59ff00] hover:bg-[#59ff00]/20 border border-[#59ff00]/30 font-semibold" onClick={() => setProductVariants(prev => [...prev, { ...emptyVariantForm, sortOrder: prev.length, name: `Variant ${prev.length + 1}` }])}><Plus className="w-3.5 h-3.5 mr-1" /> Add Variant</Button>
            </div>
            {productVariants.length === 0 ? (
              <div className="text-center py-6 rounded-lg border border-dashed border-[#2a2a2a]">
                <Package className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No variants added yet</p>
                <p className="text-gray-600 text-xs">Click &quot;Add Variant&quot; to create size/variant options</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                {productVariants.map((v, idx) => (
                  <div key={idx} className="bg-[#0b0b0b] border border-[#2a2a2a] rounded-lg p-3 hover:border-[#59ff00]/20 transition-colors">
                    <div className="flex items-start gap-2">
                      <div className="flex-1 grid grid-cols-3 gap-2">
                        <div className="space-y-1"><Label className="text-gray-500 text-[10px] uppercase tracking-wider">Name</Label><Input className="bg-[#181818] border-[#2a2a2a] text-white h-8 text-sm" placeholder="e.g. Small" value={v.name} onChange={(e) => { const u = [...productVariants]; u[idx] = { ...u[idx], name: e.target.value }; setProductVariants(u) }} /></div>
                        <div className="space-y-1"><Label className="text-gray-500 text-[10px] uppercase tracking-wider">Price (₹)</Label><Input type="number" className="bg-[#181818] border-[#2a2a2a] text-white h-8 text-sm" placeholder="0" value={v.price} onChange={(e) => { const u = [...productVariants]; u[idx] = { ...u[idx], price: e.target.value }; setProductVariants(u) }} /></div>
                        <div className="space-y-1"><Label className="text-gray-500 text-[10px] uppercase tracking-wider">Stock</Label><Input type="number" className="bg-[#181818] border-[#2a2a2a] text-white h-8 text-sm" placeholder="0" value={v.stock} onChange={(e) => { const u = [...productVariants]; u[idx] = { ...u[idx], stock: e.target.value }; setProductVariants(u) }} /></div>
                      </div>
                      <Button type="button" variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 w-8 p-0 mt-4" onClick={() => setProductVariants(prev => prev.filter((_, i) => i !== idx))}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                    <div className="flex items-start gap-2 mt-2">
                      <div className="flex-1 grid grid-cols-4 gap-2">
                        <div className="space-y-1"><Label className="text-gray-500 text-[10px] uppercase tracking-wider">SKU</Label><Input className="bg-[#181818] border-[#2a2a2a] text-white h-8 text-sm" placeholder="SKU" value={v.sku} onChange={(e) => { const u = [...productVariants]; u[idx] = { ...u[idx], sku: e.target.value }; setProductVariants(u) }} /></div>
                        <div className="space-y-1"><Label className="text-gray-500 text-[10px] uppercase tracking-wider">Weight</Label><Input className="bg-[#181818] border-[#2a2a2a] text-white h-8 text-sm" placeholder="e.g. 5kg" value={v.weight} onChange={(e) => { const u = [...productVariants]; u[idx] = { ...u[idx], weight: e.target.value }; setProductVariants(u) }} /></div>
                        <div className="space-y-1"><Label className="text-gray-500 text-[10px] uppercase tracking-wider">Dimensions</Label><Input className="bg-[#181818] border-[#2a2a2a] text-white h-8 text-sm" placeholder="e.g. 600x400" value={v.dimensions} onChange={(e) => { const u = [...productVariants]; u[idx] = { ...u[idx], dimensions: e.target.value }; setProductVariants(u) }} /></div>
                        <div className="space-y-1"><Label className="text-gray-500 text-[10px] uppercase tracking-wider">Sort</Label><Input type="number" className="bg-[#181818] border-[#2a2a2a] text-white h-8 text-sm" value={v.sortOrder} onChange={(e) => { const u = [...productVariants]; u[idx] = { ...u[idx], sortOrder: parseInt(e.target.value) || 0 }; setProductVariants(u) }} /></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Switch checked={v.isDefault} onCheckedChange={(checked) => { const u = productVariants.map((variant, i) => ({ ...variant, isDefault: i === idx ? checked : false })); setProductVariants(u) }} />
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
              <div className="space-y-1.5"><Label className="text-gray-300 text-sm">Name *</Label><Input className="bg-[#0b0b0b] border-[#2a2a2a] text-white" placeholder="Category name" value={categoryForm.name} onChange={(e) => setCategoryForm(p => ({ ...p, name: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label className="text-gray-300 text-sm">Slug</Label><Input className="bg-[#0b0b0b] border-[#2a2a2a] text-white" placeholder="auto-generated from name" value={categoryForm.slug} onChange={(e) => setCategoryForm(p => ({ ...p, slug: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label className="text-gray-300 text-sm">Parent Category</Label>
                <Select value={categoryForm.parentId} onValueChange={(v) => setCategoryForm(p => ({ ...p, parentId: v }))}>
                  <SelectTrigger className="bg-[#0b0b0b] border-[#2a2a2a] text-white"><SelectValue placeholder="None (Top Level)" /></SelectTrigger>
                  <SelectContent className="bg-[#181818] border-[#2a2a2a]">
                    <SelectItem value="none" className="text-white focus:bg-[#59ff00]/10 focus:text-[#59ff00]">None (Top Level)</SelectItem>
                    {categories.filter((c: any) => c.id !== editCategory?.id).map((c: any) => (<SelectItem key={c.id} value={c.id} className="text-white focus:bg-[#59ff00]/10 focus:text-[#59ff00]">{c.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label className="text-gray-300 text-sm">Description</Label><Textarea className="bg-[#0b0b0b] border-[#2a2a2a] text-white" rows={3} placeholder="Category description..." value={categoryForm.description} onChange={(e) => setCategoryForm(p => ({ ...p, description: e.target.value }))} /></div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5"><Label className="text-gray-300 text-sm">Status</Label><Select value={categoryForm.status} onValueChange={(v) => setCategoryForm(p => ({ ...p, status: v }))}><SelectTrigger className="bg-[#0b0b0b] border-[#2a2a2a] text-white"><SelectValue /></SelectTrigger><SelectContent className="bg-[#181818] border-[#2a2a2a]"><SelectItem value="active" className="text-white focus:bg-[#59ff00]/10 focus:text-[#59ff00]">Active</SelectItem><SelectItem value="draft" className="text-white focus:bg-[#59ff00]/10 focus:text-[#59ff00]">Draft</SelectItem></SelectContent></Select></div>
                <div className="space-y-1.5"><Label className="text-gray-300 text-sm">Display Type</Label><Select value={categoryForm.displayType} onValueChange={(v) => setCategoryForm(p => ({ ...p, displayType: v }))}><SelectTrigger className="bg-[#0b0b0b] border-[#2a2a2a] text-white"><SelectValue /></SelectTrigger><SelectContent className="bg-[#181818] border-[#2a2a2a]"><SelectItem value="products" className="text-white focus:bg-[#59ff00]/10 focus:text-[#59ff00]">Products</SelectItem><SelectItem value="subcategories" className="text-white focus:bg-[#59ff00]/10 focus:text-[#59ff00]">Subcategories</SelectItem><SelectItem value="both" className="text-white focus:bg-[#59ff00]/10 focus:text-[#59ff00]">Both</SelectItem></SelectContent></Select></div>
                <div className="space-y-1.5"><Label className="text-gray-300 text-sm">Menu Order</Label><Input type="number" className="bg-[#0b0b0b] border-[#2a2a2a] text-white" value={categoryForm.menuOrder} onChange={(e) => setCategoryForm(p => ({ ...p, menuOrder: e.target.value }))} /></div>
              </div>
            </TabsContent>
            <TabsContent value="images" className="space-y-3 mt-3">
              <div className="space-y-1.5"><Label className="text-gray-300 text-sm">Image URL</Label><Input className="bg-[#0b0b0b] border-[#2a2a2a] text-white" placeholder="/uploads/image.jpg" value={categoryForm.image} onChange={(e) => setCategoryForm(p => ({ ...p, image: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label className="text-gray-300 text-sm">Thumbnail URL</Label><Input className="bg-[#0b0b0b] border-[#2a2a2a] text-white" placeholder="/uploads/thumbnail.jpg" value={categoryForm.thumbnail} onChange={(e) => setCategoryForm(p => ({ ...p, thumbnail: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label className="text-gray-300 text-sm">Banner Image URL</Label><Input className="bg-[#0b0b0b] border-[#2a2a2a] text-white" placeholder="/uploads/banner.jpg" value={categoryForm.bannerImage} onChange={(e) => setCategoryForm(p => ({ ...p, bannerImage: e.target.value }))} /></div>
            </TabsContent>
            <TabsContent value="seo" className="space-y-3 mt-3">
              <div className="space-y-1.5"><Label className="text-gray-300 text-sm">SEO Title</Label><Input className="bg-[#0b0b0b] border-[#2a2a2a] text-white" placeholder="SEO title for search engines" value={categoryForm.seoTitle} onChange={(e) => setCategoryForm(p => ({ ...p, seoTitle: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label className="text-gray-300 text-sm">SEO Description</Label><Textarea className="bg-[#0b0b0b] border-[#2a2a2a] text-white" rows={3} placeholder="Meta description for search engines..." value={categoryForm.seoDescription} onChange={(e) => setCategoryForm(p => ({ ...p, seoDescription: e.target.value }))} /></div>
            </TabsContent>
          </Tabs>
          <DialogFooter className="mt-4">
            <Button variant="ghost" onClick={() => setCategoryDialog(false)} className="text-gray-400 hover:text-white">Cancel</Button>
            <Button onClick={handleSaveCategory} className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90 font-semibold">{editCategory ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Category Confirmation */}
      <Dialog open={deleteCategoryDialog} onOpenChange={setDeleteCategoryDialog}>
        <DialogContent className="bg-[#181818] border-[#2a2a2a] text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white">Delete Category</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete &quot;{categoryToDelete?.name}&quot;? This action cannot be undone.
              {(categoryToDelete?._count?.products || 0) > 0 && (<span className="block mt-2 text-red-400 text-xs">This category has {categoryToDelete._count.products} product(s). Remove or reassign them first.</span>)}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setDeleteCategoryDialog(false); setCategoryToDelete(null) }} className="text-gray-400 hover:text-white">Cancel</Button>
            <Button onClick={() => categoryToDelete && handleDeleteCategory(categoryToDelete.id)} className="bg-red-500 text-white hover:bg-red-600 font-semibold" disabled={(categoryToDelete?._count?.products || 0) > 0}>Delete</Button>
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
                    <div><p className="text-white text-sm">{item.product?.name}</p><p className="text-gray-500 text-xs">Qty: {item.qty} × {fmt(item.price)}</p></div>
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
          <DialogHeader><DialogTitle className="text-white">Add Lead</DialogTitle><DialogDescription className="text-gray-400">Enter lead information</DialogDescription></DialogHeader>
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
              <div className="space-y-1.5"><Label className="text-gray-300 text-sm">Source</Label>
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
              <div className="space-y-1.5"><Label className="text-gray-300 text-sm">Assign To</Label>
                <Select value={leadForm.assignedTo} onValueChange={(v) => setLeadForm(p => ({ ...p, assignedTo: v }))}>
                  <SelectTrigger className="bg-[#0b0b0b] border-[#2a2a2a] text-white"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent className="bg-[#181818] border-[#2a2a2a]">
                    {employees.map((e: any) => (<SelectItem key={e.id} value={e.userId} className="text-white focus:bg-[#59ff00]/10 focus:text-[#59ff00]">{e.user?.name}</SelectItem>))}
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
          <DialogHeader><DialogTitle className="text-white">Lead Details</DialogTitle><DialogDescription className="text-gray-400">Manage lead information</DialogDescription></DialogHeader>
          {selectedLead && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#59ff00]/10 border border-[#59ff00]/30 flex items-center justify-center"><Users className="w-5 h-5 text-[#59ff00]" /></div>
                <div><p className="text-white font-bold text-lg">{selectedLead.name}</p>{selectedLead.company && <p className="text-gray-400 text-sm">{selectedLead.company}</p>}</div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {selectedLead.phone && <div className="flex items-center gap-2 text-gray-300"><Phone className="w-3.5 h-3.5 text-gray-500" />{selectedLead.phone}</div>}
                {selectedLead.email && <div className="flex items-center gap-2 text-gray-300"><Mail className="w-3.5 h-3.5 text-gray-500" />{selectedLead.email}</div>}
                {selectedLead.city && <div className="flex items-center gap-2 text-gray-300"><MapPin className="w-3.5 h-3.5 text-gray-500" />{selectedLead.city}</div>}
                {selectedLead.source && <div className="flex items-center gap-2 text-gray-300"><TrendingUp className="w-3.5 h-3.5 text-gray-500" />{selectedLead.source}</div>}
              </div>
              {selectedLead.requirement && (<div className="p-3 rounded-lg bg-[#0b0b0b] border border-[#2a2a2a]"><p className="text-gray-500 text-xs mb-1">Requirement</p><p className="text-gray-300 text-sm">{selectedLead.requirement}</p></div>)}
              <Separator className="bg-[#2a2a2a]" />
              <div className="space-y-2">
                <Label className="text-gray-300 text-sm">Update Status</Label>
                <Select value={selectedLead.status} onValueChange={(v) => handleUpdateLeadStatus(selectedLead.id, v)}>
                  <SelectTrigger className="bg-[#0b0b0b] border-[#2a2a2a] text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#181818] border-[#2a2a2a]">
                    {['new', 'contacted', 'quotation_sent', 'negotiation', 'won', 'lost'].map((s) => (<SelectItem key={s} value={s} className="text-white focus:bg-[#59ff00]/10 focus:text-[#59ff00] capitalize">{s.replace('_', ' ')}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              {selectedLead.quotations?.length > 0 && (
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Quotations</p>
                  {selectedLead.quotations.map((q: any) => (
                    <div key={q.id} className="flex items-center justify-between py-2 border-b border-[#2a2a2a]">
                      <div><p className="text-white text-sm font-mono">{q.quotationNumber}</p><p className="text-gray-500 text-xs">{fmtDate(q.createdAt)}</p></div>
                      <div className="text-right"><p className="text-[#59ff00] text-sm font-semibold">{fmt(q.amount)}</p><Badge className={q.status === 'accepted' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : q.status === 'rejected' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-gray-500/20 text-gray-400 border-gray-500/30'}>{q.status}</Badge></div>
                    </div>
                  ))}
                </div>
              )}
              <Button onClick={onOpenQuotationFromLead} className="w-full bg-[#59ff00]/10 text-[#59ff00] hover:bg-[#59ff00]/20 border border-[#59ff00]/30 font-semibold"><FileText className="w-4 h-4 mr-2" /> Create Quotation</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Quotation Dialog */}
      <Dialog open={quotationDialog} onOpenChange={setQuotationDialog}>
        <DialogContent className="bg-[#181818] border-[#2a2a2a] text-white max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">{editQuotation ? 'Edit Quotation' : 'Create Quotation'}</DialogTitle>
            <DialogDescription className="text-gray-400">{editQuotation ? `Editing ${editQuotation.quotationNumber}` : (selectedLead ? `For ${selectedLead.name}` : 'Fill in the details below')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div><h3 className="text-[#59ff00] text-sm font-semibold mb-2 flex items-center gap-2"><Palette className="w-4 h-4" /> Template Style</h3>
              <div className="grid grid-cols-4 gap-2">
                {(['modern', 'minimal', 'corporate', 'premium'] as const).map(t => (
                  <button key={t} onClick={() => setQuotationTemplate(t)} className={`p-2 rounded-lg border transition-all text-center ${quotationTemplate === t ? 'border-[#59ff00] bg-[#59ff00]/10 text-[#59ff00]' : 'border-[#2a2a2a] bg-[#0b0b0b] text-gray-400 hover:border-gray-600'}`}>
                    <div className="text-xs font-semibold capitalize">{t}</div>
                    <div className="text-[9px] mt-0.5 opacity-60">{t === 'modern' ? 'Bold & vibrant' : t === 'minimal' ? 'Clean & simple' : t === 'corporate' ? 'Professional' : 'Luxury feel'}</div>
                  </button>
                ))}
              </div>
            </div>
            <details className="group">
              <summary className="text-sm text-gray-400 cursor-pointer hover:text-white flex items-center gap-2"><Building2 className="w-4 h-4" /> Company Customization<ChevronDown className="w-3 h-3 transition-transform group-open:rotate-180" /></summary>
              <div className="mt-2 grid grid-cols-2 gap-3 p-3 bg-[#0b0b0b] border border-[#2a2a2a] rounded-lg">
                <div className="space-y-1"><Label className="text-gray-400 text-xs">Company Name</Label><Input className="bg-[#181818] border-[#2a2a2a] text-white h-9 text-sm" value={companyCustomization.name} onChange={e => setCompanyCustomization(c => ({ ...c, name: e.target.value }))} /></div>
                <div className="space-y-1"><Label className="text-gray-400 text-xs">Address</Label><Input className="bg-[#181818] border-[#2a2a2a] text-white h-9 text-sm" value={companyCustomization.address} onChange={e => setCompanyCustomization(c => ({ ...c, address: e.target.value }))} /></div>
                <div className="space-y-1"><Label className="text-gray-400 text-xs">Contact</Label><Input className="bg-[#181818] border-[#2a2a2a] text-white h-9 text-sm" value={companyCustomization.contact} onChange={e => setCompanyCustomization(c => ({ ...c, contact: e.target.value }))} /></div>
                <div className="space-y-1"><Label className="text-gray-400 text-xs">Email</Label><Input className="bg-[#181818] border-[#2a2a2a] text-white h-9 text-sm" value={companyCustomization.email} onChange={e => setCompanyCustomization(c => ({ ...c, email: e.target.value }))} /></div>
                <div className="space-y-1"><Label className="text-gray-400 text-xs">Website</Label><Input className="bg-[#181818] border-[#2a2a2a] text-white h-9 text-sm" value={companyCustomization.website} onChange={e => setCompanyCustomization(c => ({ ...c, website: e.target.value }))} /></div>
                <div className="space-y-1"><Label className="text-gray-400 text-xs">GST Number</Label><Input className="bg-[#181818] border-[#2a2a2a] text-white h-9 text-sm" value={companyCustomization.gstNumber} onChange={e => setCompanyCustomization(c => ({ ...c, gstNumber: e.target.value }))} /></div>
                <div className="space-y-1"><Label className="text-gray-400 text-xs">Brand Color</Label><div className="flex gap-2"><input type="color" value={companyCustomization.brandColor} onChange={e => setCompanyCustomization(c => ({ ...c, brandColor: e.target.value }))} className="w-10 h-9 rounded cursor-pointer" /><Input className="flex-1 bg-[#181818] border-[#2a2a2a] text-white h-9 text-sm" value={companyCustomization.brandColor} onChange={e => setCompanyCustomization(c => ({ ...c, brandColor: e.target.value }))} /></div></div>
                <div className="space-y-1"><Label className="text-gray-400 text-xs">Footer Notes</Label><Input className="bg-[#181818] border-[#2a2a2a] text-white h-9 text-sm" value={companyCustomization.footerNotes} onChange={e => setCompanyCustomization(c => ({ ...c, footerNotes: e.target.value }))} /></div>
              </div>
            </details>
            <div><h3 className="text-[#59ff00] text-sm font-semibold mb-2">Customer Details</h3>
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
            <div>
              <div className="flex items-center justify-between mb-2"><h3 className="text-[#59ff00] text-sm font-semibold">Line Items</h3>
                <Button variant="ghost" size="sm" onClick={() => setQuotationItems([...quotationItems, { desc: '', hsn: '', qty: '1', unit: 'Nos', rate: '', discount: '0', gstPercent: '18' }])} className="text-[#59ff00] hover:bg-[#59ff00]/10 h-7 text-xs"><Plus className="w-3 h-3 mr-1" /> Add Item</Button>
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
                    <div className="col-span-1 flex items-center justify-center"><Button variant="ghost" size="sm" onClick={() => setQuotationItems(quotationItems.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 w-8 p-0" disabled={quotationItems.length <= 1}><Trash2 className="w-3.5 h-3.5" /></Button></div>
                  </div>
                ))}
              </div>
              {(() => {
                const t = computeQuotationTotals()
                return (
                  <div className="flex justify-end mt-3">
                    <div className="w-80 bg-[#0b0b0b] border border-[#2a2a2a] rounded-lg p-3 space-y-1.5">
                      <div className="flex justify-between text-xs"><span className="text-gray-400">Subtotal</span><span className="text-gray-300">{fmt(t.subtotal)}</span></div>
                      {t.totalDiscount > 0 && <div className="flex justify-between text-xs"><span className="text-gray-400">Discount</span><span className="text-red-400">-{fmt(t.totalDiscount)}</span></div>}
                      <div className="flex justify-between text-xs"><span className="text-gray-400">After Discount</span><span className="text-gray-300">{fmt(t.afterDiscount)}</span></div>
                      <Separator className="bg-[#2a2a2a] my-1" />
                      <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider">GST Breakdown</p>
                      <div className="flex justify-between text-xs"><span className="text-gray-400">CGST (50% of {fmt(t.totalGst)})</span><span className="text-gray-300">{fmt(t.cgst)}</span></div>
                      <div className="flex justify-between text-xs"><span className="text-gray-400">SGST (50% of {fmt(t.totalGst)})</span><span className="text-gray-300">{fmt(t.sgst)}</span></div>
                      <div className="flex justify-between text-xs"><span className="text-gray-400">IGST (if applicable)</span><span className="text-gray-300">{fmt(0)}</span></div>
                      <div className="flex justify-between text-xs"><span className="text-gray-400">Total GST</span><span className="text-gray-300">{fmt(t.totalGst)}</span></div>
                      <div className="flex justify-between text-sm pt-2 border-t border-[#2a2a2a]"><span className="text-white font-bold">Grand Total</span><span className="text-[#59ff00] font-bold text-lg">{fmt(t.grandTotal)}</span></div>
                    </div>
                  </div>
                )
              })()}
            </div>
            <Separator className="bg-[#2a2a2a]" />
            <div><h3 className="text-[#59ff00] text-sm font-semibold mb-2">Additional Details</h3>
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
            <Button variant="outline" onClick={() => window.print()} className="border-[#2a2a2a] text-gray-300 hover:text-white"><Printer className="w-4 h-4 mr-2" /> Print</Button>
            <Button onClick={handleSaveQuotation} className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90 font-semibold">{editQuotation ? <><Edit className="w-4 h-4 mr-2" /> Update Quotation</> : <><FileText className="w-4 h-4 mr-2" /> Create Quotation</>}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Employee Dialog */}
      <Dialog open={employeeDialog} onOpenChange={setEmployeeDialog}>
        <DialogContent className="bg-[#181818] border-[#2a2a2a] text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-white">Add Employee</DialogTitle><DialogDescription className="text-gray-400">Enter employee details</DialogDescription></DialogHeader>
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
          <DialogHeader><DialogTitle className="text-white">Add AMC Contract</DialogTitle><DialogDescription className="text-gray-400">Enter contract details</DialogDescription></DialogHeader>
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
          <DialogHeader><DialogTitle className="text-white">Add Service Request</DialogTitle><DialogDescription className="text-gray-400">Enter service request details</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label className="text-gray-300 text-sm">Customer ID *</Label><Input className="bg-[#0b0b0b] border-[#2a2a2a] text-white" value={serviceForm.customerId} onChange={(e) => setServiceForm(p => ({ ...p, customerId: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label className="text-gray-300 text-sm">Contract ID</Label><Input className="bg-[#0b0b0b] border-[#2a2a2a] text-white" value={serviceForm.contractId} onChange={(e) => setServiceForm(p => ({ ...p, contractId: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label className="text-gray-300 text-sm">Issue *</Label><Textarea className="bg-[#0b0b0b] border-[#2a2a2a] text-white" rows={3} value={serviceForm.issue} onChange={(e) => setServiceForm(p => ({ ...p, issue: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-gray-300 text-sm">Priority</Label>
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
    </>
  )
}
