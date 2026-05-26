'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Plus, Eye, ChevronDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { leadBadge } from './types'

interface LeadsTabProps {
  leads: any[]
  setLeadForm: React.Dispatch<React.SetStateAction<any>>
  setLeadDialog: (v: boolean) => void
  openLeadDetail: (lead: any) => void
  handleUpdateLeadStatus: (id: string, status: string) => void
}

export default function LeadsTab({ leads, setLeadForm, setLeadDialog, openLeadDetail, handleUpdateLeadStatus }: LeadsTabProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white text-xl font-bold">Leads</h2>
        <Button onClick={() => { setLeadForm({ name: '', company: '', phone: '', email: '', city: '', requirement: '', message: '', source: 'website', assignedTo: '' }); setLeadDialog(true) }} className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90 font-semibold"><Plus className="w-4 h-4 mr-1" /> Add Lead</Button>
      </div>
      <Card className="bg-[#181818] border-[#2a2a2a]">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow className="border-[#2a2a2a] hover:bg-transparent"><TableHead className="text-gray-400">Name</TableHead><TableHead className="text-gray-400">Company</TableHead><TableHead className="text-gray-400">City</TableHead><TableHead className="text-gray-400">Source</TableHead><TableHead className="text-gray-400">Status</TableHead><TableHead className="text-gray-400">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {leads.map((l: any) => (
                  <TableRow key={l.id} className="border-[#2a2a2a] hover:bg-white/5">
                    <TableCell className="text-white text-sm">{l.name}</TableCell>
                    <TableCell className="text-gray-300 text-sm">{l.company || '-'}</TableCell>
                    <TableCell className="text-gray-300 text-sm">{l.city || '-'}</TableCell>
                    <TableCell className="text-gray-300 text-sm capitalize">{l.source || '-'}</TableCell>
                    <TableCell><Badge className={`text-[10px] ${leadBadge(l.status)}`}>{l.status.replace('_', ' ')}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => openLeadDetail(l)} className="text-blue-400 hover:text-blue-300 h-8 w-8 p-0"><Eye className="w-3.5 h-3.5" /></Button>
                        <Select onValueChange={(v) => handleUpdateLeadStatus(l.id, v)}>
                          <SelectTrigger className="h-8 w-8 p-0 border-0 bg-transparent text-gray-400"><ChevronDown className="w-3.5 h-3.5" /></SelectTrigger>
                          <SelectContent className="bg-[#181818] border-[#2a2a2a]">
                            {['new', 'contacted', 'quotation_sent', 'negotiation', 'won', 'lost'].map(s => <SelectItem key={s} value={s} className="text-white capitalize">{s.replace('_', ' ')}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {leads.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-gray-500 py-8">No leads found</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
