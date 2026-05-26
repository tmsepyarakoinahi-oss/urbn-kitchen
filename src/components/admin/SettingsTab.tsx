'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

interface SettingsTabProps {
  settingsObj: Record<string, string>
  setSettingsObj: React.Dispatch<React.SetStateAction<Record<string, string>>>
  settingsLoading: boolean
}

export default function SettingsTab({ settingsObj, setSettingsObj, settingsLoading }: SettingsTabProps) {
  const handleSaveSettings = async () => {
    try {
      const entries = Object.entries(settingsObj).map(([key, value]) => ({ key, value }))
      const res = await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ settings: entries }) })
      const json = await res.json()
      if (json.status) { toast.success('Settings saved') } else { toast.error('Failed to save settings') }
    } catch (e) { toast.error('Failed to save') }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <h2 className="text-white text-xl font-bold">Company Settings</h2>
      <Card className="bg-[#181818] border-[#2a2a2a]">
        <CardContent className="p-6 space-y-4">
          <div><Label className="text-gray-400 text-xs">Company Name</Label><Input value={settingsObj.company_name || ''} onChange={(e) => setSettingsObj(s => ({ ...s, company_name: e.target.value }))} className="bg-[#0b0b0b] border-[#2a2a2a] text-white" /></div>
          <div><Label className="text-gray-400 text-xs">Email</Label><Input value={settingsObj.company_email || ''} onChange={(e) => setSettingsObj(s => ({ ...s, company_email: e.target.value }))} className="bg-[#0b0b0b] border-[#2a2a2a] text-white" /></div>
          <div><Label className="text-gray-400 text-xs">Phone</Label><Input value={settingsObj.company_phone || ''} onChange={(e) => setSettingsObj(s => ({ ...s, company_phone: e.target.value }))} className="bg-[#0b0b0b] border-[#2a2a2a] text-white" /></div>
          <div><Label className="text-gray-400 text-xs">Address</Label><Textarea value={settingsObj.company_address || ''} onChange={(e) => setSettingsObj(s => ({ ...s, company_address: e.target.value }))} className="bg-[#0b0b0b] border-[#2a2a2a] text-white" rows={3} /></div>
          <div><Label className="text-gray-400 text-xs">GST Number</Label><Input value={settingsObj.gst_number || ''} onChange={(e) => setSettingsObj(s => ({ ...s, gst_number: e.target.value }))} className="bg-[#0b0b0b] border-[#2a2a2a] text-white" /></div>
          <div><Label className="text-gray-400 text-xs">Currency</Label><Input value={settingsObj.currency || ''} onChange={(e) => setSettingsObj(s => ({ ...s, currency: e.target.value }))} className="bg-[#0b0b0b] border-[#2a2a2a] text-white" /></div>
          <Button onClick={handleSaveSettings} disabled={settingsLoading} className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90 font-semibold">{settingsLoading ? 'Saving...' : 'Save Settings'}</Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
