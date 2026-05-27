'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { fmtDate, orderBadge, leadBadge } from './types'

interface ActivityTabProps {
  activityList: any[]
}

export default function ActivityTab({ activityList }: ActivityTabProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <h2 className="text-white text-xl font-bold">Recent Activity</h2>
      <Card className="bg-[#181818] border-[#2a2a2a]">
        <CardContent className="p-4">
          <div className="max-h-[600px] overflow-y-auto custom-scrollbar space-y-3">
            {activityList.map((a: any, i: number) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-[#0b0b0b] border border-[#2a2a2a]">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${a.type === 'order' ? 'bg-blue-500/10' : 'bg-purple-500/10'}`}>
                  {a.type === 'order' ? <ShoppingCart className="w-4 h-4 text-blue-400" /> : <Users className="w-4 h-4 text-purple-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm">{a.description}</p>
                  <p className="text-gray-500 text-xs mt-1">{fmtDate(a.date)}</p>
                </div>
                <Badge className={`text-[10px] ${a.type === 'order' ? orderBadge(a.status) : leadBadge(a.status)}`}>{a.status?.replace('_', ' ')}</Badge>
              </div>
            ))}
            {activityList.length === 0 && <p className="text-gray-500 text-sm text-center py-8">No recent activity</p>}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
