'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Clock, CheckSquare, DollarSign, CalendarDays,
  LogOut, Play, Square, ChevronDown, ChevronUp, AlertCircle,
  CheckCircle2, Circle, ArrowUpRight, FileText, Plus, Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { useAppStore, type EmployeeTab } from '@/lib/store'
import { toast } from 'sonner'

const formatPrice = (price: number) => {
  const str = price.toString()
  let lastThree = str.substring(str.length - 3)
  const otherNumbers = str.substring(0, str.length - 3)
  if (otherNumbers !== '') lastThree = ',' + lastThree
  return '₹' + otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree
}

const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
const formatTime = (d: string) => new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

const statusColor: Record<string, string> = {
  present: 'bg-green-500/10 text-green-400 border-green-500/20',
  absent: 'bg-red-500/10 text-red-400 border-red-500/20',
  half_day: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  holiday: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  in_progress: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  completed: 'bg-green-500/10 text-green-400 border-green-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
  low: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  urgent: 'bg-red-500/10 text-red-400 border-red-500/20',
  approved: 'bg-green-500/10 text-green-400 border-green-500/20',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
  active: 'bg-green-500/10 text-green-400 border-green-500/20',
}

const priorityIcon: Record<string, React.ReactNode> = {
  low: <ArrowUpRight className="w-3 h-3 text-blue-400" />,
  medium: <ArrowUpRight className="w-3 h-3 text-yellow-400" />,
  high: <AlertCircle className="w-3 h-3 text-orange-400" />,
  urgent: <AlertCircle className="w-3 h-3 text-red-400" />,
}

const tabs: { id: EmployeeTab; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'attendance', label: 'Attendance', icon: <Clock className="w-4 h-4" /> },
  { id: 'tasks', label: 'My Tasks', icon: <CheckSquare className="w-4 h-4" /> },
  { id: 'salary', label: 'Salary', icon: <DollarSign className="w-4 h-4" /> },
  { id: 'leaves', label: 'Leaves', icon: <CalendarDays className="w-4 h-4" /> },
]

