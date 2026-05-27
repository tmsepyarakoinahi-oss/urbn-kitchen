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
import { statusBadgeCls } from './types'
import { toast } from 'sonner'

interface CustomersTabProps {
  userList: any[]
  roleList: any[]
  userDialog: boolean
  setUserDialog: (v: boolean) => void
  editUser: any
  setEditUser: (v: any) => void
  userForm: any
  setUserForm: React.Dispatch<React.SetStateAction<any>>
  roleFilter: string
  setRoleFilter: (v: string) => void
  doFetchUsers: () => void
}

export default function CustomersTab({
  userList, roleList, userDialog, setUserDialog, editUser, setEditUser,
  userForm, setUserForm, roleFilter, setRoleFilter, doFetchUsers,
}: CustomersTabProps) {
  const openNewUser = () => { setEditUser(null); setUserForm({ name: '', email: '', phone: '', password: '', roleId: '', status: 'active' }); setUserDialog(true) }
  const openEditUser = (u: any) => { setEditUser(u); setUserForm({ name: u.name, email: u.email, phone: u.phone || '', password: '', roleId: u.roleId, status: u.status }); setUserDialog(true) }

  const handleSaveUser = async () => {
    try {
      if (editUser) {
        const body: any = { name: userForm.name, email: userForm.email, phone: userForm.phone, status: userForm.status, roleId: userForm.roleId }
        if (userForm.password) body.password = userForm.password
        const res = await fetch(`/api/users/${editUser.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        const json = await res.json()
        if (json.status) { setUserDialog(false); doFetchUsers(); toast.success('User updated') } else { toast.error(json.message || 'Failed') }
      } else {
        const res = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(userForm) })
        const json = await res.json()
        if (json.status) { setUserDialog(false); doFetchUsers(); toast.success('User created') } else { toast.error(json.message || 'Failed') }
      }
    } catch (e) { console.error(e); toast.error('Failed to save user') }
  }

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Delete this user?')) return
    try { await fetch(`/api/users/${id}`, { method: 'DELETE' }); doFetchUsers(); toast.success('User deleted') } catch (e) { toast.error('Failed to delete') }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white text-xl font-bold">Users & Customers</h2>
        <Button onClick={openNewUser} className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90 font-semibold"><Plus className="w-4 h-4 mr-1" /> Add User</Button>
      </div>
      <div className="flex gap-2">
        {['all', 'admin', 'manager', 'employee', 'customer'].map(r => (
          <Button key={r} variant={roleFilter === r ? 'default' : 'ghost'} size="sm" onClick={() => setRoleFilter(r)}
            className={roleFilter === r ? 'bg-[#59ff00] text-black' : 'text-gray-400 hover:text-white capitalize'}>{r === 'all' ? 'All' : r}</Button>
        ))}
      </div>
      <Card className="bg-[#181818] border-[#2a2a2a]">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow className="border-[#2a2a2a] hover:bg-transparent"><TableHead className="text-gray-400">Name</TableHead><TableHead className="text-gray-400">Email</TableHead><TableHead className="text-gray-400">Phone</TableHead><TableHead className="text-gray-400">Role</TableHead><TableHead className="text-gray-400">Status</TableHead><TableHead className="text-gray-400">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {userList.map((u: any) => (
                  <TableRow key={u.id} className="border-[#2a2a2a] hover:bg-white/5">
                    <TableCell className="text-white text-sm">{u.name}</TableCell>
                    <TableCell className="text-gray-300 text-sm">{u.email}</TableCell>
                    <TableCell className="text-gray-300 text-sm">{u.phone || '-'}</TableCell>
                    <TableCell><Badge className="bg-[#59ff00]/20 text-[#59ff00] border-[#59ff00]/30 text-[10px]">{u.role?.roleName || '-'}</Badge></TableCell>
                    <TableCell><Badge className={`text-[10px] ${statusBadgeCls(u.status)}`}>{u.status}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => openEditUser(u)} className="text-blue-400 h-8 w-8 p-0"><Edit className="w-3.5 h-3.5" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteUser(u.id)} className="text-red-400 h-8 w-8 p-0"><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {userList.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-gray-500 py-8">No users found</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <Dialog open={userDialog} onOpenChange={setUserDialog}>
        <DialogContent className="bg-[#181818] border-[#2a2a2a] text-white max-w-md">
          <DialogHeader><DialogTitle>{editUser ? 'Edit User' : 'Add User'}</DialogTitle><DialogDescription>Fill in user details</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-gray-400 text-xs">Name</Label><Input value={userForm.name} onChange={(e) => setUserForm(f => ({ ...f, name: e.target.value }))} className="bg-[#0b0b0b] border-[#2a2a2a] text-white" /></div>
            <div><Label className="text-gray-400 text-xs">Email</Label><Input value={userForm.email} onChange={(e) => setUserForm(f => ({ ...f, email: e.target.value }))} className="bg-[#0b0b0b] border-[#2a2a2a] text-white" /></div>
            <div><Label className="text-gray-400 text-xs">Phone</Label><Input value={userForm.phone} onChange={(e) => setUserForm(f => ({ ...f, phone: e.target.value }))} className="bg-[#0b0b0b] border-[#2a2a2a] text-white" /></div>
            <div><Label className="text-gray-400 text-xs">Password {editUser && '(leave blank to keep)'}</Label><Input type="password" value={userForm.password} onChange={(e) => setUserForm(f => ({ ...f, password: e.target.value }))} className="bg-[#0b0b0b] border-[#2a2a2a] text-white" /></div>
            <div><Label className="text-gray-400 text-xs">Role</Label>
              <Select value={userForm.roleId} onValueChange={(v) => setUserForm(f => ({ ...f, roleId: v }))}>
                <SelectTrigger className="bg-[#0b0b0b] border-[#2a2a2a] text-white"><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent className="bg-[#181818] border-[#2a2a2a]">
                  {roleList.map((r: any) => <SelectItem key={r.id} value={r.id} className="text-white capitalize">{r.roleName}</SelectItem>)}
                  {roleList.length === 0 && ['admin', 'manager', 'employee', 'customer'].map(r => <SelectItem key={r} value={r} className="text-white capitalize">{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label className="text-gray-400 text-xs">Status</Label>
              <Select value={userForm.status} onValueChange={(v) => setUserForm(f => ({ ...f, status: v }))}>
                <SelectTrigger className="bg-[#0b0b0b] border-[#2a2a2a] text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#181818] border-[#2a2a2a]"><SelectItem value="active" className="text-white">Active</SelectItem><SelectItem value="inactive" className="text-white">Inactive</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter><Button variant="ghost" onClick={() => setUserDialog(false)} className="text-gray-400">Cancel</Button><Button onClick={handleSaveUser} className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90">{editUser ? 'Update' : 'Create'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
