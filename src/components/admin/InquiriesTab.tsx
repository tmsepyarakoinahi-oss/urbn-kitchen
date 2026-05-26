'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { fmtDate } from './types'
import { toast } from 'sonner'

interface InquiriesTabProps {
  inquiryList: any[]
  setInquiryList: React.Dispatch<React.SetStateAction<any[]>>
}

export default function InquiriesTab({ inquiryList, setInquiryList }: InquiriesTabProps) {
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
