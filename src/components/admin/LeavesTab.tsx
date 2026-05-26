'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { fmtDate } from './types'
import { toast } from 'sonner'

interface LeavesTabProps {
  leaveList: any[]
  leaveFilter: string
  setLeaveFilter: (v: string) => void
}

export default function LeavesTab({ leaveList, leaveFilter, setLeaveFilter }: LeavesTabProps) {
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
