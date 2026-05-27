'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Plus, Eye, ChevronDown, UserPlus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { leadBadge } from './types'
import { toast } from 'sonner'

interface LeadsTabProps {
  leads: any[]
  employees: any[]
  setLeadForm: React.Dispatch<React.SetStateAction<any>>
  setLeadDialog: (v: boolean) => void
  openLeadDetail: (lead: any) => void
  handleUpdateLeadStatus: (id: string, status: string) => void
  onLeadReassigned?: () => void
}

export default function LeadsTab({ leads, employees, setLeadForm, setLeadDialog, openLeadDetail, handleUpdateLeadStatus, onLeadReassigned }: LeadsTabProps) {
  const [reassignDialog, setReassignDialog] = React.useState(false)
  const [reassignLead, setReassignLead] = React.useState<any>(null)
  const [reassignTo, setReassignTo] = React.useState('')
  const [reassigning, setReassigning] = React.useState(false)

  const getEmployeeName = (lead: any) => {
    if (lead.assignee?.name) return lead.assignee.name
    if (lead.assignedTo) {
      const emp = employees.find((e: any) => e.userId === lead.assignedTo)
      if (emp?.user?.name) return emp.user.name
    }
    return 'Unassigned'
  }

  const handleOpenReassign = (lead: any) => {
    setReassignLead(lead)
    setReassignTo(lead.assignedTo || '__none__')
    setReassignDialog(true)
  }

  const handleReassign = async () => {
    if (!reassignLead) return
    setReassigning(true)
    try {
      const newAssignedTo = reassignTo === '__none__' ? null : reassignTo
      const res = await fetch(`/api/leads/${reassignLead.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedTo: newAssignedTo }),
      })
      const json = await res.json()
      if (json.status) {
        toast.success(newAssignedTo ? 'Lead reassigned successfully' : 'Lead unassigned')
        setReassignDialog(false)
        setReassignLead(null)
        if (onLeadReassigned) onLeadReassigned()
      } else {
        toast.error('Failed to reassign lead')
      }
    } catch (e) {
      console.error(e)
      toast.error('Failed to reassign lead')
    } finally {
      setReassigning(false)
    }
  }

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
              <TableHeader><TableRow className="border-[#2a2a2a] hover:bg-transparent"><TableHead className="text-gray-400">Name</TableHead><TableHead className="text-gray-400">Company</TableHead><TableHead className="text-gray-400">City</TableHead><TableHead className="text-gray-400">Source</TableHead><TableHead className="text-gray-400">Assigned To</TableHead><TableHead className="text-gray-400">Status</TableHead><TableHead className="text-gray-400">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {leads.map((l: any) => (
                  <TableRow key={l.id} className="border-[#2a2a2a] hover:bg-white/5">
                    <TableCell className="text-white text-sm">{l.name}</TableCell>
                    <TableCell className="text-gray-300 text-sm">{l.company || '-'}</TableCell>
                    <TableCell className="text-gray-300 text-sm">{l.city || '-'}</TableCell>
                    <TableCell className="text-gray-300 text-sm capitalize">{l.source || '-'}</TableCell>
                    <TableCell className="text-gray-300 text-sm">
                      <div className="flex items-center gap-1">
                        <span>{getEmployeeName(l)}</span>
                        <Button size="sm" variant="ghost" onClick={() => handleOpenReassign(l)} className="text-[#59ff00] hover:text-[#59ff00]/80 hover:bg-[#59ff00]/10 h-6 w-6 p-0 ml-1" title="Reassign lead">
                          <UserPlus className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
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
                {leads.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-gray-500 py-8">No leads found</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Reassign Dialog */}
      <Dialog open={reassignDialog} onOpenChange={setReassignDialog}>
        <DialogContent className="bg-[#181818] border-[#2a2a2a] text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white">Reassign Lead</DialogTitle>
            <DialogDescription className="text-gray-400">
              Change the employee assigned to &quot;{reassignLead?.name}&quot;
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-gray-300 text-sm">Assign To</Label>
              <Select value={reassignTo} onValueChange={setReassignTo}>
                <SelectTrigger className="bg-[#0b0b0b] border-[#2a2a2a] text-white">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent className="bg-[#181818] border-[#2a2a2a]">
                  <SelectItem value="__none__" className="text-gray-400 focus:bg-[#59ff00]/10 focus:text-[#59ff00]">Unassigned</SelectItem>
                  {employees.map((e: any) => (
                    <SelectItem key={e.id} value={e.userId} className="text-white focus:bg-[#59ff00]/10 focus:text-[#59ff00]">{e.user?.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setReassignDialog(false)} className="text-gray-400 hover:text-white">Cancel</Button>
            <Button onClick={handleReassign} disabled={reassigning} className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90 font-semibold">
              {reassigning ? 'Reassigning...' : 'Reassign'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
