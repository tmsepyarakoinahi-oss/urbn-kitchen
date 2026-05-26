'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import {
  IndianRupee, ShoppingCart, Users, Package, TrendingUp, AlertTriangle, Shield,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend,
} from 'recharts'
import {
  CHART_COLORS, fmt, orderBadge, leadBadge, CustomTooltip,
} from './types'

interface DashboardTabProps {
  dashboardData: any
  openOrderDetail: (order: any) => void
  openLeadDetail: (lead: any) => void
}

export default function DashboardTab({ dashboardData, openOrderDetail, openLeadDetail }: DashboardTabProps) {
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