export default function EmployeePortal() {
  const { employeeTab, setEmployeeTab, setView, user, setUser } = useAppStore()
  const [tasks, setTasks] = useState<any[]>([])
  const [attendance, setAttendance] = useState<any[]>([])
  const [leaves, setLeaves] = useState<any[]>([])
  const [salarySlips, setSalarySlips] = useState<any[]>([])
  const [employee, setEmployee] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [checkedIn, setCheckedIn] = useState(false)
  const [checkinTime, setCheckinTime] = useState<string | null>(null)
  const [checkoutTime, setCheckoutTime] = useState<string | null>(null)
  const [leaveDialog, setLeaveDialog] = useState(false)
  const [taskFilter, setTaskFilter] = useState('all')
  const [submitting, setSubmitting] = useState(false)

  // Fetch employee record for logged-in user
  const fetchEmployee = useCallback(async (userId: string) => {
    if (!userId) return null
    try {
      const res = await fetch(`/api/employees?limit=100`)
      const data = await res.json()
      if (data.status) {
        const emps = data.data?.employees || data.data || []
        const myEmp = emps.find((e: any) => e.userId === userId)
        if (myEmp) {
          setEmployee(myEmp)
          return myEmp
        }
      }
    } catch (err) {
      console.error('Failed to fetch employee:', err)
    }
    return null
  }, [])

  // Fetch attendance for employee
  const fetchAttendance = useCallback(async (empId: string) => {
    try {
      const res = await fetch(`/api/attendance?employeeId=${empId}&limit=30`)
      const data = await res.json()
      if (data.status) {
        const records = data.data?.records || data.data || []
        setAttendance(records)
        // Check today's check-in status
        const today = new Date().toDateString()
        const todayAtt = records.find((a: any) => new Date(a.date).toDateString() === today)
        if (todayAtt?.checkin) {
          setCheckedIn(true)
          setCheckinTime(formatTime(todayAtt.checkin))
          if (todayAtt.checkout) {
            setCheckoutTime(formatTime(todayAtt.checkout))
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch attendance:', err)
    }
  }, [])

  // Fetch tasks for employee
  const fetchTasks = useCallback(async (empId: string) => {
    try {
      const res = await fetch(`/api/tasks?employeeId=${empId}&limit=50`)
      const data = await res.json()
      if (data.status) {
        setTasks(data.data?.tasks || data.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err)
    }
  }, [])

  // Fetch leaves for employee
  const fetchLeaves = useCallback(async (empId: string) => {
    try {
      const res = await fetch(`/api/leaves?employeeId=${empId}&limit=50`)
      const data = await res.json()
      if (data.status) {
        setLeaves(data.data?.leaves || data.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch leaves:', err)
    }
  }, [])

  // Fetch salary slips for employee
  const fetchSalarySlips = useCallback(async (empId: string) => {
    try {
      const res = await fetch(`/api/salary-slips?employeeId=${empId}&limit=12`)
      const data = await res.json()
      if (data.status) {
        setSalarySlips(data.data?.slips || data.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch salary slips:', err)
    }
  }, [])

  // Load all data on mount
  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return
      setLoading(true)
      try {
        const emp = await fetchEmployee(user.id)
        if (emp) {
          await Promise.all([
            fetchAttendance(emp.id),
            fetchTasks(emp.id),
            fetchLeaves(emp.id),
            fetchSalarySlips(emp.id),
          ])
        }
      } catch (err) {
        console.error('Failed to load employee data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [user?.id, fetchEmployee, fetchAttendance, fetchTasks, fetchLeaves, fetchSalarySlips])

  // Check-in / Check-out handler
  const handleCheckIn = async () => {
    if (!employee) return
    setSubmitting(true)
    try {
      const action = checkedIn ? 'checkout' : 'checkin'
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: employee.id, action }),
      })
      const data = await res.json()
      if (data.status) {
        if (action === 'checkin') {
          setCheckedIn(true)
          setCheckinTime(formatTime(new Date().toISOString()))
          setCheckoutTime(null)
          toast.success('Checked in successfully')
        } else {
          setCheckedIn(false)
          setCheckoutTime(formatTime(new Date().toISOString()))
          toast.success('Checked out successfully')
        }
        // Refresh attendance
        await fetchAttendance(employee.id)
      } else {
        toast.error(data.message || 'Failed to update attendance')
      }
    } catch {
      toast.error('Failed to update attendance')
    } finally {
      setSubmitting(false)
    }
  }

  // Update task status
  const handleTaskStatus = async (taskId: string, status: string) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, status }),
      })
      const data = await res.json()
      if (data.status) {
        toast.success(`Task marked as ${status.replace('_', ' ')}`)
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t))
      } else {
        toast.error(data.message || 'Failed to update task')
      }
    } catch {
      toast.error('Failed to update task')
    }
  }

  // Apply for leave
  const handleApplyLeave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!employee) {
      toast.error('Employee record not found')
      return
    }
    const form = e.currentTarget
    const formData = new FormData(form)
    const type = formData.get('type') as string
    const startDate = formData.get('startDate') as string
    const endDate = formData.get('endDate') as string
    const reason = formData.get('reason') as string

    if (!type || !startDate || !endDate) {
      toast.error('Please fill all required fields')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: employee.id,
          type,
          startDate,
          endDate,
          reason,
        }),
      })
      const data = await res.json()
      if (data.status) {
        toast.success('Leave application submitted successfully')
        setLeaveDialog(false)
        // Reset form
        form.reset()
        // Refresh leaves
        await fetchLeaves(employee.id)
      } else {
        toast.error(data.message || 'Failed to apply for leave')
      }
    } catch {
      toast.error('Failed to apply for leave')
    } finally {
      setSubmitting(false)
    }
  }

  const handleLogout = () => {
    setUser(null)
    setView('home')
  }

  const pendingTasks = tasks.filter(t => t.status === 'pending').length
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length
  const completedTasks = tasks.filter(t => t.status === 'completed').length
  const filteredTasks = taskFilter === 'all' ? tasks : tasks.filter(t => t.status === taskFilter)

  // Leave balance calculation
  const casualUsed = leaves.filter((l: any) => l.type === 'casual' && l.status === 'approved').length
  const sickUsed = leaves.filter((l: any) => l.type === 'sick' && l.status === 'approved').length
  const earnedUsed = leaves.filter((l: any) => l.type === 'earned' && l.status === 'approved').length

  const leaveBalances = [
    { type: 'Casual', total: 12, used: casualUsed, color: 'bg-blue-500' },
    { type: 'Sick', total: 10, used: sickUsed, color: 'bg-red-500' },
    { type: 'Earned', total: 15, used: earnedUsed, color: 'bg-green-500' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] pt-20 md:pt-24 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#59ff00] animate-spin" />
          <p className="text-gray-500 text-sm">Loading employee portal...</p>
        </div>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] pt-20 md:pt-24 flex items-center justify-center">
        <div className="bg-[#151515] border border-[#2a2a2a] rounded-xl p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-white font-semibold text-lg mb-2">Employee Record Not Found</h2>
          <p className="text-gray-500 text-sm mb-4">Your account does not have an associated employee record. Please contact HR.</p>
          <Button onClick={handleLogout} variant="outline" className="border-[#2a2a2a] text-gray-400">
            <LogOut className="w-4 h-4 mr-2" />Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0b0b0b] pt-20 md:pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-[family-name:var(--font-poppins)] text-xl md:text-2xl font-bold text-white">Employee Portal</h1>
            <p className="text-gray-500 text-sm">Welcome, {user?.name || employee?.user?.name || 'Employee'}</p>
          </div>
          <Button onClick={handleLogout} variant="ghost" className="text-gray-500 hover:text-red-400 text-sm">
            <LogOut className="w-4 h-4 mr-2" />Logout
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="md:w-56 shrink-0">
            <div className="bg-[#151515] border border-[#2a2a2a] rounded-xl p-2 flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible sticky top-24">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setEmployeeTab(tab.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    employeeTab === tab.id
                      ? 'bg-[#59ff00]/10 text-[#59ff00]'
                      : 'text-gray-500 hover:text-white hover:bg-[#1a1a1a]'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <motion.div key={employeeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>

              {/* ===================== DASHBOARD TAB ===================== */}
              {employeeTab === 'dashboard' && (
                <div>
                  <h2 className="font-[family-name:var(--font-poppins)] text-lg font-bold text-white mb-4">Dashboard</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-[#151515] border border-[#2a2a2a] rounded-xl p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <div className="text-gray-500 text-xs">Today&apos;s Status</div>
                          <div className="text-green-400 font-semibold">
                            {checkedIn ? (checkoutTime ? 'Checked Out' : 'Checked In') : 'Not Checked In'}
                          </div>
                        </div>
                      </div>
                      {checkinTime && <div className="text-gray-600 text-xs mt-2 ml-13">Since {checkinTime}</div>}
                    </div>
                    <div className="bg-[#151515] border border-[#2a2a2a] rounded-xl p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                          <AlertCircle className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div>
                          <div className="text-gray-500 text-xs">Pending Tasks</div>
                          <div className="text-yellow-400 font-semibold text-lg">{pendingTasks}</div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-[#151515] border border-[#2a2a2a] rounded-xl p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                          <Play className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <div className="text-gray-500 text-xs">In Progress</div>
                          <div className="text-blue-400 font-semibold text-lg">{inProgressTasks}</div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-[#151515] border border-[#2a2a2a] rounded-xl p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#59ff00]/10 flex items-center justify-center">
                          <CheckSquare className="w-5 h-5 text-[#59ff00]" />
                        </div>
                        <div>
                          <div className="text-gray-500 text-xs">Completed</div>
                          <div className="text-[#59ff00] font-semibold text-lg">{completedTasks}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-[#151515] border border-[#2a2a2a] rounded-xl p-6">
                    <h3 className="font-[family-name:var(--font-poppins)] text-white font-semibold mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <button
                        onClick={handleCheckIn}
                        disabled={submitting || !!checkoutTime}
                        className={`flex flex-col items-center gap-2 rounded-lg p-4 transition-colors disabled:opacity-50 ${
                          checkoutTime
                            ? 'bg-gray-500/10 border border-gray-500/20 text-gray-500'
                            : checkedIn
                            ? 'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20'
                            : 'bg-[#1a1a1a] border border-[#2a2a2a] text-gray-400 hover:text-[#59ff00] hover:border-[#59ff00]/30'
                        }`}
                      >
                        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : checkoutTime ? <Square className="w-5 h-5" /> : checkedIn ? <Square className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                        <span className="text-xs">{checkoutTime ? 'Done for Today' : checkedIn ? 'Check Out' : 'Check In'}</span>
                      </button>
                      <button
                        onClick={() => setEmployeeTab('tasks')}
                        className="flex flex-col items-center gap-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4 text-gray-400 hover:text-[#59ff00] hover:border-[#59ff00]/30 transition-colors"
                      >
                        <CheckSquare className="w-5 h-5" /><span className="text-xs">View Tasks</span>
                      </button>
                      <button
                        onClick={() => setLeaveDialog(true)}
                        className="flex flex-col items-center gap-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4 text-gray-400 hover:text-[#59ff00] hover:border-[#59ff00]/30 transition-colors"
                      >
                        <CalendarDays className="w-5 h-5" /><span className="text-xs">Apply Leave</span>
                      </button>
                      <button
                        onClick={() => setEmployeeTab('salary')}
                        className="flex flex-col items-center gap-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4 text-gray-400 hover:text-[#59ff00] hover:border-[#59ff00]/30 transition-colors"
                      >
                        <DollarSign className="w-5 h-5" /><span className="text-xs">View Payslip</span>
                      </button>
                    </div>
                  </div>

                  {/* Active Tasks */}
                  {tasks.filter(t => t.status === 'in_progress').length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-white font-semibold mb-3">Active Tasks</h3>
                      <div className="space-y-2">
                        {tasks.filter(t => t.status === 'in_progress').map(task => (
                          <div key={task.id} className="bg-[#151515] border border-[#2a2a2a] rounded-lg p-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {priorityIcon[task.priority]}
                              <div>
                                <div className="text-white text-sm">{task.title}</div>
                                <div className="text-gray-600 text-xs">Due: {task.dueDate ? formatDate(task.dueDate) : 'N/A'}</div>
                              </div>
                            </div>
                            <Badge className={`${statusColor[task.priority] || ''} text-xs`}>{task.priority}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ===================== ATTENDANCE TAB ===================== */}
              {employeeTab === 'attendance' && (
                <div>
                  <h2 className="font-[family-name:var(--font-poppins)] text-lg font-bold text-white mb-4">Attendance</h2>
                  <div className="flex items-center gap-4 mb-6">
                    <Button
                      onClick={handleCheckIn}
                      disabled={submitting || !!checkoutTime}
                      className={checkoutTime
                        ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                        : checkedIn
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-[#59ff00] text-black hover:bg-[#59ff00]/90'
                      }
                    >
                      {submitting ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</>
                      ) : checkoutTime ? (
                        <><Square className="w-4 h-4 mr-2" />Done for Today</>
                      ) : checkedIn ? (
                        <><Square className="w-4 h-4 mr-2" />Check Out</>
                      ) : (
                        <><Play className="w-4 h-4 mr-2" />Check In</>
                      )}
                    </Button>
                    {checkinTime && (
                      <span className="text-gray-500 text-sm">
                        Checked in at {checkinTime}
                        {checkoutTime && ` | Checked out at ${checkoutTime}`}
                      </span>
                    )}
                  </div>

                  {/* Calendar View */}
                  <div className="bg-[#151515] border border-[#2a2a2a] rounded-xl p-5 mb-6">
                    <h3 className="text-white font-semibold mb-4">This Month&apos;s Calendar</h3>
                    <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                        <div key={d} className="text-gray-600 py-1">{d}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {(() => {
                        const now = new Date()
                        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getDay()
                        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
                        const cells: React.ReactElement[] = []
                        for (let i = 0; i < firstDay; i++) cells.push(<div key={`e-${i}`} />)
                        for (let d = 1; d <= daysInMonth; d++) {
                          const date = new Date(now.getFullYear(), now.getMonth(), d)
                          const att = attendance.find((a: any) => new Date(a.date).toDateString() === date.toDateString())
                          const isToday = date.toDateString() === now.toDateString()
                          let bgClass = 'bg-[#1a1a1a] text-gray-600'
                          if (att?.status === 'present') bgClass = 'bg-green-500/20 text-green-400'
                          else if (att?.status === 'absent') bgClass = 'bg-red-500/20 text-red-400'
                          else if (att?.status === 'half_day') bgClass = 'bg-yellow-500/20 text-yellow-400'
                          else if (date > now) bgClass = 'bg-[#0b0b0b] text-gray-700'
                          else if (date.getDay() === 0) bgClass = 'bg-blue-500/10 text-blue-400'
                          cells.push(
                            <div key={d} className={`rounded-md p-1.5 text-xs font-medium ${bgClass} ${isToday ? 'ring-1 ring-[#59ff00]' : ''}`}>
                              {d}
                            </div>
                          )
                        }
                        return cells
                      })()}
                    </div>
                    <div className="flex items-center gap-4 mt-4 text-xs">
                      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500/20" /> Present</span>
                      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500/20" /> Absent</span>
                      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-500/20" /> Half Day</span>
                      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-500/10" /> Holiday</span>
                    </div>
                  </div>

                  {/* Attendance History Table */}
                  {attendance.length > 0 ? (
                    <div className="bg-[#151515] border border-[#2a2a2a] rounded-xl overflow-hidden">
                      <div className="overflow-x-auto max-h-96">
                        <table className="w-full text-sm">
                          <thead className="bg-[#1a1a1a] sticky top-0">
                            <tr>
                              <th className="text-left px-4 py-3 text-gray-500 font-medium">Date</th>
                              <th className="text-left px-4 py-3 text-gray-500 font-medium">Check In</th>
                              <th className="text-left px-4 py-3 text-gray-500 font-medium">Check Out</th>
                              <th className="text-left px-4 py-3 text-gray-500 font-medium">Hours</th>
                              <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {attendance.map((att: any) => {
                              const hours = att.checkin && att.checkout
                                ? ((new Date(att.checkout).getTime() - new Date(att.checkin).getTime()) / 3600000).toFixed(1)
                                : '-'
                              return (
                                <tr key={att.id} className="border-t border-[#2a2a2a] hover:bg-[#1a1a1a]">
                                  <td className="px-4 py-3 text-white">{formatDate(att.date)}</td>
                                  <td className="px-4 py-3 text-gray-400">{att.checkin ? formatTime(att.checkin) : '-'}</td>
                                  <td className="px-4 py-3 text-gray-400">{att.checkout ? formatTime(att.checkout) : '-'}</td>
                                  <td className="px-4 py-3 text-gray-400">{hours !== '-' ? `${hours}h` : '-'}</td>
                                  <td className="px-4 py-3">
                                    <Badge className={`${statusColor[att.status] || ''} text-xs`}>{att.status}</Badge>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#151515] border border-[#2a2a2a] rounded-xl p-8 text-center text-gray-600">
                      No attendance records found
                    </div>
                  )}
                </div>
              )}

              {/* ===================== TASKS TAB ===================== */}
              {employeeTab === 'tasks' && (
                <div>
                  <h2 className="font-[family-name:var(--font-poppins)] text-lg font-bold text-white mb-4">My Tasks</h2>
                  <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {['all', 'pending', 'in_progress', 'completed'].map(s => (
                      <button
                        key={s}
                        onClick={() => setTaskFilter(s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-colors ${
                          taskFilter === s
                            ? 'bg-[#59ff00]/10 text-[#59ff00] border border-[#59ff00]/20'
                            : 'bg-[#1a1a1a] text-gray-500 hover:text-white border border-[#2a2a2a]'
                        }`}
                      >
                        {s === 'all' ? 'All Tasks' : s.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                  {filteredTasks.length === 0 ? (
                    <div className="bg-[#151515] border border-[#2a2a2a] rounded-xl p-8 text-center text-gray-600">
                      No tasks found
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredTasks.map((task: any) => (
                        <div key={task.id} className="bg-[#151515] border border-[#2a2a2a] rounded-xl p-4 hover:border-[#59ff00]/20 transition-colors">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1">
                              <button
                                onClick={() => {
                                  const nextStatus = task.status === 'pending' ? 'in_progress' : task.status === 'in_progress' ? 'completed' : 'completed'
                                  handleTaskStatus(task.id, nextStatus)
                                }}
                                className="mt-1 shrink-0"
                              >
                                {task.status === 'completed'
                                  ? <CheckCircle2 className="w-5 h-5 text-green-400" />
                                  : task.status === 'in_progress'
                                  ? <Play className="w-5 h-5 text-blue-400" />
                                  : <Circle className="w-5 h-5 text-gray-600" />
                                }
                              </button>
                              <div>
                                <h3 className={`text-sm font-semibold ${task.status === 'completed' ? 'text-gray-500 line-through' : 'text-white'}`}>
                                  {task.title}
                                </h3>
                                {task.description && <p className="text-gray-600 text-xs mt-1">{task.description}</p>}
                                <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
                                  {task.dueDate && (
                                    <span className="flex items-center gap-1">
                                      <CalendarDays className="w-3 h-3" />{formatDate(task.dueDate)}
                                    </span>
                                  )}
                                  <span className="flex items-center gap-1">{priorityIcon[task.priority]}{task.priority}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={`${statusColor[task.status] || ''} text-xs`}>{task.status.replace('_', ' ')}</Badge>
                              {task.status !== 'completed' && (
                                <Select onValueChange={(val) => handleTaskStatus(task.id, val)}>
                                  <SelectTrigger className="w-7 h-7 bg-[#1a1a1a] border-[#2a2a2a] p-0">
                                    <ChevronDown className="w-3 h-3 text-gray-500" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ===================== SALARY TAB ===================== */}
              {employeeTab === 'salary' && (
                <div>
                  <h2 className="font-[family-name:var(--font-poppins)] text-lg font-bold text-white mb-4">Salary & Payslips</h2>
                  {salarySlips.length > 0 ? (
                    <div className="space-y-3">
                      {salarySlips.map((slip: any) => (
                        <SalarySlipCard key={slip.id} slip={slip} />
                      ))}
                    </div>
                  ) : (
                    <div className="bg-[#151515] border border-[#2a2a2a] rounded-xl p-8 text-center">
                      <DollarSign className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                      <h3 className="text-gray-400 font-semibold mb-1">No Salary Slips</h3>
                      <p className="text-gray-600 text-sm">Your salary slips will appear here</p>
                    </div>
                  )}
                </div>
              )}

              {/* ===================== LEAVES TAB ===================== */}
              {employeeTab === 'leaves' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-[family-name:var(--font-poppins)] text-lg font-bold text-white">Leave Management</h2>
                    <Button
                      onClick={() => setLeaveDialog(true)}
                      size="sm"
                      className="bg-[#59ff00] text-black hover:bg-[#59ff00]/90"
                    >
                      <Plus className="w-4 h-4 mr-1" />Apply Leave
                    </Button>
                  </div>

                  {/* Leave Balance */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    {leaveBalances.map(leave => (
                      <div key={leave.type} className="bg-[#151515] border border-[#2a2a2a] rounded-xl p-5">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-gray-400 text-sm">{leave.type} Leave</span>
                          <span className="text-white font-semibold">{leave.total - leave.used} days</span>
                        </div>
                        <Progress value={(leave.used / leave.total) * 100} className="h-2 bg-[#1a1a1a]" />
                        <div className="flex justify-between mt-2 text-xs text-gray-600">
                          <span>{leave.used} used</span>
                          <span>{leave.total} total</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Leave History */}
                  {leaves.length > 0 ? (
                    <div className="bg-[#151515] border border-[#2a2a2a] rounded-xl overflow-hidden">
                      <div className="overflow-x-auto max-h-96">
                        <table className="w-full text-sm">
                          <thead className="bg-[#1a1a1a] sticky top-0">
                            <tr>
                              <th className="text-left px-4 py-3 text-gray-500 font-medium">Type</th>
                              <th className="text-left px-4 py-3 text-gray-500 font-medium">From</th>
                              <th className="text-left px-4 py-3 text-gray-500 font-medium">To</th>
                              <th className="text-left px-4 py-3 text-gray-500 font-medium">Days</th>
                              <th className="text-left px-4 py-3 text-gray-500 font-medium">Reason</th>
                              <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {leaves.map((leave: any) => (
                              <tr key={leave.id} className="border-t border-[#2a2a2a] hover:bg-[#1a1a1a]">
                                <td className="px-4 py-3 capitalize text-white">{leave.type}</td>
                                <td className="px-4 py-3 text-gray-400">{formatDate(leave.startDate)}</td>
                                <td className="px-4 py-3 text-gray-400">{formatDate(leave.endDate)}</td>
                                <td className="px-4 py-3 text-gray-400">
                                  {Math.ceil((new Date(leave.endDate).getTime() - new Date(leave.startDate).getTime()) / 86400000) + 1}
                                </td>
                                <td className="px-4 py-3 text-gray-400 max-w-[150px] truncate">{leave.reason || '-'}</td>
                                <td className="px-4 py-3">
                                  <Badge className={`${statusColor[leave.status] || ''} text-xs`}>{leave.status}</Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#151515] border border-[#2a2a2a] rounded-xl p-8 text-center text-gray-600">
                      No leave records found
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Apply Leave Dialog */}
      <Dialog open={leaveDialog} onOpenChange={setLeaveDialog}>
        <DialogContent className="bg-[#151515] border-[#2a2a2a] text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#59ff00]">Apply for Leave</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleApplyLeave} className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Leave Type</label>
              <Select name="type" defaultValue="casual">
                <SelectTrigger className="bg-[#1a1a1a] border-[#2a2a2a] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                  <SelectItem value="casual">Casual Leave</SelectItem>
                  <SelectItem value="sick">Sick Leave</SelectItem>
                  <SelectItem value="earned">Earned Leave</SelectItem>
                  <SelectItem value="unpaid">Unpaid Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Start Date</label>
                <Input type="date" name="startDate" required className="bg-[#1a1a1a] border-[#2a2a2a] text-white" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">End Date</label>
                <Input type="date" name="endDate" required className="bg-[#1a1a1a] border-[#2a2a2a] text-white" />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Reason</label>
              <Textarea name="reason" placeholder="Enter reason for leave..." className="bg-[#1a1a1a] border-[#2a2a2a] text-white" />
            </div>
            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#59ff00] text-black hover:bg-[#59ff00]/90 font-semibold"
            >
              {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</> : 'Submit Leave Request'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/* ===================== SALARY SLIP CARD ===================== */
function SalarySlipCard({ slip }: { slip: any }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-[#151515] border border-[#2a2a2a] rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-[#1a1a1a] transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-[#59ff00]/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-[#59ff00]" />
          </div>
          <div className="text-left">
            <div className="text-white font-semibold text-sm">{slip.month}</div>
            <div className="text-gray-600 text-xs">Net Pay: {formatPrice(slip.netPay)}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[#59ff00] font-bold">{formatPrice(slip.netPay)}</span>
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-4 border-t border-[#2a2a2a]">
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 pt-4">
            <div className="text-sm"><span className="text-gray-500">Basic</span><div className="text-white">{formatPrice(slip.basic)}</div></div>
            <div className="text-sm"><span className="text-gray-500">HRA</span><div className="text-white">{formatPrice(slip.hra)}</div></div>
            <div className="text-sm"><span className="text-gray-500">Allowance</span><div className="text-white">{formatPrice(slip.allowance)}</div></div>
            <div className="text-sm"><span className="text-gray-500">Deduction</span><div className="text-red-400">-{formatPrice(slip.deduction)}</div></div>
          </div>
          <Separator className="bg-[#2a2a2a] my-3" />
          <div className="flex items-center justify-between">
            <span className="text-white font-semibold">Net Pay</span>
            <span className="text-[#59ff00] font-bold text-lg">{formatPrice(slip.netPay)}</span>
          </div>
          <Button variant="outline" size="sm" className="mt-3 border-[#2a2a2a] text-gray-500 hover:text-[#59ff00] hover:border-[#59ff00]/30 w-full">
            <FileText className="w-4 h-4 mr-2" />Download PDF
          </Button>
        </div>
      )}
    </div>
  )
}
