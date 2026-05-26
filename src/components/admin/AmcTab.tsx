'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { fmt, fmtDate, statusBadgeCls } from './types'

interface AmcTabProps {
  amcContracts: any[]
  setAmcForm: React.Dispatch<React.SetStateAction<any>>
  setAmcDialog: (v: boolean) => void
}

export default function AmcTab({ amcContracts, setAmcForm, setAmcDialog }: AmcTabProps) {
  return (
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
}
