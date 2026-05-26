'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import {
  Users, Star, DollarSign, TrendingUp, Check, Briefcase,
  CalendarDays, Network, Plus, AlertTriangle, Clock,
  ArrowRight, LayoutGrid, Database, Timer, TrendingDown, Gauge,
  PieChart as PieChartIcon, Target, Kanban, CalendarCheck,
  ClipboardList, Import, MessagesSquare, Megaphone, Webhook,
  MailOpen, MailPlus, Link2, FormInput, BarChart3,
  Receipt, CreditCard, CalendarRange, Filter, Eye,
  Edit, Trash2, Search, Send, Zap, Building2, CalendarClock,
} from 'lucide-react'
import { fmt, fmtDate, statusBadgeCls, priorityBadge, leadBadge } from './types'

// ─── Shared Types ────────────────────────────────────────
interface CrmModulesProps {
  adminTab: string
  leads: any[]
  employees: any[]
}

// ─── Reusable CRUD Module Hook ───────────────────────────
function useCrudModule(apiPath: string) {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [dialog, setDialog] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const [form, setForm] = useState<Record<string, any>>({})

  const fetchItems = useCallback(async (params = '') => {
    setLoading(true)
    try {
      const res = await fetch(`${apiPath}${params}`)
      const json = await res.json()
      if (json.status) { const raw = json.data?.companies || json.data?.pipelines || json.data?.deals || json.data?.templates || json.data?.sequences || json.data?.sources || json.data?.integrations || json.data?.conversations || json.data?.forms || json.data?.imports || json.data || []; setItems(Array.isArray(raw) ? raw : []) }
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }, [apiPath])

  useEffect(() => { fetchItems() }, [fetchItems])

  const openNew = (defaultForm: Record<string, any>) => {
    setEditItem(null); setForm(defaultForm); setDialog(true)
  }
  const openEdit = (item: any) => {
    setEditItem(item); setForm({ ...item }); setDialog(true)
  }
  const handleSave = async () => {
    try {
      const url = editItem ? `${apiPath}/${editItem.id}` : apiPath
      const method = editItem ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const json = await res.json()
      if (json.status) { setDialog(false); fetchItems(); toast.success(editItem ? 'Updated' : 'Created') }
      else toast.error(json.message || 'Failed')
    } catch (e) { console.error(e); toast.error('Failed') }
  }
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this item?')) return
    try {
      await fetch(`${apiPath}/${id}`, { method: 'DELETE' })
      fetchItems(); toast.success('Deleted')
    } catch (e) { console.error(e); toast.error('Failed') }
  }
  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch(`${apiPath}/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
      fetchItems(); toast.success('Status updated')
    } catch (e) { console.error(e); toast.error('Failed') }
  }

  return { items, loading, search, setSearch, dialog, setDialog, editItem, form, setForm, openNew, openEdit, handleSave, handleDelete, updateStatus, fetchItems }
}

// ─── Stats Card ──────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, delay = 0 }: { label: string; value: string | number; icon: React.ElementType; color: string; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <Card className="bg-[#181818] border-[#2a2a2a] hover:border-[#59ff00]/30 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div><p className="text-gray-400 text-xs font-medium uppercase tracking-wider">{label}</p><p className={`text-xl font-bold mt-1 ${color}`}>{value}</p></div>
            <div className={`w-10 h-10 rounded-xl ${color.replace('text-', 'bg-').replace(/-\d+$/, '-500/10')} flex items-center justify-center`}><Icon className={`w-5 h-5 ${color}`} /></div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ─── Module Header ───────────────────────────────────────
function ModuleHeader({ title, description, icon: Icon, onAdd }: { title: string; description: string; icon: React.ElementType; onAdd?: () => void }) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#59ff00]/10 border border-[#59ff00]/30 flex items-center justify-center"><Icon className="w-5 h-5 text-[#59ff00]" /></div>
        <div><h2 className="text-white text-xl font-bold">{title}</h2><p className="text-gray-500 text-xs">{description}</p></div>
      </div>
      {onAdd && <Button onClick={onAdd} className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90 font-semibold"><Plus className="w-4 h-4 mr-2" />Add New</Button>}
    </div>
  )
}

// ─── Search Bar ──────────────────────────────────────────
function SearchBar({ value, onChange, placeholder = 'Search...' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
      <Input placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} className="pl-9 bg-[#0b0b0b] border-[#2a2a2a] text-white placeholder:text-gray-600 h-9 text-sm" />
    </div>
  )
}

// ─── Form Field ──────────────────────────────────────────
function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><label className="text-gray-400 text-xs font-medium">{label}</label>{children}</div>
}

// ─── CRM Dashboard ───────────────────────────────────────
function CrmDashboard({ leads }: { leads: any[] }) {
  const wonLeads = leads.filter((l: any) => l.status === 'won').length
  const pipelineValue = leads.reduce((a: number, l: any) => a + (l.estimatedValue || 0), 0)
  const convRate = leads.length > 0 ? Math.round(wonLeads / leads.length * 100) : 0
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <ModuleHeader title="CRM Dashboard" description="Overview of your sales pipeline and customer relationships" icon={Gauge} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Leads" value={leads.length} icon={Users} color="text-purple-400" />
        <StatCard label="Won Leads" value={wonLeads} icon={Star} color="text-emerald-400" delay={0.1} />
        <StatCard label="Pipeline Value" value={fmt(pipelineValue)} icon={DollarSign} color="text-[#59ff00]" delay={0.2} />
        <StatCard label="Conversion Rate" value={`${convRate}%`} icon={TrendingUp} color="text-blue-400" delay={0.3} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-[#181818] border-[#2a2a2a]">
          <CardContent className="p-4">
            <h3 className="text-white font-semibold text-sm mb-3">Recent Leads</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {leads.slice(0, 8).map((l: any) => (
                <div key={l.id} className="flex items-center justify-between py-2 border-b border-[#2a2a2a] last:border-0">
                  <div><p className="text-white text-sm">{l.name}</p><p className="text-gray-500 text-xs">{l.company || l.city || '-'}</p></div>
                  <Badge className={`text-[10px] ${leadBadge(l.status)}`}>{l.status.replace('_', ' ')}</Badge>
                </div>
              ))}
              {leads.length === 0 && <p className="text-gray-500 text-sm text-center py-4">No leads yet</p>}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#181818] border-[#2a2a2a]">
          <CardContent className="p-4">
            <h3 className="text-white font-semibold text-sm mb-3">Lead Sources</h3>
            <div className="space-y-2">
              {Object.entries(leads.reduce((acc: any, l: any) => { acc[l.source || 'unknown'] = (acc[l.source || 'unknown'] || 0) + 1; return acc }, {})).map(([src, cnt]: any) => (
                <div key={src} className="flex items-center justify-between py-2 border-b border-[#2a2a2a] last:border-0">
                  <span className="text-gray-300 text-sm capitalize">{src}</span>
                  <span className="text-[#59ff00] font-semibold text-sm">{cnt}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}

// ─── Companies Module ────────────────────────────────────
function CompaniesModule() {
  const crud = useCrudModule('/api/companies')
  const filtered = crud.items.filter((c: any) => !crud.search || c.name?.toLowerCase().includes(crud.search.toLowerCase()) || c.industry?.toLowerCase().includes(crud.search.toLowerCase()))
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <ModuleHeader title="Companies" description="Manage company accounts, contacts, and organizational relationships" icon={Building2} onAdd={() => crud.openNew({ name: '', industry: '', website: '', phone: '', email: '', address: '', gstNumber: '', revenue: 0, status: 'prospect', notes: '' })} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Companies" value={crud.items.length} icon={Building2} color="text-blue-400" />
        <StatCard label="Active" value={crud.items.filter((c: any) => c.status === 'active').length} icon={Check} color="text-emerald-400" delay={0.1} />
        <StatCard label="Prospects" value={crud.items.filter((c: any) => c.status === 'prospect').length} icon={ArrowRight} color="text-yellow-400" delay={0.2} />
        <StatCard label="Revenue" value={fmt(crud.items.reduce((a: number, c: any) => a + (c.revenue || 0), 0))} icon={DollarSign} color="text-[#59ff00]" delay={0.3} />
      </div>
      <SearchBar value={crud.search} onChange={crud.setSearch} placeholder="Search companies..." />
      <Card className="bg-[#181818] border-[#2a2a2a]">
        <CardContent className="p-0">
          <Table><TableHeader><TableRow className="border-[#2a2a2a] hover:bg-transparent"><TableHead className="text-gray-400">Name</TableHead><TableHead className="text-gray-400">Industry</TableHead><TableHead className="text-gray-400">Phone</TableHead><TableHead className="text-gray-400">Revenue</TableHead><TableHead className="text-gray-400">Status</TableHead><TableHead className="text-gray-400">Actions</TableHead></TableRow></TableHeader>
            <TableBody>{filtered.map((c: any) => (
              <TableRow key={c.id} className="border-[#2a2a2a] hover:bg-white/5">
                <TableCell className="text-white text-sm">{c.name}</TableCell>
                <TableCell className="text-gray-300 text-sm">{c.industry || '-'}</TableCell>
                <TableCell className="text-gray-300 text-sm">{c.phone || '-'}</TableCell>
                <TableCell className="text-gray-300 text-sm">{fmt(c.revenue || 0)}</TableCell>
                <TableCell><Badge className={`text-[10px] ${statusBadgeCls(c.status)}`}>{c.status}</Badge></TableCell>
                <TableCell><div className="flex gap-1"><Button size="sm" variant="ghost" onClick={() => crud.openEdit(c)} className="text-blue-400 h-7 w-7 p-0"><Edit className="w-3.5 h-3.5" /></Button><Button size="sm" variant="ghost" onClick={() => crud.handleDelete(c.id)} className="text-red-400 h-7 w-7 p-0"><Trash2 className="w-3.5 h-3.5" /></Button></div></TableCell>
              </TableRow>
            ))}{filtered.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-gray-500 py-8">No companies found</TableCell></TableRow>}</TableBody></Table>
        </CardContent>
      </Card>
      <Dialog open={crud.dialog} onOpenChange={crud.setDialog}>
        <DialogContent className="bg-[#181818] border-[#2a2a2a] text-white max-w-lg">
          <DialogHeader><DialogTitle className="text-white">{crud.editItem ? 'Edit' : 'Add'} Company</DialogTitle></DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto py-2">
            <FormField label="Name"><Input value={crud.form.name || ''} onChange={e => crud.setForm({ ...crud.form, name: e.target.value })} className="bg-[#0b0b0b] border-[#2a2a2a] text-white" /></FormField>
            <FormField label="Industry"><Input value={crud.form.industry || ''} onChange={e => crud.setForm({ ...crud.form, industry: e.target.value })} className="bg-[#0b0b0b] border-[#2a2a2a] text-white" /></FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Phone"><Input value={crud.form.phone || ''} onChange={e => crud.setForm({ ...crud.form, phone: e.target.value })} className="bg-[#0b0b0b] border-[#2a2a2a] text-white" /></FormField>
              <FormField label="Email"><Input value={crud.form.email || ''} onChange={e => crud.setForm({ ...crud.form, email: e.target.value })} className="bg-[#0b0b0b] border-[#2a2a2a] text-white" /></FormField>
            </div>
            <FormField label="Website"><Input value={crud.form.website || ''} onChange={e => crud.setForm({ ...crud.form, website: e.target.value })} className="bg-[#0b0b0b] border-[#2a2a2a] text-white" /></FormField>
            <FormField label="Address"><Input value={crud.form.address || ''} onChange={e => crud.setForm({ ...crud.form, address: e.target.value })} className="bg-[#0b0b0b] border-[#2a2a2a] text-white" /></FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="GST Number"><Input value={crud.form.gstNumber || ''} onChange={e => crud.setForm({ ...crud.form, gstNumber: e.target.value })} className="bg-[#0b0b0b] border-[#2a2a2a] text-white" /></FormField>
              <FormField label="Revenue"><Input type="number" value={crud.form.revenue || 0} onChange={e => crud.setForm({ ...crud.form, revenue: parseFloat(e.target.value) || 0 })} className="bg-[#0b0b0b] border-[#2a2a2a] text-white" /></FormField>
            </div>
            <FormField label="Status"><Select value={crud.form.status || 'prospect'} onValueChange={v => crud.setForm({ ...crud.form, status: v })}><SelectTrigger className="bg-[#0b0b0b] border-[#2a2a2a] text-white"><SelectValue /></SelectTrigger><SelectContent className="bg-[#181818] border-[#2a2a2a]"><SelectItem value="prospect">Prospect</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select></FormField>
            <FormField label="Notes"><Textarea value={crud.form.notes || ''} onChange={e => crud.setForm({ ...crud.form, notes: e.target.value })} className="bg-[#0b0b0b] border-[#2a2a2a] text-white" rows={2} /></FormField>
          </div>
          <DialogFooter><Button variant="ghost" onClick={() => crud.setDialog(false)} className="text-gray-400">Cancel</Button><Button onClick={crud.handleSave} className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90 font-semibold">Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

// ─── Pipelines Module ────────────────────────────────────
function PipelinesModule() {
  const crud = useCrudModule('/api/pipelines')
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <ModuleHeader title="Pipelines" description="Configure and manage your sales pipelines and deal stages" icon={Target} onAdd={() => crud.openNew({ name: '', description: '', isDefault: false, stages: '[]', status: 'active' })} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Pipelines" value={crud.items.length} icon={Target} color="text-purple-400" />
        <StatCard label="Active" value={crud.items.filter((p: any) => p.status === 'active').length} icon={Check} color="text-emerald-400" delay={0.1} />
        <StatCard label="Default" value={crud.items.filter((p: any) => p.isDefault).length} icon={Star} color="text-yellow-400" delay={0.2} />
        <StatCard label="Total Stages" value={crud.items.reduce((a: number, p: any) => { try { return a + JSON.parse(p.stages || '[]').length } catch { return a } }, 0)} icon={LayoutGrid} color="text-blue-400" delay={0.3} />
      </div>
      <Card className="bg-[#181818] border-[#2a2a2a]">
        <CardContent className="p-0">
          <Table><TableHeader><TableRow className="border-[#2a2a2a] hover:bg-transparent"><TableHead className="text-gray-400">Name</TableHead><TableHead className="text-gray-400">Description</TableHead><TableHead className="text-gray-400">Default</TableHead><TableHead className="text-gray-400">Stages</TableHead><TableHead className="text-gray-400">Status</TableHead><TableHead className="text-gray-400">Actions</TableHead></TableRow></TableHeader>
            <TableBody>{crud.items.map((p: any) => {
              let stageCount = 0; try { stageCount = JSON.parse(p.stages || '[]').length } catch {}
              return (
                <TableRow key={p.id} className="border-[#2a2a2a] hover:bg-white/5">
                  <TableCell className="text-white text-sm font-medium">{p.name}</TableCell>
                  <TableCell className="text-gray-400 text-sm">{p.description || '-'}</TableCell>
                  <TableCell>{p.isDefault && <Badge className="bg-[#59ff00]/10 text-[#59ff00] border-[#59ff00]/30 text-[10px]">Default</Badge>}</TableCell>
                  <TableCell className="text-gray-300 text-sm">{stageCount}</TableCell>
                  <TableCell><Badge className={`text-[10px] ${statusBadgeCls(p.status)}`}>{p.status}</Badge></TableCell>
                  <TableCell><div className="flex gap-1"><Button size="sm" variant="ghost" onClick={() => crud.openEdit(p)} className="text-blue-400 h-7 w-7 p-0"><Edit className="w-3.5 h-3.5" /></Button><Button size="sm" variant="ghost" onClick={() => crud.handleDelete(p.id)} className="text-red-400 h-7 w-7 p-0"><Trash2 className="w-3.5 h-3.5" /></Button></div></TableCell>
                </TableRow>
              )
            })}{crud.items.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-gray-500 py-8">No pipelines found</TableCell></TableRow>}</TableBody></Table>
        </CardContent>
      </Card>
      <Dialog open={crud.dialog} onOpenChange={crud.setDialog}>
        <DialogContent className="bg-[#181818] border-[#2a2a2a] text-white max-w-lg">
          <DialogHeader><DialogTitle className="text-white">{crud.editItem ? 'Edit' : 'Add'} Pipeline</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <FormField label="Name"><Input value={crud.form.name || ''} onChange={e => crud.setForm({ ...crud.form, name: e.target.value })} className="bg-[#0b0b0b] border-[#2a2a2a] text-white" /></FormField>
            <FormField label="Description"><Textarea value={crud.form.description || ''} onChange={e => crud.setForm({ ...crud.form, description: e.target.value })} className="bg-[#0b0b0b] border-[#2a2a2a] text-white" rows={2} /></FormField>
            <FormField label="Stages (JSON)"><Textarea value={crud.form.stages || '[]'} onChange={e => crud.setForm({ ...crud.form, stages: e.target.value })} className="bg-[#0b0b0b] border-[#2a2a2a] text-white font-mono text-xs" rows={3} /></FormField>
            <div className="flex items-center gap-2"><input type="checkbox" checked={!!crud.form.isDefault} onChange={e => crud.setForm({ ...crud.form, isDefault: e.target.checked })} className="rounded" /><span className="text-gray-400 text-sm">Set as default pipeline</span></div>
            <FormField label="Status"><Select value={crud.form.status || 'active'} onValueChange={v => crud.setForm({ ...crud.form, status: v })}><SelectTrigger className="bg-[#0b0b0b] border-[#2a2a2a] text-white"><SelectValue /></SelectTrigger><SelectContent className="bg-[#181818] border-[#2a2a2a]"><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select></FormField>
          </div>
          <DialogFooter><Button variant="ghost" onClick={() => crud.setDialog(false)} className="text-gray-400">Cancel</Button><Button onClick={crud.handleSave} className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90 font-semibold">Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

// ─── Pipeline Deals Module ───────────────────────────────
function PipelineModule() {
  const crud = useCrudModule('/api/pipeline-deals')
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <ModuleHeader title="Pipeline" description="Visualize and manage your current sales pipeline" icon={Filter} onAdd={() => crud.openNew({ title: '', pipelineId: '', value: 0, stage: 'New', probability: 50, status: 'open' })} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Open Deals" value={crud.items.filter((d: any) => d.status === 'open').length} icon={Filter} color="text-blue-400" />
        <StatCard label="Won" value={crud.items.filter((d: any) => d.status === 'won').length} icon={Check} color="text-emerald-400" delay={0.1} />
        <StatCard label="Pipeline Value" value={fmt(crud.items.filter((d: any) => d.status === 'open').reduce((a: number, d: any) => a + (d.value || 0), 0))} icon={DollarSign} color="text-[#59ff00]" delay={0.2} />
        <StatCard label="Stuck" value={crud.items.filter((d: any) => d.status === 'open' && d.probability < 30).length} icon={AlertTriangle} color="text-red-400" delay={0.3} />
      </div>
      <Card className="bg-[#181818] border-[#2a2a2a]">
        <CardContent className="p-0">
          <Table><TableHeader><TableRow className="border-[#2a2a2a] hover:bg-transparent"><TableHead className="text-gray-400">Deal</TableHead><TableHead className="text-gray-400">Stage</TableHead><TableHead className="text-gray-400">Value</TableHead><TableHead className="text-gray-400">Probability</TableHead><TableHead className="text-gray-400">Status</TableHead><TableHead className="text-gray-400">Actions</TableHead></TableRow></TableHeader>
            <TableBody>{crud.items.map((d: any) => (
              <TableRow key={d.id} className="border-[#2a2a2a] hover:bg-white/5">
                <TableCell className="text-white text-sm font-medium">{d.title}</TableCell>
                <TableCell className="text-gray-300 text-sm">{d.stage}</TableCell>
                <TableCell className="text-gray-300 text-sm">{fmt(d.value || 0)}</TableCell>
                <TableCell className="text-gray-300 text-sm">{d.probability}%</TableCell>
                <TableCell><Badge className={`text-[10px] ${d.status === 'won' ? 'bg-emerald-500/20 text-emerald-400' : d.status === 'lost' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>{d.status}</Badge></TableCell>
                <TableCell><div className="flex gap-1"><Button size="sm" variant="ghost" onClick={() => crud.openEdit(d)} className="text-blue-400 h-7 w-7 p-0"><Edit className="w-3.5 h-3.5" /></Button><Button size="sm" variant="ghost" onClick={() => crud.handleDelete(d.id)} className="text-red-400 h-7 w-7 p-0"><Trash2 className="w-3.5 h-3.5" /></Button></div></TableCell>
              </TableRow>
            ))}{crud.items.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-gray-500 py-8">No deals found</TableCell></TableRow>}</TableBody></Table>
        </CardContent>
      </Card>
      <Dialog open={crud.dialog} onOpenChange={crud.setDialog}>
        <DialogContent className="bg-[#181818] border-[#2a2a2a] text-white max-w-lg">
          <DialogHeader><DialogTitle className="text-white">{crud.editItem ? 'Edit' : 'Add'} Deal</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <FormField label="Title"><Input value={crud.form.title || ''} onChange={e => crud.setForm({ ...crud.form, title: e.target.value })} className="bg-[#0b0b0b] border-[#2a2a2a] text-white" /></FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Value"><Input type="number" value={crud.form.value || 0} onChange={e => crud.setForm({ ...crud.form, value: parseFloat(e.target.value) || 0 })} className="bg-[#0b0b0b] border-[#2a2a2a] text-white" /></FormField>
              <FormField label="Probability (%)"><Input type="number" value={crud.form.probability || 50} onChange={e => crud.setForm({ ...crud.form, probability: parseInt(e.target.value) || 0 })} className="bg-[#0b0b0b] border-[#2a2a2a] text-white" /></FormField>
            </div>
            <FormField label="Stage"><Input value={crud.form.stage || ''} onChange={e => crud.setForm({ ...crud.form, stage: e.target.value })} className="bg-[#0b0b0b] border-[#2a2a2a] text-white" /></FormField>
            <FormField label="Status"><Select value={crud.form.status || 'open'} onValueChange={v => crud.setForm({ ...crud.form, status: v })}><SelectTrigger className="bg-[#0b0b0b] border-[#2a2a2a] text-white"><SelectValue /></SelectTrigger><SelectContent className="bg-[#181818] border-[#2a2a2a]"><SelectItem value="open">Open</SelectItem><SelectItem value="won">Won</SelectItem><SelectItem value="lost">Lost</SelectItem></SelectContent></Select></FormField>
          </div>
          <DialogFooter><Button variant="ghost" onClick={() => crud.setDialog(false)} className="text-gray-400">Cancel</Button><Button onClick={crud.handleSave} className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90 font-semibold">Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

// ─── Kanban Board Module ─────────────────────────────────
function KanbanModule() {
  const crud = useCrudModule('/api/pipeline-deals')
  const stages = ['New', 'Contacted', 'Proposal', 'Negotiation', 'Won', 'Lost']
  const grouped = stages.map(stage => ({ stage, deals: crud.items.filter((d: any) => d.stage === stage) }))
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <ModuleHeader title="Kanban Board" description="Visual lead and deal management board" icon={Kanban} onAdd={() => crud.openNew({ title: '', pipelineId: '', value: 0, stage: 'New', probability: 50, status: 'open' })} />
      <div className="flex gap-3 overflow-x-auto pb-4">
        {grouped.map(({ stage, deals }) => (
          <div key={stage} className="min-w-[220px] flex-1">
            <div className="flex items-center justify-between mb-2"><h3 className="text-white text-sm font-semibold">{stage}</h3><Badge className="bg-[#59ff00]/10 text-[#59ff00] border-[#59ff00]/30 text-[10px]">{deals.length}</Badge></div>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {deals.map((d: any) => (
                <Card key={d.id} className="bg-[#181818] border-[#2a2a2a] hover:border-[#59ff00]/30 cursor-pointer transition-colors" onClick={() => crud.openEdit(d)}>
                  <CardContent className="p-3"><p className="text-white text-sm font-medium">{d.title}</p><p className="text-[#59ff00] text-xs mt-1">{fmt(d.value || 0)}</p><p className="text-gray-500 text-xs mt-1">{d.probability}% probability</p></CardContent>
                </Card>
              ))}
              {deals.length === 0 && <div className="text-center text-gray-600 text-xs py-6 border border-dashed border-[#2a2a2a] rounded-lg">No deals</div>}
            </div>
          </div>
        ))}
      </div>
      <Dialog open={crud.dialog} onOpenChange={crud.setDialog}>
        <DialogContent className="bg-[#181818] border-[#2a2a2a] text-white max-w-lg">
          <DialogHeader><DialogTitle className="text-white">{crud.editItem ? 'Edit' : 'Add'} Deal</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <FormField label="Title"><Input value={crud.form.title || ''} onChange={e => crud.setForm({ ...crud.form, title: e.target.value })} className="bg-[#0b0b0b] border-[#2a2a2a] text-white" /></FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Value"><Input type="number" value={crud.form.value || 0} onChange={e => crud.setForm({ ...crud.form, value: parseFloat(e.target.value) || 0 })} className="bg-[#0b0b0b] border-[#2a2a2a] text-white" /></FormField>
              <FormField label="Stage"><Select value={crud.form.stage || 'New'} onValueChange={v => crud.setForm({ ...crud.form, stage: v })}><SelectTrigger className="bg-[#0b0b0b] border-[#2a2a2a] text-white"><SelectValue /></SelectTrigger><SelectContent className="bg-[#181818] border-[#2a2a2a]">{stages.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></FormField>
            </div>
            <FormField label="Probability (%)"><Input type="number" value={crud.form.probability || 50} onChange={e => crud.setForm({ ...crud.form, probability: parseInt(e.target.value) || 0 })} className="bg-[#0b0b0b] border-[#2a2a2a] text-white" /></FormField>
          </div>
          <DialogFooter><Button variant="ghost" onClick={() => crud.setDialog(false)} className="text-gray-400">Cancel</Button><Button onClick={crud.handleSave} className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90 font-semibold">Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

// ─── Calendar Module ─────────────────────────────────────
function CalendarModule() {
  const [leads] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  useEffect(() => { fetch('/api/tasks?limit=50').then(r => r.json()).then(j => { if (j.status) setTasks(j.data.tasks || j.data || []) }).catch(() => {}) }, [])
  const now = new Date()
  const thisMonth = now.getMonth(), thisYear = now.getFullYear()
  const daysInMonth = new Date(thisYear, thisMonth + 1, 0).getDate()
  const firstDay = new Date(thisYear, thisMonth, 1).getDay()
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const allEvents = [...tasks.map((t: any) => ({ title: t.title, date: t.dueDate ? new Date(t.dueDate) : null, type: 'task' })), ...leads.map((l: any) => ({ title: l.name, date: new Date(l.createdAt), type: 'lead' }))]
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <ModuleHeader title="Task Calendar" description="Calendar view for scheduling tasks, follow-ups, and meetings" icon={CalendarCheck} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="bg-[#181818] border-[#2a2a2a] lg:col-span-2">
          <CardContent className="p-4">
            <h3 className="text-white font-semibold text-sm mb-3">{now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</h3>
            <div className="grid grid-cols-7 gap-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} className="text-gray-500 text-xs text-center py-1">{d}</div>)}
              {Array.from({ length: firstDay }, (_, i) => <div key={`e-${i}`} />)}
              {days.map(day => {
                const isToday = day === now.getDate()
                const dayEvents = allEvents.filter(e => e.date && e.date.getDate() === day && e.date.getMonth() === thisMonth)
                return <div key={day} className={`min-h-[40px] p-1 rounded text-xs ${isToday ? 'bg-[#59ff00]/10 border border-[#59ff00]/30' : 'hover:bg-white/5'}`}><span className={`text-[10px] ${isToday ? 'text-[#59ff00] font-bold' : 'text-gray-400'}`}>{day}</span>{dayEvents.slice(0, 2).map((e, i) => <div key={i} className={`text-[8px] truncate rounded px-1 ${e.type === 'task' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>{e.title}</div>)}</div>
              })}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#181818] border-[#2a2a2a]">
          <CardContent className="p-4">
            <h3 className="text-white font-semibold text-sm mb-3">Upcoming Tasks</h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {tasks.map((t: any) => (
                <div key={t.id} className="flex items-start gap-2 p-2 rounded-lg bg-[#0b0b0b] border border-[#2a2a2a]">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${t.priority === 'high' ? 'bg-red-400' : t.priority === 'medium' ? 'bg-yellow-400' : 'bg-blue-400'}`} />
                  <div><p className="text-white text-xs font-medium">{t.title}</p><p className="text-gray-500 text-[10px]">{t.dueDate ? fmtDate(t.dueDate) : 'No due date'}</p></div>
                </div>
              ))}
              {tasks.length === 0 && <p className="text-gray-500 text-sm text-center py-4">No tasks</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}

// ─── Forms Module ────────────────────────────────────────
function FormsModule() {
  const crud = useCrudModule('/api/crm-forms')
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <ModuleHeader title="Forms" description="Create and manage lead capture forms for your website" icon={ClipboardList} onAdd={() => crud.openNew({ name: '', fields: '[]', status: 'active' })} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Forms" value={crud.items.filter((f: any) => f.status === 'active').length} icon={ClipboardList} color="text-blue-400" />
        <StatCard label="Total Submissions" value={crud.items.reduce((a: number, f: any) => a + (f.submissions || 0), 0)} icon={Database} color="text-purple-400" delay={0.1} />
        <StatCard label="Total Forms" value={crud.items.length} icon={LayoutGrid} color="text-yellow-400" delay={0.2} />
        <StatCard label="Avg Submissions" value={crud.items.length > 0 ? Math.round(crud.items.reduce((a: number, f: any) => a + (f.submissions || 0), 0) / crud.items.length) : 0} icon={CalendarDays} color="text-emerald-400" delay={0.3} />
      </div>
      <Card className="bg-[#181818] border-[#2a2a2a]"><CardContent className="p-0"><Table><TableHeader><TableRow className="border-[#2a2a2a] hover:bg-transparent"><TableHead className="text-gray-400">Name</TableHead><TableHead className="text-gray-400">Fields</TableHead><TableHead className="text-gray-400">Submissions</TableHead><TableHead className="text-gray-400">Status</TableHead><TableHead className="text-gray-400">Actions</TableHead></TableRow></TableHeader>
        <TableBody>{crud.items.map((f: any) => { let fc = 0; try { fc = JSON.parse(f.fields || '[]').length } catch {} return (
          <TableRow key={f.id} className="border-[#2a2a2a] hover:bg-white/5"><TableCell className="text-white text-sm">{f.name}</TableCell><TableCell className="text-gray-300 text-sm">{fc}</TableCell><TableCell className="text-gray-300 text-sm">{f.submissions}</TableCell><TableCell><Badge className={`text-[10px] ${statusBadgeCls(f.status)}`}>{f.status}</Badge></TableCell><TableCell><div className="flex gap-1"><Button size="sm" variant="ghost" onClick={() => crud.openEdit(f)} className="text-blue-400 h-7 w-7 p-0"><Edit className="w-3.5 h-3.5" /></Button><Button size="sm" variant="ghost" onClick={() => crud.handleDelete(f.id)} className="text-red-400 h-7 w-7 p-0"><Trash2 className="w-3.5 h-3.5" /></Button></div></TableCell></TableRow>
        )})}{crud.items.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-gray-500 py-8">No forms found</TableCell></TableRow>}</TableBody></Table></CardContent></Card>
      <Dialog open={crud.dialog} onOpenChange={crud.setDialog}><DialogContent className="bg-[#181818] border-[#2a2a2a] text-white max-w-lg"><DialogHeader><DialogTitle className="text-white">{crud.editItem ? 'Edit' : 'Add'} Form</DialogTitle></DialogHeader><div className="space-y-3"><FormField label="Name"><Input value={crud.form.name || ''} onChange={e => crud.setForm({ ...crud.form, name: e.target.value })} className="bg-[#0b0b0b] border-[#2a2a2a] text-white" /></FormField><FormField label="Fields (JSON)"><Textarea value={crud.form.fields || '[]'} onChange={e => crud.setForm({ ...crud.form, fields: e.target.value })} className="bg-[#0b0b0b] border-[#2a2a2a] text-white font-mono text-xs" rows={4} /></FormField><FormField label="Status"><Select value={crud.form.status || 'active'} onValueChange={v => crud.setForm({ ...crud.form, status: v })}><SelectTrigger className="bg-[#0b0b0b] border-[#2a2a2a] text-white"><SelectValue /></SelectTrigger><SelectContent className="bg-[#181818] border-[#2a2a2a]"><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select></FormField></div><DialogFooter><Button variant="ghost" onClick={() => crud.setDialog(false)} className="text-gray-400">Cancel</Button><Button onClick={crud.handleSave} className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90 font-semibold">Save</Button></DialogFooter></DialogContent></Dialog>
    </motion.div>
  )
}

// ─── Imports Module ──────────────────────────────────────
function ImportsModule() {
  const crud = useCrudModule('/api/crm-imports')
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <ModuleHeader title="Imports" description="Import leads and contacts from CSV, Excel, and other sources" icon={Import} onAdd={() => crud.openNew({ fileName: '', source: 'csv', records: 0, successful: 0, failed: 0, status: 'pending' })} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Imports" value={crud.items.length} icon={Import} color="text-blue-400" />
        <StatCard label="Total Records" value={crud.items.reduce((a: number, i: any) => a + (i.records || 0), 0)} icon={Database} color="text-purple-400" delay={0.1} />
        <StatCard label="Success Rate" value={crud.items.length > 0 ? Math.round(crud.items.reduce((a: number, i: any) => a + (i.successful || 0), 0) / crud.items.reduce((a: number, i: any) => a + (i.records || 1), 0) * 100) + '%' : '0%'} icon={Check} color="text-emerald-400" delay={0.2} />
        <StatCard label="Last Import" value={crud.items.length > 0 ? fmtDate(crud.items[0].createdAt) : '-'} icon={Clock} color="text-yellow-400" delay={0.3} />
      </div>
      <Card className="bg-[#181818] border-[#2a2a2a]"><CardContent className="p-0"><Table><TableHeader><TableRow className="border-[#2a2a2a] hover:bg-transparent"><TableHead className="text-gray-400">File Name</TableHead><TableHead className="text-gray-400">Source</TableHead><TableHead className="text-gray-400">Records</TableHead><TableHead className="text-gray-400">Successful</TableHead><TableHead className="text-gray-400">Failed</TableHead><TableHead className="text-gray-400">Status</TableHead><TableHead className="text-gray-400">Date</TableHead></TableRow></TableHeader>
        <TableBody>{crud.items.map((imp: any) => (
          <TableRow key={imp.id} className="border-[#2a2a2a] hover:bg-white/5"><TableCell className="text-white text-sm">{imp.fileName}</TableCell><TableCell className="text-gray-300 text-sm capitalize">{imp.source}</TableCell><TableCell className="text-gray-300 text-sm">{imp.records}</TableCell><TableCell className="text-emerald-400 text-sm">{imp.successful}</TableCell><TableCell className="text-red-400 text-sm">{imp.failed}</TableCell><TableCell><Badge className={`text-[10px] ${statusBadgeCls(imp.status)}`}>{imp.status}</Badge></TableCell><TableCell className="text-gray-400 text-xs">{fmtDate(imp.createdAt)}</TableCell></TableRow>
        ))}{crud.items.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-gray-500 py-8">No imports found</TableCell></TableRow>}</TableBody></Table></CardContent></Card>
      <Dialog open={crud.dialog} onOpenChange={crud.setDialog}><DialogContent className="bg-[#181818] border-[#2a2a2a] text-white max-w-lg"><DialogHeader><DialogTitle className="text-white">{crud.editItem ? 'Edit' : 'Add'} Import</DialogTitle></DialogHeader><div className="space-y-3"><FormField label="File Name"><Input value={crud.form.fileName || ''} onChange={e => crud.setForm({ ...crud.form, fileName: e.target.value })} className="bg-[#0b0b0b] border-[#2a2a2a] text-white" /></FormField><FormField label="Source"><Select value={crud.form.source || 'csv'} onValueChange={v => crud.setForm({ ...crud.form, source: v })}><SelectTrigger className="bg-[#0b0b0b] border-[#2a2a2a] text-white"><SelectValue /></SelectTrigger><SelectContent className="bg-[#181818] border-[#2a2a2a]"><SelectItem value="csv">CSV</SelectItem><SelectItem value="excel">Excel</SelectItem><SelectItem value="api">API</SelectItem></SelectContent></Select></FormField><div className="grid grid-cols-3 gap-3"><FormField label="Records"><Input type="number" value={crud.form.records || 0} onChange={e => crud.setForm({ ...crud.form, records: parseInt(e.target.value) || 0 })} className="bg-[#0b0b0b] border-[#2a2a2a] text-white" /></FormField><FormField label="Successful"><Input type="number" value={crud.form.successful || 0} onChange={e => crud.setForm({ ...crud.form, successful: parseInt(e.target.value) || 0 })} className="bg-[#0b0b0b] border-[#2a2a2a] text-white" /></FormField><FormField label="Failed"><Input type="number" value={crud.form.failed || 0} onChange={e => crud.setForm({ ...crud.form, failed: parseInt(e.target.value) || 0 })} className="bg-[#0b0b0b] border-[#2a2a2a] text-white" /></FormField></div></div><DialogFooter><Button variant="ghost" onClick={() => crud.setDialog(false)} className="text-gray-400">Cancel</Button><Button onClick={crud.handleSave} className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90 font-semibold">Save</Button></DialogFooter></DialogContent></Dialog>
    </motion.div>
  )
}

// ─── Conversations Module ────────────────────────────────
function ConversationsModule() {
  const crud = useCrudModule('/api/conversations')
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <ModuleHeader title="Conversations" description="Track and manage all customer conversations in one place" icon={MessagesSquare} onAdd={() => crud.openNew({ subject: '', channel: 'email', status: 'open' })} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active" value={crud.items.filter((c: any) => c.status === 'open').length} icon={MessagesSquare} color="text-blue-400" />
        <StatCard label="Closed" value={crud.items.filter((c: any) => c.status === 'closed').length} icon={Check} color="text-emerald-400" delay={0.1} />
        <StatCard label="Email" value={crud.items.filter((c: any) => c.channel === 'email').length} icon={MailOpen} color="text-purple-400" delay={0.2} />
        <StatCard label="WhatsApp" value={crud.items.filter((c: any) => c.channel === 'whatsapp').length} icon={MessagesSquare} color="text-[#59ff00]" delay={0.3} />
      </div>
      <Card className="bg-[#181818] border-[#2a2a2a]"><CardContent className="p-0"><Table><TableHeader><TableRow className="border-[#2a2a2a] hover:bg-transparent"><TableHead className="text-gray-400">Subject</TableHead><TableHead className="text-gray-400">Channel</TableHead><TableHead className="text-gray-400">Status</TableHead><TableHead className="text-gray-400">Created</TableHead><TableHead className="text-gray-400">Actions</TableHead></TableRow></TableHeader>
        <TableBody>{crud.items.map((c: any) => (
          <TableRow key={c.id} className="border-[#2a2a2a] hover:bg-white/5"><TableCell className="text-white text-sm">{c.subject || '(No subject)'}</TableCell><TableCell className="text-gray-300 text-sm capitalize">{c.channel}</TableCell><TableCell><Badge className={`text-[10px] ${statusBadgeCls(c.status)}`}>{c.status}</Badge></TableCell><TableCell className="text-gray-400 text-xs">{fmtDate(c.createdAt)}</TableCell><TableCell><div className="flex gap-1"><Button size="sm" variant="ghost" onClick={() => crud.openEdit(c)} className="text-blue-400 h-7 w-7 p-0"><Edit className="w-3.5 h-3.5" /></Button><Button size="sm" variant="ghost" onClick={() => crud.handleDelete(c.id)} className="text-red-400 h-7 w-7 p-0"><Trash2 className="w-3.5 h-3.5" /></Button></div></TableCell></TableRow>
        ))}{crud.items.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-gray-500 py-8">No conversations found</TableCell></TableRow>}</TableBody></Table></CardContent></Card>
      <Dialog open={crud.dialog} onOpenChange={crud.setDialog}><DialogContent className="bg-[#181818] border-[#2a2a2a] text-white max-w-lg"><DialogHeader><DialogTitle className="text-white">{crud.editItem ? 'Edit' : 'Add'} Conversation</DialogTitle></DialogHeader><div className="space-y-3"><FormField label="Subject"><Input value={crud.form.subject || ''} onChange={e => crud.setForm({ ...crud.form, subject: e.target.value })} className="bg-[#0b0b0b] border-[#2a2a2a] text-white" /></FormField><FormField label="Channel"><Select value={crud.form.channel || 'email'} onValueChange={v => crud.setForm({ ...crud.form, channel: v })}><SelectTrigger className="bg-[#0b0b0b] border-[#2a2a2a] text-white"><SelectValue /></SelectTrigger><SelectContent className="bg-[#181818] border-[#2a2a2a]"><SelectItem value="email">Email</SelectItem><SelectItem value="phone">Phone</SelectItem><SelectItem value="whatsapp">WhatsApp</SelectItem><SelectItem value="chat">Chat</SelectItem></SelectContent></Select></FormField><FormField label="Status"><Select value={crud.form.status || 'open'} onValueChange={v => crud.setForm({ ...crud.form, status: v })}><SelectTrigger className="bg-[#0b0b0b] border-[#2a2a2a] text-white"><SelectValue /></SelectTrigger><SelectContent className="bg-[#181818] border-[#2a2a2a]"><SelectItem value="open">Open</SelectItem><SelectItem value="closed">Closed</SelectItem></SelectContent></Select></FormField></div><DialogFooter><Button variant="ghost" onClick={() => crud.setDialog(false)} className="text-gray-400">Cancel</Button><Button onClick={crud.handleSave} className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90 font-semibold">Save</Button></DialogFooter></DialogContent></Dialog>
    </motion.div>
  )
}

// ─── Lead Sources Module ─────────────────────────────────
function LeadSourcesModule() {
  const crud = useCrudModule('/api/lead-sources')
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <ModuleHeader title="Lead Sources" description="Track and optimize lead generation sources" icon={Megaphone} onAdd={() => crud.openNew({ name: '', type: 'organic', cost: 0, status: 'active' })} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Sources" value={crud.items.length} icon={Megaphone} color="text-blue-400" />
        <StatCard label="Best Source" value={crud.items.sort((a: any, b: any) => (b.cost || 0) - (a.cost || 0))[0]?.name || '-'} icon={Star} color="text-emerald-400" delay={0.1} />
        <StatCard label="Active" value={crud.items.filter((s: any) => s.status === 'active').length} icon={Check} color="text-purple-400" delay={0.2} />
        <StatCard label="Total Cost" value={fmt(crud.items.reduce((a: number, s: any) => a + (s.cost || 0), 0))} icon={DollarSign} color="text-[#59ff00]" delay={0.3} />
      </div>
      <Card className="bg-[#181818] border-[#2a2a2a]"><CardContent className="p-0"><Table><TableHeader><TableRow className="border-[#2a2a2a] hover:bg-transparent"><TableHead className="text-gray-400">Name</TableHead><TableHead className="text-gray-400">Type</TableHead><TableHead className="text-gray-400">Cost</TableHead><TableHead className="text-gray-400">Status</TableHead><TableHead className="text-gray-400">Actions</TableHead></TableRow></TableHeader>
        <TableBody>{crud.items.map((s: any) => (
          <TableRow key={s.id} className="border-[#2a2a2a] hover:bg-white/5"><TableCell className="text-white text-sm">{s.name}</TableCell><TableCell className="text-gray-300 text-sm capitalize">{s.type}</TableCell><TableCell className="text-gray-300 text-sm">{fmt(s.cost || 0)}</TableCell><TableCell><Badge className={`text-[10px] ${statusBadgeCls(s.status)}`}>{s.status}</Badge></TableCell><TableCell><div className="flex gap-1"><Button size="sm" variant="ghost" onClick={() => crud.openEdit(s)} className="text-blue-400 h-7 w-7 p-0"><Edit className="w-3.5 h-3.5" /></Button><Button size="sm" variant="ghost" onClick={() => crud.handleDelete(s.id)} className="text-red-400 h-7 w-7 p-0"><Trash2 className="w-3.5 h-3.5" /></Button></div></TableCell></TableRow>
        ))}{crud.items.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-gray-500 py-8">No lead sources found</TableCell></TableRow>}</TableBody></Table></CardContent></Card>
      <Dialog open={crud.dialog} onOpenChange={crud.setDialog}><DialogContent className="bg-[#181818] border-[#2a2a2a] text-white max-w-lg"><DialogHeader><DialogTitle className="text-white">{crud.editItem ? 'Edit' : 'Add'} Lead Source</DialogTitle></DialogHeader><div className="space-y-3"><FormField label="Name"><Input value={crud.form.name || ''} onChange={e => crud.setForm({ ...crud.form, name: e.target.value })} className="bg-[#0b0b0b] border-[#2a2a2a] text-white" /></FormField><FormField label="Type"><Select value={crud.form.type || 'organic'} onValueChange={v => crud.setForm({ ...crud.form, type: v })}><SelectTrigger className="bg-[#0b0b0b] border-[#2a2a2a] text-white"><SelectValue /></SelectTrigger><SelectContent className="bg-[#181818] border-[#2a2a2a]"><SelectItem value="organic">Organic</SelectItem><SelectItem value="paid">Paid</SelectItem><SelectItem value="referral">Referral</SelectItem><SelectItem value="social">Social</SelectItem></SelectContent></Select></FormField><FormField label="Cost"><Input type="number" value={crud.form.cost || 0} onChange={e => crud.setForm({ ...crud.form, cost: parseFloat(e.target.value) || 0 })} className="bg-[#0b0b0b] border-[#2a2a2a] text-white" /></FormField><FormField label="Status"><Select value={crud.form.status || 'active'} onValueChange={v => crud.setForm({ ...crud.form, status: v })}><SelectTrigger className="bg-[#0b0b0b] border-[#2a2a2a] text-white"><SelectValue /></SelectTrigger><SelectContent className="bg-[#181818] border-[#2a2a2a]"><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select></FormField></div><DialogFooter><Button variant="ghost" onClick={() => crud.setDialog(false)} className="text-gray-400">Cancel</Button><Button onClick={crud.handleSave} className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90 font-semibold">Save</Button></DialogFooter></DialogContent></Dialog>
    </motion.div>
  )
}

// ─── Integrations Module ─────────────────────────────────
function IntegrationsModule() {
  const crud = useCrudModule('/api/integrations')
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <ModuleHeader title="Integrations" description="Connect third-party tools and services to your CRM" icon={Webhook} onAdd={() => crud.openNew({ name: '', category: 'crm', config: '{}', status: 'disconnected' })} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Connected" value={crud.items.filter((i: any) => i.status === 'connected').length} icon={Webhook} color="text-emerald-400" />
        <StatCard label="Available" value={crud.items.length} icon={LayoutGrid} color="text-blue-400" delay={0.1} />
        <StatCard label="Errors" value={crud.items.filter((i: any) => i.status === 'error').length} icon={AlertTriangle} color="text-red-400" delay={0.2} />
        <StatCard label="Categories" value={new Set(crud.items.map((i: any) => i.category)).size} icon={Database} color="text-purple-400" delay={0.3} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {crud.items.map((intg: any) => (
          <Card key={intg.id} className="bg-[#181818] border-[#2a2a2a] hover:border-[#59ff00]/30 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2"><h3 className="text-white text-sm font-semibold">{intg.name}</h3><Badge className={`text-[10px] ${intg.status === 'connected' ? 'bg-emerald-500/20 text-emerald-400' : intg.status === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'}`}>{intg.status}</Badge></div>
              <p className="text-gray-400 text-xs capitalize mb-3">{intg.category}</p>
              <div className="flex gap-2"><Button size="sm" variant="ghost" onClick={() => crud.openEdit(intg)} className="text-blue-400 h-7 text-xs">Configure</Button><Button size="sm" variant="ghost" onClick={() => crud.handleDelete(intg.id)} className="text-red-400 h-7 text-xs">Remove</Button></div>
            </CardContent>
          </Card>
        ))}
        {crud.items.length === 0 && <div className="col-span-3 text-center text-gray-500 py-8">No integrations configured</div>}
      </div>
      <Dialog open={crud.dialog} onOpenChange={crud.setDialog}><DialogContent className="bg-[#181818] border-[#2a2a2a] text-white max-w-lg"><DialogHeader><DialogTitle className="text-white">{crud.editItem ? 'Edit' : 'Add'} Integration</DialogTitle></DialogHeader><div className="space-y-3"><FormField label="Name"><Input value={crud.form.name || ''} onChange={e => crud.setForm({ ...crud.form, name: e.target.value })} className="bg-[#0b0b0b] border-[#2a2a2a] text-white" /></FormField><FormField label="Category"><Select value={crud.form.category || 'crm'} onValueChange={v => crud.setForm({ ...crud.form, category: v })}><SelectTrigger className="bg-[#0b0b0b] border-[#2a2a2a] text-white"><SelectValue /></SelectTrigger><SelectContent className="bg-[#181818] border-[#2a2a2a]"><SelectItem value="crm">CRM</SelectItem><SelectItem value="email">Email</SelectItem><SelectItem value="accounting">Accounting</SelectItem><SelectItem value="analytics">Analytics</SelectItem></SelectContent></Select></FormField><FormField label="Config (JSON)"><Textarea value={crud.form.config || '{}'} onChange={e => crud.setForm({ ...crud.form, config: e.target.value })} className="bg-[#0b0b0b] border-[#2a2a2a] text-white font-mono text-xs" rows={3} /></FormField><FormField label="Status"><Select value={crud.form.status || 'disconnected'} onValueChange={v => crud.setForm({ ...crud.form, status: v })}><SelectTrigger className="bg-[#0b0b0b] border-[#2a2a2a] text-white"><SelectValue /></SelectTrigger><SelectContent className="bg-[#181818] border-[#2a2a2a]"><SelectItem value="connected">Connected</SelectItem><SelectItem value="disconnected">Disconnected</SelectItem><SelectItem value="error">Error</SelectItem></SelectContent></Select></FormField></div><DialogFooter><Button variant="ghost" onClick={() => crud.setDialog(false)} className="text-gray-400">Cancel</Button><Button onClick={crud.handleSave} className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90 font-semibold">Save</Button></DialogFooter></DialogContent></Dialog>
    </motion.div>
  )
}

// ─── Email Templates Module ──────────────────────────────
function EmailTemplatesModule() {
  const crud = useCrudModule('/api/email-templates')
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <ModuleHeader title="Email Templates" description="Create and manage reusable email templates for outreach" icon={MailOpen} onAdd={() => crud.openNew({ name: '', subject: '', body: '', category: 'general', variables: '[]', status: 'active' })} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Templates" value={crud.items.length} icon={MailOpen} color="text-blue-400" />
        <StatCard label="Total Sent" value={crud.items.reduce((a: number, t: any) => a + (t.usageCount || 0), 0)} icon={Send} color="text-purple-400" delay={0.1} />
        <StatCard label="General" value={crud.items.filter((t: any) => t.category === 'general').length} icon={MailOpen} color="text-yellow-400" delay={0.2} />
        <StatCard label="Follow-up" value={crud.items.filter((t: any) => t.category === 'followup').length} icon={MailPlus} color="text-emerald-400" delay={0.3} />
      </div>
      <Card className="bg-[#181818] border-[#2a2a2a]"><CardContent className="p-0"><Table><TableHeader><TableRow className="border-[#2a2a2a] hover:bg-transparent"><TableHead className="text-gray-400">Name</TableHead><TableHead className="text-gray-400">Subject</TableHead><TableHead className="text-gray-400">Category</TableHead><TableHead className="text-gray-400">Usage</TableHead><TableHead className="text-gray-400">Actions</TableHead></TableRow></TableHeader>
        <TableBody>{crud.items.map((t: any) => (
          <TableRow key={t.id} className="border-[#2a2a2a] hover:bg-white/5"><TableCell className="text-white text-sm">{t.name}</TableCell><TableCell className="text-gray-300 text-sm">{t.subject}</TableCell><TableCell className="text-gray-300 text-sm capitalize">{t.category}</TableCell><TableCell className="text-gray-300 text-sm">{t.usageCount}</TableCell><TableCell><div className="flex gap-1"><Button size="sm" variant="ghost" onClick={() => crud.openEdit(t)} className="text-blue-400 h-7 w-7 p-0"><Edit className="w-3.5 h-3.5" /></Button><Button size="sm" variant="ghost" onClick={() => crud.handleDelete(t.id)} className="text-red-400 h-7 w-7 p-0"><Trash2 className="w-3.5 h-3.5" /></Button></div></TableCell></TableRow>
        ))}{crud.items.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-gray-500 py-8">No templates found</TableCell></TableRow>}</TableBody></Table></CardContent></Card>
      <Dialog open={crud.dialog} onOpenChange={crud.setDialog}><DialogContent className="bg-[#181818] border-[#2a2a2a] text-white max-w-lg"><DialogHeader><DialogTitle className="text-white">{crud.editItem ? 'Edit' : 'Add'} Template</DialogTitle></DialogHeader><div className="space-y-3 max-h-[60vh] overflow-y-auto"><FormField label="Name"><Input value={crud.form.name || ''} onChange={e => crud.setForm({ ...crud.form, name: e.target.value })} className="bg-[#0b0b0b] border-[#2a2a2a] text-white" /></FormField><FormField label="Subject"><Input value={crud.form.subject || ''} onChange={e => crud.setForm({ ...crud.form, subject: e.target.value })} className="bg-[#0b0b0b] border-[#2a2a2a] text-white" /></FormField><FormField label="Body"><Textarea value={crud.form.body || ''} onChange={e => crud.setForm({ ...crud.form, body: e.target.value })} className="bg-[#0b0b0b] border-[#2a2a2a] text-white" rows={6} /></FormField><FormField label="Category"><Select value={crud.form.category || 'general'} onValueChange={v => crud.setForm({ ...crud.form, category: v })}><SelectTrigger className="bg-[#0b0b0b] border-[#2a2a2a] text-white"><SelectValue /></SelectTrigger><SelectContent className="bg-[#181818] border-[#2a2a2a]"><SelectItem value="general">General</SelectItem><SelectItem value="followup">Follow-up</SelectItem><SelectItem value="quotation">Quotation</SelectItem><SelectItem value="nurture">Nurture</SelectItem></SelectContent></Select></FormField></div><DialogFooter><Button variant="ghost" onClick={() => crud.setDialog(false)} className="text-gray-400">Cancel</Button><Button onClick={crud.handleSave} className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90 font-semibold">Save</Button></DialogFooter></DialogContent></Dialog>
    </motion.div>
  )
}

// ─── Email Sequences Module ──────────────────────────────
function EmailSequencesModule() {
  const crud = useCrudModule('/api/email-sequences')
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <ModuleHeader title="Email Sequences" description="Build automated email drip campaigns and follow-up sequences" icon={MailPlus} onAdd={() => crud.openNew({ name: '', description: '', triggerType: 'manual', status: 'active' })} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active" value={crud.items.filter((s: any) => s.status === 'active').length} icon={MailPlus} color="text-blue-400" />
        <StatCard label="Total" value={crud.items.length} icon={LayoutGrid} color="text-purple-400" delay={0.1} />
        <StatCard label="Manual Trigger" value={crud.items.filter((s: any) => s.triggerType === 'manual').length} icon={CalendarDays} color="text-yellow-400" delay={0.2} />
        <StatCard label="Auto Trigger" value={crud.items.filter((s: any) => s.triggerType !== 'manual').length} icon={Zap} color="text-emerald-400" delay={0.3} />
      </div>
      <Card className="bg-[#181818] border-[#2a2a2a]"><CardContent className="p-0"><Table><TableHeader><TableRow className="border-[#2a2a2a] hover:bg-transparent"><TableHead className="text-gray-400">Name</TableHead><TableHead className="text-gray-400">Trigger</TableHead><TableHead className="text-gray-400">Description</TableHead><TableHead className="text-gray-400">Status</TableHead><TableHead className="text-gray-400">Actions</TableHead></TableRow></TableHeader>
        <TableBody>{crud.items.map((s: any) => (
          <TableRow key={s.id} className="border-[#2a2a2a] hover:bg-white/5"><TableCell className="text-white text-sm">{s.name}</TableCell><TableCell className="text-gray-300 text-sm capitalize">{s.triggerType?.replace('_', ' ')}</TableCell><TableCell className="text-gray-400 text-sm max-w-[200px] truncate">{s.description || '-'}</TableCell><TableCell><Badge className={`text-[10px] ${statusBadgeCls(s.status)}`}>{s.status}</Badge></TableCell><TableCell><div className="flex gap-1"><Button size="sm" variant="ghost" onClick={() => crud.openEdit(s)} className="text-blue-400 h-7 w-7 p-0"><Edit className="w-3.5 h-3.5" /></Button><Button size="sm" variant="ghost" onClick={() => crud.handleDelete(s.id)} className="text-red-400 h-7 w-7 p-0"><Trash2 className="w-3.5 h-3.5" /></Button></div></TableCell></TableRow>
        ))}{crud.items.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-gray-500 py-8">No sequences found</TableCell></TableRow>}</TableBody></Table></CardContent></Card>
      <Dialog open={crud.dialog} onOpenChange={crud.setDialog}><DialogContent className="bg-[#181818] border-[#2a2a2a] text-white max-w-lg"><DialogHeader><DialogTitle className="text-white">{crud.editItem ? 'Edit' : 'Add'} Sequence</DialogTitle></DialogHeader><div className="space-y-3"><FormField label="Name"><Input value={crud.form.name || ''} onChange={e => crud.setForm({ ...crud.form, name: e.target.value })} className="bg-[#0b0b0b] border-[#2a2a2a] text-white" /></FormField><FormField label="Description"><Textarea value={crud.form.description || ''} onChange={e => crud.setForm({ ...crud.form, description: e.target.value })} className="bg-[#0b0b0b] border-[#2a2a2a] text-white" rows={2} /></FormField><FormField label="Trigger Type"><Select value={crud.form.triggerType || 'manual'} onValueChange={v => crud.setForm({ ...crud.form, triggerType: v })}><SelectTrigger className="bg-[#0b0b0b] border-[#2a2a2a] text-white"><SelectValue /></SelectTrigger><SelectContent className="bg-[#181818] border-[#2a2a2a]"><SelectItem value="manual">Manual</SelectItem><SelectItem value="lead_created">Lead Created</SelectItem><SelectItem value="status_changed">Status Changed</SelectItem></SelectContent></Select></FormField><FormField label="Status"><Select value={crud.form.status || 'active'} onValueChange={v => crud.setForm({ ...crud.form, status: v })}><SelectTrigger className="bg-[#0b0b0b] border-[#2a2a2a] text-white"><SelectValue /></SelectTrigger><SelectContent className="bg-[#181818] border-[#2a2a2a]"><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select></FormField></div><DialogFooter><Button variant="ghost" onClick={() => crud.setDialog(false)} className="text-gray-400">Cancel</Button><Button onClick={crud.handleSave} className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90 font-semibold">Save</Button></DialogFooter></DialogContent></Dialog>
    </motion.div>
  )
}


// ─── CRM Sales Modules ───────────────────────────────────
function CrmSalesModule({ title, description, icon: Icon, type }: { title: string; description: string; icon: React.ElementType; type: string }) {
  const [items, setItems] = useState<any[]>([])
  useEffect(() => {
    const apiMap: Record<string, string> = { sales: '/api/quotations', quotes: '/api/quotations', invoices: '/api/quotations', billing: '/api/quotations' }
    fetch(`${apiMap[type] || '/api/quotations'}?limit=50`).then(r => r.json()).then(j => { if (j.status) { const raw = j.data?.quotations || j.data || []; setItems(Array.isArray(raw) ? raw : []) } }).catch(() => {})
  }, [type])
  const totalValue = items.reduce((a: number, q: any) => a + (q.amount || 0), 0)
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <ModuleHeader title={title} description={description} icon={Icon} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total" value={items.length} icon={Icon} color="text-blue-400" />
        <StatCard label="Value" value={fmt(totalValue)} icon={DollarSign} color="text-[#59ff00]" delay={0.1} />
        <StatCard label="Pending" value={items.filter((q: any) => q.status === 'draft' || q.status === 'sent').length} icon={Clock} color="text-yellow-400" delay={0.2} />
        <StatCard label="Accepted" value={items.filter((q: any) => q.status === 'accepted').length} icon={Check} color="text-emerald-400" delay={0.3} />
      </div>
      <Card className="bg-[#181818] border-[#2a2a2a]"><CardContent className="p-0"><Table><TableHeader><TableRow className="border-[#2a2a2a] hover:bg-transparent"><TableHead className="text-gray-400">#</TableHead><TableHead className="text-gray-400">Customer</TableHead><TableHead className="text-gray-400">Amount</TableHead><TableHead className="text-gray-400">Status</TableHead><TableHead className="text-gray-400">Date</TableHead></TableRow></TableHeader>
        <TableBody>{items.map((q: any) => (
          <TableRow key={q.id} className="border-[#2a2a2a] hover:bg-white/5"><TableCell className="text-white text-sm">{q.quotationNumber}</TableCell><TableCell className="text-gray-300 text-sm">{q.customerName}</TableCell><TableCell className="text-gray-300 text-sm">{fmt(q.amount)}</TableCell><TableCell><Badge className={`text-[10px] ${statusBadgeCls(q.status)}`}>{q.status}</Badge></TableCell><TableCell className="text-gray-400 text-xs">{fmtDate(q.createdAt)}</TableCell></TableRow>
        ))}{items.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-gray-500 py-8">No data found</TableCell></TableRow>}</TableBody></Table></CardContent></Card>
    </motion.div>
  )
}

// ─── Sales Calendar Module ───────────────────────────────
function SalesCalendarModule() {
  const [orders, setOrders] = useState<any[]>([])
  useEffect(() => { fetch('/api/orders?limit=20').then(r => r.json()).then(j => { if (j.status) setOrders(j.data.orders || []) }).catch(() => {}) }, [])
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <ModuleHeader title="Sales Calendar" description="Schedule and track sales activities and meetings" icon={CalendarRange} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Today" value={orders.filter((o: any) => new Date(o.createdAt).toDateString() === new Date().toDateString()).length} icon={CalendarRange} color="text-blue-400" />
        <StatCard label="This Week" value={orders.filter((o: any) => { const d = new Date(o.createdAt); const now = new Date(); const diff = now.getTime() - d.getTime(); return diff < 7 * 24 * 60 * 60 * 1000 }).length} icon={CalendarDays} color="text-purple-400" delay={0.1} />
        <StatCard label="This Month" value={orders.length} icon={LayoutGrid} color="text-yellow-400" delay={0.2} />
        <StatCard label="Total Value" value={fmt(orders.reduce((a: number, o: any) => a + (o.total || 0), 0))} icon={DollarSign} color="text-[#59ff00]" delay={0.3} />
      </div>
      <Card className="bg-[#181818] border-[#2a2a2a]"><CardContent className="p-4">
        <h3 className="text-white font-semibold text-sm mb-3">Recent Sales Activity</h3>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {orders.map((o: any) => (
            <div key={o.id} className="flex items-center justify-between py-2 border-b border-[#2a2a2a] last:border-0">
              <div><p className="text-white text-sm">{o.orderNumber}</p><p className="text-gray-500 text-xs">{o.customer?.name || 'Unknown'}</p></div>
              <div className="text-right"><p className="text-[#59ff00] text-sm font-medium">{fmt(o.total)}</p><p className="text-gray-500 text-xs">{fmtDate(o.createdAt)}</p></div>
            </div>
          ))}
          {orders.length === 0 && <p className="text-gray-500 text-sm text-center py-4">No orders yet</p>}
        </div>
      </CardContent></Card>
    </motion.div>
  )
}

// ─── Main Export ─────────────────────────────────────────
export default function CrmModules({ adminTab, leads, employees }: CrmModulesProps) {
  switch (adminTab) {
    case 'crm-dashboard': return <CrmDashboard leads={leads} />
    case 'crm-companies': return <CompaniesModule />
    case 'crm-pipelines': return <PipelinesModule />
    case 'crm-pipeline': return <PipelineModule />
    case 'crm-kanban': return <KanbanModule />
    case 'crm-calendar': return <CalendarModule />
    case 'crm-forms': return <FormsModule />
    case 'crm-imports': return <ImportsModule />
    case 'crm-conversations': return <ConversationsModule />
    case 'crm-lead-sources': return <LeadSourcesModule />
    case 'crm-integrations': return <IntegrationsModule />
    case 'crm-email-templates': return <EmailTemplatesModule />
    case 'crm-email-sequences': return <EmailSequencesModule />

    // CRM Sales
    case 'crm-sales': return <CrmSalesModule title="Sales" description="Track sales performance, targets, and revenue metrics" icon={DollarSign} type="sales" />
    case 'crm-quotes': return <CrmSalesModule title="Quotes" description="Manage sales quotes and proposals" icon={Receipt} type="quotes" />
    case 'crm-invoices': return <CrmSalesModule title="Invoices" description="Create, send, and track customer invoices" icon={Receipt} type="invoices" />
    case 'crm-billing': return <CrmSalesModule title="Billing" description="Manage billing cycles, payments, and financial records" icon={CreditCard} type="billing" />
    case 'crm-sales-calendar': return <SalesCalendarModule />
    default: return null
  }
}
