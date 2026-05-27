'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Plus, Search, Edit, Trash2, Check, Package } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { fmt, statusBadgeCls } from './types'

interface ProductsTabProps {
  products: any[]
  categories: any[]
  searchQueries: Record<string, string>
  productCategoryFilter: string
  setProductCategoryFilter: (v: string) => void
  handleSearch: (key: string, value: string) => void
  openNewProduct: () => void
  openEditProduct: (p: any) => void
  handleDeleteProduct: (id: string) => void
}

export default function ProductsTab({
  products, categories, searchQueries, productCategoryFilter,
  setProductCategoryFilter, handleSearch, openNewProduct, openEditProduct, handleDeleteProduct,
}: ProductsTabProps) {
  return (
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
}
