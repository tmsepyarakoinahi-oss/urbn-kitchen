'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { fmtDate, statusBadgeCls } from './types'

interface AttendanceTabProps {
  attendanceRecords: any[]
}

export default function AttendanceTab({ attendanceRecords }: AttendanceTabProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <h2 className="text-white text-xl font-bold">Attendance</h2>
      <Card className="bg-[#181818] border-[#2a2a2a]">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow className="border-[#2a2a2a] hover:bg-transparent"><TableHead className="text-gray-400">Employee</TableHead><TableHead className="text-gray-400">Date</TableHead><TableHead className="text-gray-400">Check In</TableHead><TableHead className="text-gray-400">Check Out</TableHead><TableHead className="text-gray-400">Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {attendanceRecords.map((a: any) => (
                  <TableRow key={a.id} className="border-[#2a2a2a] hover:bg-white/5">
                    <TableCell className="text-white text-sm">{a.employee?.user?.name || '-'}</TableCell>
                    <TableCell className="text-gray-300 text-sm">{fmtDate(a.date)}</TableCell>
                    <TableCell className="text-gray-300 text-sm">{a.checkin ? new Date(a.checkin).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '-'}</TableCell>
                    <TableCell className="text-gray-300 text-sm">{a.checkout ? new Date(a.checkout).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '-'}</TableCell>
                    <TableCell><Badge className={`text-[10px] ${statusBadgeCls(a.status)}`}>{a.status}</Badge></TableCell>
                  </TableRow>
                ))}
                {attendanceRecords.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-gray-500 py-8">No attendance records</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
