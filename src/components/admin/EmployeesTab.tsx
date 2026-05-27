'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { fmt, fmtDate, statusBadgeCls } from './types'
import { toast } from 'sonner'

interface EmployeesTabProps {
  employees: any[]
  empEditDialog: boolean
  setEmpEditDialog: (v: boolean) => void
  editEmp: any
  setEditEmp: (v: any) => void
  empEditForm: any
  setEmpEditForm: React.Dispatch<React.SetStateAction<any>>
  employeeDialog: boolean
  setEmployeeDialog: (v: boolean) => void
  employeeForm: any
  setEmployeeForm: React.Dispatch<React.SetStateAction<any>>
  doFetchEmployees: () => void
}

export default function EmployeesTab({
  employees, empEditDialog, setEmpEditDialog, editEmp, setEditEmp,
  empEditForm, setEmpEditForm, employeeDialog, setEmployeeDialog,
  employeeForm, setEmployeeForm, doFetchEmployees,
}: EmployeesTabProps) {
  const openNewEmp = () => { setEditEmp(null); setEmpEditForm({ name: '', email: '', phone: '', password: '', department: '', designation: '', salary: '', joiningDate: '', status: 'active' }); setEmpEditDialog(true) }
  const openEditEmp = (e: any) => { setEditEmp(e); setEmpEditForm({ name: e.user?.name || '', email: e.user?.email || '', phone: e.user?.phone || '', password: '', department: e.department || '', designation: e.designation || '', salary: String(e.salary || ''), joiningDate: e.joiningDate ? new Date(e.joiningDate).toISOString().split('T')[0] : '', status: e.status || 'active' }); setEmpEditDialog(true) }

  const handleSaveEmp = async () => {
    try {
      if (editEmp) {
        const res = await fetch(`/api/employees/${editEmp.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ department: empEditForm.department, designation: empEditForm.designation, salary: Number(empEditForm.salary), status: empEditForm.status }) })
        const json = await res.json()
        if (json.status) { setEmpEditDialog(false); doFetchEmployees(); toast.success('Employee updated') } else { toast.error(json.message || 'Failed') }
      } else {
        const res = await fetch('/api/employees', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(empEditForm) })
        const json = await res.json()
        if (json.status) { setEmpEditDialog(false); doFetchEmployees(); toast.success('Employee created') } else { toast.error(json.message || 'Failed') }
      }
    } catch (e) { console.error(e); toast.error('Failed to save employee') }
  }

  const handleDeleteEmp = async (id: string) => {
    if (!confirm('Delete this employee?')) return
    try { await fetch(`/api/employees/${id}`, { method: 'DELETE' }); doFetchEmployees(); toast.success('Employee deleted') } catch (e) { toast.error('Failed') }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white text-xl font-bold">Employees</h2>
        <Button onClick={openNewEmp} className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90 font-semibold"><Plus className="w-4 h-4 mr-1" /> Add Employee</Button>
      </div>
      <Card className="bg-[#181818] border-[#2a2a2a]">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow className="border-[#2a2a2a] hover:bg-transparent"><TableHead className="text-gray-400">Name</TableHead><TableHead className="text-gray-400">Department</TableHead><TableHead className="text-gray-400">Designation</TableHead><TableHead className="text-gray-400">Salary</TableHead><TableHead className="text-gray-400">Join Date</TableHead><TableHead className="text-gray-400">Status</TableHead><TableHead className="text-gray-400">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {employees.map((e: any) => (
                  <TableRow key={e.id} className="border-[#2a2a2a] hover:bg-white/5">
                    <TableCell className="text-white text-sm">{e.user?.name || '-'}</TableCell>
                    <TableCell className="text-gray-300 text-sm">{e.department}</TableCell>
                    <TableCell className="text-gray-300 text-sm">{e.designation}</TableCell>
                    <TableCell className="text-[#59ff00] text-sm font-semibold">{fmt(e.salary)}</TableCell>
                    <TableCell className="text-gray-400 text-sm">{fmtDate(e.joiningDate)}</TableCell>
                    <TableCell><Badge className={`text-[10px] ${statusBadgeCls(e.status)}`}>{e.status}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => openEditEmp(e)} className="text-blue-400 h-8 w-8 p-0"><Edit className="w-3.5 h-3.5" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteEmp(e.id)} className="text-red-400 h-8 w-8 p-0"><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {employees.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-gray-500 py-8">No employees found</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <Dialog open={empEditDialog} onOpenChange={setEmpEditDialog}>
        <DialogContent className="bg-[#181818] border-[#2a2a2a] text-white max-w-md">
          <DialogHeader><DialogTitle>{editEmp ? 'Edit Employee' : 'Add Employee'}</DialogTitle><DialogDescription>Fill in employee details</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-gray-400 text-xs">Name</Label><Input value={empEditForm.name} onChange={(e) => setEmpEditForm(f => ({ ...f, name: e.target.value }))} disabled={!!editEmp} className="bg-[#0b0b0b] border-[#2a2a2a] text-white" /></div>
            <div><Label className="text-gray-400 text-xs">Email</Label><Input value={empEditForm.email} onChange={(e) => setEmpEditForm(f => ({ ...f, email: e.target.value }))} disabled={!!editEmp} className="bg-[#0b0b0b] border-[#2a2a2a] text-white" /></div>
            {!editEmp && <div><Label className="text-gray-400 text-xs">Password</Label><Input type="password" value={empEditForm.password} onChange={(e) => setEmpEditForm(f => ({ ...f, password: e.target.value }))} className="bg-[#0b0b0b] border-[#2a2a2a] text-white" /></div>}
            <div><Label className="text-gray-400 text-xs">Department</Label><Input value={empEditForm.department} onChange={(e) => setEmpEditForm(f => ({ ...f, department: e.target.value }))} className="bg-[#0b0b0b] border-[#2a2a2a] text-white" /></div>
            <div><Label className="text-gray-400 text-xs">Designation</Label><Input value={empEditForm.designation} onChange={(e) => setEmpEditForm(f => ({ ...f, designation: e.target.value }))} className="bg-[#0b0b0b] border-[#2a2a2a] text-white" /></div>
            <div><Label className="text-gray-400 text-xs">Salary</Label><Input type="number" value={empEditForm.salary} onChange={(e) => setEmpEditForm(f => ({ ...f, salary: e.target.value }))} className="bg-[#0b0b0b] border-[#2a2a2a] text-white" /></div>
            <div><Label className="text-gray-400 text-xs">Joining Date</Label><Input type="date" value={empEditForm.joiningDate} onChange={(e) => setEmpEditForm(f => ({ ...f, joiningDate: e.target.value }))} className="bg-[#0b0b0b] border-[#2a2a2a] text-white" /></div>
            {editEmp && <div><Label className="text-gray-400 text-xs">Status</Label><Select value={empEditForm.status} onValueChange={(v) => setEmpEditForm(f => ({ ...f, status: v }))}><SelectTrigger className="bg-[#0b0b0b] border-[#2a2a2a] text-white"><SelectValue /></SelectTrigger><SelectContent className="bg-[#181818] border-[#2a2a2a]"><SelectItem value="active" className="text-white">Active</SelectItem><SelectItem value="on_leave" className="text-white">On Leave</SelectItem><SelectItem value="terminated" className="text-white">Terminated</SelectItem></SelectContent></Select></div>}
          </div>
          <DialogFooter><Button variant="ghost" onClick={() => setEmpEditDialog(false)} className="text-gray-400">Cancel</Button><Button onClick={handleSaveEmp} className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90">{editEmp ? 'Update' : 'Create'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
