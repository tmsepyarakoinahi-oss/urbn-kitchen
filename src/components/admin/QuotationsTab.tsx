'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Plus, Eye, Edit, Trash2, Mail, MessageSquare, FileText, Send } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { fmt, fmtDate, statusBadgeCls } from './types'
import { toast } from 'sonner'

interface QuotationsTabProps {
  quotationList: any[]
  openNewQuotation: () => void
  openEditQuotation: (q: any) => void
  selectedQuotation: any
  setSelectedQuotation: (q: any) => void
  quotationDetailDialog: boolean
  setQuotationDetailDialog: (v: boolean) => void
  sendingQuotation: boolean
}

export default function QuotationsTab({
  quotationList, openNewQuotation, openEditQuotation,
  selectedQuotation, setSelectedQuotation,
  quotationDetailDialog, setQuotationDetailDialog,
  sendingQuotation,
}: QuotationsTabProps) {
  const openQuotationDetail = (q: any) => {
    fetch(`/api/quotations/${q.id}`).then(r => r.json()).then(j => {
      if (j.status) { setSelectedQuotation(j.data); setQuotationDetailDialog(true) }
    }).catch(console.error)
  }

  const handleQuotationStatusChange = async (id: string, status: string) => {
    try {
      await fetch(`/api/quotations/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
      toast.success(`Quotation ${status}`)
    } catch (e) { toast.error('Failed to update') }
  }

  const handleDeleteQuotation = async (id: string) => {
    if (!confirm('Delete this quotation?')) return
    try {
      await fetch(`/api/quotations/${id}`, { method: 'DELETE' })
      toast.success('Quotation deleted')
    } catch (e) { toast.error('Failed to delete') }
  }

  const handleGeneratePdf = (id: string) => {
    window.open(`/api/quotations/generate-pdf?id=${id}`, '_blank')
  }

  const handleSendQuotation = async (id: string, method: 'email' | 'whatsapp' | 'both') => {
    try {
      const res = await fetch('/api/quotations/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quotationId: id, method }),
      })
      const json = await res.json()
      if (json.status) {
        if (method === 'whatsapp' && json.data?.whatsappUrl) {
          window.open(json.data.whatsappUrl, '_blank')
        }
        if (selectedQuotation?.id === id) {
          fetch(`/api/quotations/${id}`).then(r => r.json()).then(j => { if (j.status) setSelectedQuotation(j.data) }).catch(console.error)
        }
        toast.success(`Quotation sent via ${method === 'both' ? 'email & WhatsApp' : method}`)
      } else {
        toast.error(json.message || `Failed to send via ${method}`)
      }
    } catch (e) {
      toast.error('Failed to send quotation')
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sticky top-0 z-10 bg-[#0b0b0b] pb-2">
        <div>
          <h2 className="text-white text-xl font-bold">Quotations</h2>
          <p className="text-gray-500 text-xs mt-0.5">Create and manage quotations for your customers</p>
        </div>
        <Button onClick={openNewQuotation} className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90 font-semibold shadow-[0_0_20px_rgba(89,255,0,0.3)] w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" /> Create Quotation
        </Button>
      </div>
      <Card className="bg-[#181818] border-[#2a2a2a] hidden lg:block">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-[#2a2a2a] hover:bg-transparent">
                  <TableHead className="text-gray-400">Quotation #</TableHead>
                  <TableHead className="text-gray-400">Customer</TableHead>
                  <TableHead className="text-gray-400">Amount</TableHead>
                  <TableHead className="text-gray-400">Status</TableHead>
                  <TableHead className="text-gray-400">Valid Until</TableHead>
                  <TableHead className="text-gray-400">Sent</TableHead>
                  <TableHead className="text-gray-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotationList.map((q: any) => (
                  <TableRow key={q.id} className="border-[#2a2a2a] hover:bg-white/5">
                    <TableCell className="text-white text-sm font-mono cursor-pointer hover:text-[#59ff00]" onClick={() => openQuotationDetail(q)}>{q.quotationNumber}</TableCell>
                    <TableCell className="text-gray-300 text-sm">
                      <div>{q.customerName || q.lead?.name || '-'}</div>
                      {q.customerCompany && <div className="text-gray-500 text-xs">{q.customerCompany}</div>}
                    </TableCell>
                    <TableCell className="text-[#59ff00] text-sm font-semibold">{fmt(q.amount)}</TableCell>
                    <TableCell>
                      <Select value={q.status} onValueChange={(v) => handleQuotationStatusChange(q.id, v)}>
                        <SelectTrigger className="h-7 w-28 text-xs bg-transparent border-0 p-0">
                          <Badge className={`text-[10px] ${statusBadgeCls(q.status)}`}>{q.status}</Badge>
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="sent">Sent</SelectItem>
                          <SelectItem value="accepted">Accepted</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                          <SelectItem value="expired">Expired</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-gray-400 text-sm">{q.validUntil ? fmtDate(q.validUntil) : '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {q.emailSent && <Badge className="text-[9px] bg-blue-500/20 text-blue-400 border-blue-500/30">Email</Badge>}
                        {q.whatsappSent && <Badge className="text-[9px] bg-green-500/20 text-green-400 border-green-500/30">WA</Badge>}
                        {!q.emailSent && !q.whatsappSent && <span className="text-gray-600 text-xs">—</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openQuotationDetail(q)} className="text-gray-400 hover:text-[#59ff00] h-7 w-7 p-0" title="View"><Eye className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => openEditQuotation(q)} className="text-gray-400 hover:text-yellow-400 h-7 w-7 p-0" title="Edit"><Edit className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleSendQuotation(q.id, 'email')} className="text-gray-400 hover:text-blue-400 h-7 w-7 p-0" title="Send Email"><Mail className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleSendQuotation(q.id, 'whatsapp')} className="text-gray-400 hover:text-green-400 h-7 w-7 p-0" title="Send WhatsApp"><MessageSquare className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleGeneratePdf(q.id)} className="text-gray-400 hover:text-purple-400 h-7 w-7 p-0" title="PDF"><FileText className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteQuotation(q.id)} className="text-gray-400 hover:text-red-400 h-7 w-7 p-0" title="Delete"><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {quotationList.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-gray-500 py-8">No quotations found. Click the &quot;Create Quotation&quot; button above to get started.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Quotation Cards */}
      <div className="lg:hidden space-y-3">
        {quotationList.map((q: any) => (
          <Card key={q.id} className="bg-[#181818] border-[#2a2a2a]">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white font-mono text-sm font-semibold">{q.quotationNumber}</span>
                <Badge className={`text-[10px] ${statusBadgeCls(q.status)}`}>{q.status}</Badge>
              </div>
              <div>
                <p className="text-white text-sm font-medium">{q.customerName || q.lead?.name || '-'}</p>
                {q.customerCompany && <p className="text-gray-500 text-xs">{q.customerCompany}</p>}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#59ff00] font-bold">{fmt(q.amount)}</span>
                <span className="text-gray-500 text-xs">{q.validUntil ? fmtDate(q.validUntil) : 'No expiry'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {q.emailSent && <Badge className="text-[9px] bg-blue-500/20 text-blue-400 border-blue-500/30">Email Sent</Badge>}
                {q.whatsappSent && <Badge className="text-[9px] bg-green-500/20 text-green-400 border-green-500/30">WA Sent</Badge>}
              </div>
              <div className="flex flex-wrap gap-2 pt-2 border-t border-[#2a2a2a]">
                <Button size="sm" onClick={() => openQuotationDetail(q)} className="bg-[#59ff00]/10 text-[#59ff00] hover:bg-[#59ff00]/20 border border-[#59ff00]/30 h-7 text-xs"><Eye className="w-3 h-3 mr-1" /> View</Button>
                <Button size="sm" onClick={() => openEditQuotation(q)} className="bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 border border-yellow-500/30 h-7 text-xs"><Edit className="w-3 h-3 mr-1" /> Edit</Button>
                <Button size="sm" onClick={() => handleSendQuotation(q.id, 'email')} className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/30 h-7 text-xs"><Mail className="w-3 h-3 mr-1" /> Email</Button>
                <Button size="sm" onClick={() => handleSendQuotation(q.id, 'whatsapp')} className="bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/30 h-7 text-xs"><MessageSquare className="w-3 h-3 mr-1" /> WhatsApp</Button>
                <Button size="sm" onClick={() => handleGeneratePdf(q.id)} className="bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/30 h-7 text-xs"><FileText className="w-3 h-3 mr-1" /> PDF</Button>
                <Button size="sm" onClick={() => handleDeleteQuotation(q.id)} className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 h-7 text-xs"><Trash2 className="w-3 h-3 mr-1" /> Delete</Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {quotationList.length === 0 && (
          <div className="text-center text-gray-500 py-8">No quotations found. Click &quot;Create Quotation&quot; to get started.</div>
        )}
      </div>

      {/* Quotation Detail Dialog */}
      <Dialog open={quotationDetailDialog} onOpenChange={setQuotationDetailDialog}>
        <DialogContent className="bg-[#181818] border-[#2a2a2a] text-white max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-3">
              <span>Quotation {selectedQuotation?.quotationNumber}</span>
              <Badge className={`text-xs ${statusBadgeCls(selectedQuotation?.status)}`}>{selectedQuotation?.status}</Badge>
            </DialogTitle>
          </DialogHeader>
          {selectedQuotation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0b0b0b] border border-[#2a2a2a] rounded-lg p-3">
                  <p className="text-gray-500 text-xs mb-1">Bill To</p>
                  <p className="text-white font-semibold">{selectedQuotation.customerName}</p>
                  {selectedQuotation.customerCompany && <p className="text-gray-400 text-sm">{selectedQuotation.customerCompany}</p>}
                  {selectedQuotation.customerAddress && <p className="text-gray-500 text-sm">{selectedQuotation.customerAddress}</p>}
                  {selectedQuotation.customerGst && <p className="text-gray-500 text-xs mt-1">GSTIN: {selectedQuotation.customerGst}</p>}
                </div>
                <div className="bg-[#0b0b0b] border border-[#2a2a2a] rounded-lg p-3">
                  <p className="text-gray-500 text-xs mb-1">Quotation Details</p>
                  <p className="text-gray-300 text-sm">Date: {fmtDate(selectedQuotation.createdAt)}</p>
                  {selectedQuotation.validUntil && <p className="text-gray-300 text-sm">Valid Until: {fmtDate(selectedQuotation.validUntil)}</p>}
                  {selectedQuotation.deliveryPeriod && <p className="text-gray-300 text-sm">Delivery: {selectedQuotation.deliveryPeriod}</p>}
                  {selectedQuotation.warranty && <p className="text-gray-300 text-sm">Warranty: {selectedQuotation.warranty}</p>}
                </div>
              </div>
              {selectedQuotation.items && (
                <div className="bg-[#0b0b0b] border border-[#2a2a2a] rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader><TableRow className="border-[#2a2a2a] hover:bg-transparent">
                      <TableHead className="text-gray-400 text-xs">#</TableHead>
                      <TableHead className="text-gray-400 text-xs">Description</TableHead>
                      <TableHead className="text-gray-400 text-xs text-right">Qty</TableHead>
                      <TableHead className="text-gray-400 text-xs text-right">Rate</TableHead>
                      <TableHead className="text-gray-400 text-xs text-right">GST (18%)</TableHead>
                      <TableHead className="text-gray-400 text-xs text-right">Amount</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {(JSON.parse(selectedQuotation.items || '[]')).map((item: any, i: number) => (
                        <TableRow key={i} className="border-[#2a2a2a] hover:bg-transparent">
                          <TableCell className="text-gray-400 text-xs">{i + 1}</TableCell>
                          <TableCell className="text-white text-xs">{item.desc}{item.hsn ? <span className="text-gray-500 ml-1">({item.hsn})</span> : ''}</TableCell>
                          <TableCell className="text-gray-300 text-xs text-right">{item.qty} {item.unit || 'Nos'}</TableCell>
                          <TableCell className="text-gray-300 text-xs text-right">{fmt(item.rate || 0)}</TableCell>
                          <TableCell className="text-[#59ff00] text-xs text-right">{item.gstPercent || 18}%</TableCell>
                          <TableCell className="text-[#59ff00] text-xs text-right font-semibold">{fmt(item.amount || 0)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              <div className="flex justify-end">
                <div className="w-64 space-y-1.5">
                  <div className="flex justify-between text-sm"><span className="text-gray-400">Subtotal</span><span className="text-gray-300">{fmt(selectedQuotation.subtotal || 0)}</span></div>
                  {selectedQuotation.discountAmount > 0 && <div className="flex justify-between text-sm"><span className="text-gray-400">Discount</span><span className="text-red-400">-{fmt(selectedQuotation.discountAmount)}</span></div>}
                  <div className="flex justify-between text-sm"><span className="text-gray-400">CGST (9%)</span><span className="text-gray-300">{fmt(selectedQuotation.cgstAmount || 0)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-400">SGST (9%)</span><span className="text-gray-300">{fmt(selectedQuotation.sgstAmount || 0)}</span></div>
                  <div className="flex justify-between text-sm pt-2 border-t border-[#2a2a2a]"><span className="text-white font-bold">Grand Total</span><span className="text-[#59ff00] font-bold text-lg">{fmt(selectedQuotation.amount)}</span></div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs">
                {selectedQuotation.emailSent && <span className="text-blue-400">📧 Email sent {selectedQuotation.emailSentAt ? fmtDate(selectedQuotation.emailSentAt) : ''}</span>}
                {selectedQuotation.whatsappSent && <span className="text-green-400">💬 WhatsApp sent {selectedQuotation.whatsappSentAt ? fmtDate(selectedQuotation.whatsappSentAt) : ''}</span>}
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#2a2a2a]">
                <Button onClick={() => openEditQuotation(selectedQuotation)} variant="outline" className="border-[#59ff00]/50 text-[#59ff00] hover:bg-[#59ff00]/10"><Edit className="w-4 h-4 mr-2" /> Edit</Button>
                <Button onClick={() => handleGeneratePdf(selectedQuotation.id)} variant="outline" className="border-[#2a2a2a] text-gray-300 hover:text-white"><FileText className="w-4 h-4 mr-2" /> Download PDF</Button>
                <Button onClick={() => handleSendQuotation(selectedQuotation.id, 'email')} className="bg-blue-600 text-white hover:bg-blue-700" disabled={sendingQuotation}><Mail className="w-4 h-4 mr-2" /> Send Email</Button>
                <Button onClick={() => handleSendQuotation(selectedQuotation.id, 'whatsapp')} className="bg-green-600 text-white hover:bg-green-700" disabled={sendingQuotation}><MessageSquare className="w-4 h-4 mr-2" /> WhatsApp</Button>
                <Button onClick={() => handleSendQuotation(selectedQuotation.id, 'both')} className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90" disabled={sendingQuotation}><Send className="w-4 h-4 mr-2" /> Send Both</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
