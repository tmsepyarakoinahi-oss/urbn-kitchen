'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Eye, Search, ChevronDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { fmt, fmtDate, paymentBadge, orderBadge } from './types'

interface OrdersTabProps {
  orders: any[]
  orderStatusFilter: string
  setOrderStatusFilter: (v: string) => void
  searchQueries: Record<string, string>
  handleSearch: (key: string, value: string) => void
  openOrderDetail: (order: any) => void
  handleUpdateOrderStatus: (id: string, orderStatus: string) => void
}

export default function OrdersTab({
  orders, orderStatusFilter, setOrderStatusFilter, searchQueries, handleSearch,
  openOrderDetail, handleUpdateOrderStatus,
}: OrdersTabProps) {
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
