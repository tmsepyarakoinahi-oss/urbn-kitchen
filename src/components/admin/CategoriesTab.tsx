'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Plus, Edit, Trash2, Grid3X3 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { statusBadgeCls } from './types'

interface CategoriesTabProps {
  categories: any[]
  openNewCategory: () => void
  openEditCategory: (c: any) => void
  openDeleteCategory: (c: any) => void
}

export default function CategoriesTab({ categories, openNewCategory, openEditCategory, openDeleteCategory }: CategoriesTabProps) {
  return (
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
}
