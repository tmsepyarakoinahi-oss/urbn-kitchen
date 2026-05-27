'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Plus, ChevronDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { statusBadgeCls, priorityBadge } from './types'

interface ServiceTabProps {
  serviceRequests: any[]
  setServiceForm: React.Dispatch<React.SetStateAction<any>>
  setServiceDialog: (v: boolean) => void
  handleUpdateServiceRequest: (id: string, data: any) => void
}

export default function ServiceTab({ serviceRequests, setServiceForm, setServiceDialog, handleUpdateServiceRequest }: ServiceTabProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white text-xl font-bold">Service Requests</h2>
        <Button onClick={() => { setServiceForm({ customerId: '', contractId: '', issue: '', priority: 'medium', assignedTechnician: '' }); setServiceDialog(true) }} className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90 font-semibold"><Plus className="w-4 h-4 mr-1" /> New Request</Button>
      </div>
      <Card className="bg-[#181818] border-[#2a2a2a]">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow className="border-[#2a2a2a] hover:bg-transparent"><TableHead className="text-gray-400">Customer</TableHead><TableHead className="text-gray-400">Issue</TableHead><TableHead className="text-gray-400">Priority</TableHead><TableHead className="text-gray-400">Assigned To</TableHead><TableHead className="text-gray-400">Status</TableHead><TableHead className="text-gray-400">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {serviceRequests.map((s: any) => (
                  <TableRow key={s.id} className="border-[#2a2a2a] hover:bg-white/5">
                    <TableCell className="text-white text-sm">{s.customer?.name || '-'}</TableCell>
                    <TableCell className="text-gray-300 text-sm max-w-[200px] truncate">{s.issue}</TableCell>
                    <TableCell><Badge className={`text-[10px] ${priorityBadge(s.priority)}`}>{s.priority}</Badge></TableCell>
                    <TableCell className="text-gray-300 text-sm">{s.technician?.name || '-'}</TableCell>
                    <TableCell><Badge className={`text-[10px] ${statusBadgeCls(s.status)}`}>{s.status.replace('_', ' ')}</Badge></TableCell>
                    <TableCell>
                      <Select onValueChange={(v) => handleUpdateServiceRequest(s.id, { status: v })}>
                        <SelectTrigger className="h-8 w-8 p-0 border-0 bg-transparent text-gray-400"><ChevronDown className="w-3.5 h-3.5" /></SelectTrigger>
                        <SelectContent className="bg-[#181818] border-[#2a2a2a]">
                          {['open', 'in_progress', 'resolved', 'closed'].map(st => <SelectItem key={st} value={st} className="text-white">{st.replace('_', ' ')}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
                {serviceRequests.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-gray-500 py-8">No service requests</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
