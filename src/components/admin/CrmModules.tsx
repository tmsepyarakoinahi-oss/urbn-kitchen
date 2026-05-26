'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Users, Star, DollarSign, TrendingUp, Check, Briefcase,
  CalendarDays, Network, Building2, Plus,
  AlertTriangle, Clock, ArrowRight, LayoutGrid,
  Database, Timer, TrendingDown, Gauge,
  PieChart as PieChartIcon, Target, Kanban, CalendarCheck,
  ClipboardList, Import, MessagesSquare, Megaphone, Webhook,
  MailOpen, MailPlus, Link2, FormInput, BarChart3,
  Receipt, CreditCard, CalendarRange,
  UserPlus, BriefcaseMedical, Mic, Award, Banknote, Wallet,
  GraduationCap, PartyPopper, Bell, Monitor, FolderOpen, Clock4,
  FileSpreadsheet, UsersRound, Lock, Shield, Settings, Package,
  FileText, CalendarClock, Send, Zap,
  Eye, Filter,
} from 'lucide-react'
import { fmt } from './types'

// ─── Placeholder Module Renderer ───────────────────────
const renderPlaceholderModule = (title: string, icon: React.ElementType, stats: {label: string; value: string; icon: React.ElementType; color: string}[], description: string, columns: string[]) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#59ff00]/10 border border-[#59ff00]/30 flex items-center justify-center">
          {React.createElement(icon, { className: 'w-5 h-5 text-[#59ff00]' })}
        </div>
        <div>
          <h2 className="text-white text-xl font-bold">{title}</h2>
          <p className="text-gray-500 text-xs">{description}</p>
        </div>
      </div>
      <Button className="bg-[#59ff00]/10 text-[#59ff00] hover:bg-[#59ff00]/20 border border-[#59ff00]/30 font-semibold opacity-60 cursor-not-allowed" disabled>
        <Plus className="w-4 h-4 mr-2" /> Add New
      </Button>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s, i) => (
        <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
          <Card className="bg-[#181818] border-[#2a2a2a] hover:border-[#59ff00]/30 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">{s.label}</p>
                  <p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl ${s.color.replace('text-', 'bg-').replace(/-\d+$/, '-500/10')} flex items-center justify-center`}>
                  {React.createElement(s.icon, { className: `w-5 h-5 ${s.color}` })}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
    <Card className="bg-[#181818] border-[#2a2a2a]">
      <CardContent className="p-12 text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-[#59ff00]/10 border border-[#59ff00]/30 flex items-center justify-center mb-4">
          {React.createElement(icon, { className: 'w-8 h-8 text-[#59ff00]' })}
        </div>
        <h3 className="text-white text-lg font-bold mb-2">Coming Soon</h3>
        <p className="text-gray-400 text-sm max-w-md mx-auto mb-6">{description}. This module is currently under development and will be available in a future update.</p>
        <div className="flex items-center justify-center gap-2">
          <Badge className="bg-[#59ff00]/10 text-[#59ff00] border-[#59ff00]/30">In Development</Badge>
          <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30">Q2 2025</Badge>
        </div>
      </CardContent>
    </Card>
    <Card className="bg-[#181818] border-[#2a2a2a]">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-[#2a2a2a] hover:bg-transparent">
                {columns.map((col, i) => (
                  <TableHead key={i} className="text-gray-400">{col}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center text-gray-500 py-8">
                  No data available yet — module coming soon
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  </motion.div>
)

// ─── CRM Dashboard ─────────────────────────────────────
const renderCrmDashboard = (leads: any[]) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-[#59ff00]/10 border border-[#59ff00]/30 flex items-center justify-center">
        <Gauge className="w-5 h-5 text-[#59ff00]" />
      </div>
      <div>
        <h2 className="text-white text-xl font-bold">CRM Dashboard</h2>
        <p className="text-gray-500 text-xs">Overview of your sales pipeline and customer relationships</p>
      </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: 'Total Leads', value: String(leads.length), icon: Users, color: 'text-purple-400' },
        { label: 'Won Leads', value: String(leads.filter((l: any) => l.status === 'won').length), icon: Star, color: 'text-emerald-400' },
        { label: 'Pipeline Value', value: fmt(leads.reduce((a: number, l: any) => a + (l.estimatedValue || 0), 0)), icon: DollarSign, color: 'text-[#59ff00]' },
        { label: 'Conversion Rate', value: leads.length > 0 ? `${Math.round(leads.filter((l: any) => l.status === 'won').length / leads.length * 100)}%` : '0%', icon: TrendingUp, color: 'text-blue-400' },
      ].map((s, i) => (
        <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
          <Card className="bg-[#181818] border-[#2a2a2a] hover:border-[#59ff00]/30 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">{s.label}</p>
                  <p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#181818] flex items-center justify-center">
                  {React.createElement(s.icon, { className: `w-5 h-5 ${s.color}` })}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
    <Card className="bg-[#181818] border-[#2a2a2a]">
      <CardContent className="p-8 text-center">
        <PieChartIcon className="w-12 h-12 text-[#59ff00] mx-auto mb-3" />
        <h3 className="text-white text-lg font-bold mb-2">Full CRM Analytics</h3>
        <p className="text-gray-400 text-sm max-w-md mx-auto">Advanced CRM dashboard with pipeline analytics, lead scoring, and conversion funnels coming soon.</p>
      </CardContent>
    </Card>
  </motion.div>
)

// ─── HRM Dashboard ─────────────────────────────────────
const renderHrmDashboard = (employees: any[]) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-[#59ff00]/10 border border-[#59ff00]/30 flex items-center justify-center">
        <Gauge className="w-5 h-5 text-[#59ff00]" />
      </div>
      <div>
        <h2 className="text-white text-xl font-bold">HR Dashboard</h2>
        <p className="text-gray-500 text-xs">Overview of your workforce and HR operations</p>
      </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: 'Total Employees', value: String(employees.length), icon: Users, color: 'text-blue-400' },
        { label: 'Active', value: String(employees.filter((e: any) => e.status === 'active').length), icon: Check, color: 'text-emerald-400' },
        { label: 'On Leave', value: String(employees.filter((e: any) => e.status === 'on_leave').length), icon: CalendarDays, color: 'text-yellow-400' },
        { label: 'Departments', value: String(new Set(employees.map((e: any) => e.department).filter(Boolean)).size), icon: Network, color: 'text-purple-400' },
      ].map((s, i) => (
        <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
          <Card className="bg-[#181818] border-[#2a2a2a] hover:border-[#59ff00]/30 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">{s.label}</p>
                  <p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#181818] flex items-center justify-center">
                  {React.createElement(s.icon, { className: `w-5 h-5 ${s.color}` })}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
    <Card className="bg-[#181818] border-[#2a2a2a]">
      <CardContent className="p-8 text-center">
        <Briefcase className="w-12 h-12 text-[#59ff00] mx-auto mb-3" />
        <h3 className="text-white text-lg font-bold mb-2">Full HR Analytics</h3>
        <p className="text-gray-400 text-sm max-w-md mx-auto">Advanced HR dashboard with attendance analytics, payroll overview, and team performance metrics coming soon.</p>
      </CardContent>
    </Card>
  </motion.div>
)

// ─── CRM/HRM Tab Router ────────────────────────────────
interface CrmModulesProps {
  adminTab: string
  leads: any[]
  employees: any[]
}

export default function CrmModules({ adminTab, leads, employees }: CrmModulesProps) {
  switch (adminTab) {
    case 'crm-dashboard': return renderCrmDashboard(leads)
    case 'crm-companies': return renderPlaceholderModule('Companies', Building2, [
      { label: 'Total Companies', value: '24', icon: Building2, color: 'text-blue-400' },
      { label: 'Active', value: '18', icon: Check, color: 'text-emerald-400' },
      { label: 'Prospects', value: '6', icon: ArrowRight, color: 'text-yellow-400' },
      { label: 'Revenue', value: '₹12.5L', icon: DollarSign, color: 'text-[#59ff00]' },
    ], 'Manage company accounts, contacts, and organizational relationships', ['Company', 'Industry', 'Contact', 'Revenue', 'Status', 'Actions'])
    case 'crm-pipelines': return renderPlaceholderModule('Pipelines', Target, [
      { label: 'Active Pipelines', value: '5', icon: Target, color: 'text-purple-400' },
      { label: 'Stages', value: '23', icon: LayoutGrid, color: 'text-blue-400' },
      { label: 'Conversion Rate', value: '34%', icon: TrendingUp, color: 'text-emerald-400' },
      { label: 'Avg Cycle', value: '14 days', icon: Clock, color: 'text-yellow-400' },
    ], 'Configure and manage your sales pipelines and deal stages', ['Pipeline', 'Stages', 'Deals', 'Value', 'Status'])
    case 'crm-pipeline': return renderPlaceholderModule('Pipeline', Filter, [
      { label: 'Open Deals', value: '42', icon: Filter, color: 'text-blue-400' },
      { label: 'Won Today', value: '3', icon: Check, color: 'text-emerald-400' },
      { label: 'Pipeline Value', value: '₹8.2L', icon: DollarSign, color: 'text-[#59ff00]' },
      { label: 'Stuck Deals', value: '7', icon: AlertTriangle, color: 'text-red-400' },
    ], 'Visualize and manage your current sales pipeline', ['Deal', 'Contact', 'Stage', 'Value', 'Probability', 'Actions'])
    case 'crm-kanban': return renderPlaceholderModule('Kanban Board', Kanban, [
      { label: 'Total Cards', value: '56', icon: Kanban, color: 'text-blue-400' },
      { label: 'In Progress', value: '18', icon: ArrowRight, color: 'text-yellow-400' },
      { label: 'Completed', value: '28', icon: Check, color: 'text-emerald-400' },
      { label: 'Overdue', value: '4', icon: AlertTriangle, color: 'text-red-400' },
    ], 'Drag-and-drop Kanban board for visual lead and deal management', ['Card', 'Assignee', 'Stage', 'Priority', 'Due Date'])
    case 'crm-calendar': return renderPlaceholderModule('Task Calendar', CalendarCheck, [
      { label: 'Today Tasks', value: '8', icon: CalendarCheck, color: 'text-blue-400' },
      { label: 'This Week', value: '23', icon: CalendarDays, color: 'text-purple-400' },
      { label: 'Overdue', value: '3', icon: AlertTriangle, color: 'text-red-400' },
      { label: 'Completed', value: '15', icon: Check, color: 'text-emerald-400' },
    ], 'Calendar view for scheduling tasks, follow-ups, and meetings', ['Task', 'Type', 'Assignee', 'Date', 'Status'])
    case 'crm-forms': return renderPlaceholderModule('Forms', ClipboardList, [
      { label: 'Active Forms', value: '6', icon: ClipboardList, color: 'text-blue-400' },
      { label: 'Submissions', value: '142', icon: Database, color: 'text-purple-400' },
      { label: 'Conversion', value: '12%', icon: TrendingUp, color: 'text-emerald-400' },
      { label: 'This Month', value: '38', icon: CalendarDays, color: 'text-yellow-400' },
    ], 'Create and manage lead capture forms for your website', ['Form', 'Fields', 'Submissions', 'Conversion', 'Status'])
    case 'crm-imports': return renderPlaceholderModule('Imports', Import, [
      { label: 'Total Imports', value: '12', icon: Import, color: 'text-blue-400' },
      { label: 'Records', value: '2,450', icon: Database, color: 'text-purple-400' },
      { label: 'Success Rate', value: '98%', icon: Check, color: 'text-emerald-400' },
      { label: 'Last Import', value: '2 days ago', icon: Clock, color: 'text-yellow-400' },
    ], 'Import leads and contacts from CSV, Excel, and other sources', ['Import', 'Records', 'Source', 'Status', 'Date'])
    case 'crm-conversations': return renderPlaceholderModule('Conversations', MessagesSquare, [
      { label: 'Active', value: '15', icon: MessagesSquare, color: 'text-blue-400' },
      { label: 'Unread', value: '8', icon: Bell, color: 'text-red-400' },
      { label: 'Avg Response', value: '2.5h', icon: Timer, color: 'text-yellow-400' },
      { label: 'Resolved Today', value: '6', icon: Check, color: 'text-emerald-400' },
    ], 'Track and manage all customer conversations in one place', ['Contact', 'Channel', 'Last Message', 'Status', 'Assignee'])
    case 'crm-lead-sources': return renderPlaceholderModule('Lead Sources', Megaphone, [
      { label: 'Sources', value: '8', icon: Megaphone, color: 'text-blue-400' },
      { label: 'Best Source', value: 'Website', icon: Star, color: 'text-emerald-400' },
      { label: 'Total Leads', value: '320', icon: Users, color: 'text-purple-400' },
      { label: 'Cost/Lead', value: '₹245', icon: DollarSign, color: 'text-yellow-400' },
    ], 'Track and optimize lead generation sources', ['Source', 'Leads', 'Conversion', 'Cost', 'ROI'])
    case 'crm-integrations': return renderPlaceholderModule('Integrations', Webhook, [
      { label: 'Connected', value: '5', icon: Webhook, color: 'text-emerald-400' },
      { label: 'Available', value: '18', icon: LayoutGrid, color: 'text-blue-400' },
      { label: 'Synced', value: '1.2K', icon: Database, color: 'text-purple-400' },
      { label: 'Errors', value: '0', icon: Check, color: 'text-[#59ff00]' },
    ], 'Connect third-party tools and services to your CRM', ['Integration', 'Category', 'Status', 'Last Sync', 'Actions'])
    case 'crm-email-templates': return renderPlaceholderModule('Email Templates', MailOpen, [
      { label: 'Templates', value: '12', icon: MailOpen, color: 'text-blue-400' },
      { label: 'Sent', value: '450', icon: Send, color: 'text-purple-400' },
      { label: 'Open Rate', value: '68%', icon: Eye, color: 'text-emerald-400' },
      { label: 'Click Rate', value: '24%', icon: ArrowRight, color: 'text-yellow-400' },
    ], 'Create and manage reusable email templates for outreach', ['Template', 'Subject', 'Usage', 'Open Rate', 'Actions'])
    case 'crm-email-sequences': return renderPlaceholderModule('Email Sequences', MailPlus, [
      { label: 'Active Sequences', value: '4', icon: MailPlus, color: 'text-blue-400' },
      { label: 'Enrolled', value: '86', icon: Users, color: 'text-purple-400' },
      { label: 'Completion', value: '72%', icon: Check, color: 'text-emerald-400' },
      { label: 'Reply Rate', value: '18%', icon: MessagesSquare, color: 'text-yellow-400' },
    ], 'Build automated email drip campaigns and follow-up sequences', ['Sequence', 'Steps', 'Enrolled', 'Reply Rate', 'Status'])
    // CRM Reports
    case 'crm-report-volume': return renderPlaceholderModule('Lead Volume', BarChart3, [
      { label: 'This Month', value: '84', icon: BarChart3, color: 'text-blue-400' },
      { label: 'vs Last Month', value: '+12%', icon: TrendingUp, color: 'text-emerald-400' },
      { label: 'Avg/Day', value: '3.2', icon: CalendarDays, color: 'text-purple-400' },
      { label: 'Peak Day', value: 'Mon', icon: Star, color: 'text-yellow-400' },
    ], 'Track lead volume trends over time', ['Month', 'Leads', 'Qualified', 'Converted', 'Rate'])
    case 'crm-report-source': return renderPlaceholderModule('Source Performance', PieChartIcon, [
      { label: 'Best Source', value: 'Website', icon: Star, color: 'text-emerald-400' },
      { label: 'Sources', value: '8', icon: PieChartIcon, color: 'text-blue-400' },
      { label: 'Top Conv.', value: '34%', icon: TrendingUp, color: 'text-purple-400' },
      { label: 'Worst Conv.', value: '8%', icon: TrendingDown, color: 'text-red-400' },
    ], 'Analyze which lead sources perform best', ['Source', 'Leads', 'Qualified', 'Converted', 'Cost'])
    case 'crm-report-funnel': return renderPlaceholderModule('Pipeline Funnel', Target, [
      { label: 'Top Stage', value: '42', icon: Target, color: 'text-blue-400' },
      { label: 'Bottom Stage', value: '8', icon: Check, color: 'text-emerald-400' },
      { label: 'Drop-off', value: '81%', icon: TrendingDown, color: 'text-red-400' },
      { label: 'Avg Time', value: '14 days', icon: Clock, color: 'text-yellow-400' },
    ], 'Visualize your conversion funnel from lead to close', ['Stage', 'Count', 'Conversion', 'Avg Time', 'Drop-off'])
    case 'crm-report-agent': return renderPlaceholderModule('Agent Performance', Star, [
      { label: 'Top Agent', value: 'Rahul S.', icon: Star, color: 'text-emerald-400' },
      { label: 'Avg Close Rate', value: '28%', icon: Target, color: 'text-blue-400' },
      { label: 'Avg Response', value: '1.5h', icon: Timer, color: 'text-yellow-400' },
      { label: 'Active Agents', value: '6', icon: Users, color: 'text-purple-400' },
    ], 'Track and compare sales agent performance metrics', ['Agent', 'Leads', 'Won', 'Close Rate', 'Avg Response'])
    case 'crm-report-automation': return renderPlaceholderModule('Automation Stats', Zap, [
      { label: 'Active Rules', value: '12', icon: Zap, color: 'text-blue-400' },
      { label: 'Auto Actions', value: '840', icon: ArrowRight, color: 'text-purple-400' },
      { label: 'Time Saved', value: '126h', icon: Clock, color: 'text-emerald-400' },
      { label: 'Errors', value: '3', icon: AlertTriangle, color: 'text-red-400' },
    ], 'Monitor automated workflow performance and efficiency', ['Rule', 'Triggers', 'Actions', 'Success', 'Last Run'])
    case 'crm-report-attribution': return renderPlaceholderModule('Source Attribution', Link2, [
      { label: 'First Touch', value: '42%', icon: Link2, color: 'text-blue-400' },
      { label: 'Last Touch', value: '58%', icon: ArrowRight, color: 'text-purple-400' },
      { label: 'Multi-touch', value: '4.2', icon: Target, color: 'text-yellow-400' },
      { label: 'Revenue', value: '₹5.6L', icon: DollarSign, color: 'text-[#59ff00]' },
    ], 'Understand which channels contribute to conversions', ['Channel', 'First Touch', 'Last Touch', 'Revenue', 'ROI'])
    case 'crm-report-forms': return renderPlaceholderModule('Form Analytics', FormInput, [
      { label: 'Total Forms', value: '6', icon: FormInput, color: 'text-blue-400' },
      { label: 'Submissions', value: '420', icon: Database, color: 'text-purple-400' },
      { label: 'Avg Conv.', value: '15%', icon: TrendingUp, color: 'text-emerald-400' },
      { label: 'Drop-off', value: '23%', icon: TrendingDown, color: 'text-red-400' },
    ], 'Analyze form submission and conversion data', ['Form', 'Views', 'Submissions', 'Conversion', 'Fields'])
    case 'crm-report-response': return renderPlaceholderModule('Response Time', Timer, [
      { label: 'Avg First', value: '1.2h', icon: Timer, color: 'text-blue-400' },
      { label: 'Avg Reply', value: '3.5h', icon: Clock, color: 'text-yellow-400' },
      { label: 'SLA Met', value: '89%', icon: Check, color: 'text-emerald-400' },
      { label: 'Overdue', value: '11%', icon: AlertTriangle, color: 'text-red-400' },
    ], 'Track response times and SLA compliance', ['Agent', 'First Response', 'Avg Reply', 'SLA Met', 'Status'])
    case 'crm-report-bottlenecks': return renderPlaceholderModule('Pipeline Bottlenecks', AlertTriangle, [
      { label: 'Bottlenecks', value: '3', icon: AlertTriangle, color: 'text-red-400' },
      { label: 'Stuck Deals', value: '7', icon: Clock, color: 'text-yellow-400' },
      { label: 'Avg Delay', value: '5.2 days', icon: Timer, color: 'text-purple-400' },
      { label: 'At Risk', value: '₹2.1L', icon: DollarSign, color: 'text-red-400' },
    ], 'Identify and resolve pipeline bottlenecks', ['Stage', 'Stuck Count', 'Avg Days', 'Risk Value', 'Action'])
    case 'crm-report-revenue': return renderPlaceholderModule('Revenue by Rep', DollarSign, [
      { label: 'Total Revenue', value: '₹24.5L', icon: DollarSign, color: 'text-[#59ff00]' },
      { label: 'Top Rep', value: '₹8.2L', icon: Star, color: 'text-blue-400' },
      { label: 'Avg Deal', value: '₹45K', icon: Target, color: 'text-purple-400' },
      { label: 'Target Met', value: '78%', icon: TrendingUp, color: 'text-yellow-400' },
    ], 'Revenue performance breakdown by sales representative', ['Rep', 'Revenue', 'Deals Won', 'Avg Deal', 'Target'])
    case 'crm-report-scheduled': return renderPlaceholderModule('Scheduled Reports', CalendarClock, [
      { label: 'Active', value: '4', icon: CalendarClock, color: 'text-blue-400' },
      { label: 'Daily', value: '2', icon: Clock, color: 'text-purple-400' },
      { label: 'Weekly', value: '1', icon: CalendarDays, color: 'text-yellow-400' },
      { label: 'Monthly', value: '1', icon: CalendarRange, color: 'text-emerald-400' },
    ], 'Configure automated report generation and delivery', ['Report', 'Frequency', 'Recipients', 'Last Sent', 'Status'])
    // CRM Sales
    case 'crm-sales': return renderPlaceholderModule('Sales', DollarSign, [
      { label: 'This Month', value: '₹12.5L', icon: DollarSign, color: 'text-[#59ff00]' },
      { label: 'Deals Closed', value: '18', icon: Check, color: 'text-emerald-400' },
      { label: 'Pipeline', value: '₹8.2L', icon: Target, color: 'text-blue-400' },
      { label: 'Avg Deal Size', value: '₹69K', icon: TrendingUp, color: 'text-purple-400' },
    ], 'Track sales performance, targets, and revenue metrics', ['Deal', 'Customer', 'Value', 'Stage', 'Close Date'])
    case 'crm-quotes': return renderPlaceholderModule('Quotes', Receipt, [
      { label: 'Active Quotes', value: '14', icon: Receipt, color: 'text-blue-400' },
      { label: 'Pending', value: '8', icon: Clock, color: 'text-yellow-400' },
      { label: 'Accepted', value: '4', icon: Check, color: 'text-emerald-400' },
      { label: 'Total Value', value: '₹6.8L', icon: DollarSign, color: 'text-[#59ff00]' },
    ], 'Manage sales quotes and proposals', ['Quote #', 'Customer', 'Value', 'Status', 'Valid Until'])
    case 'crm-invoices': return renderPlaceholderModule('Invoices', FileText, [
      { label: 'Outstanding', value: '₹4.2L', icon: FileText, color: 'text-red-400' },
      { label: 'Paid', value: '₹18.5L', icon: Check, color: 'text-emerald-400' },
      { label: 'Overdue', value: '3', icon: AlertTriangle, color: 'text-yellow-400' },
      { label: 'This Month', value: '₹2.8L', icon: DollarSign, color: 'text-[#59ff00]' },
    ], 'Create, send, and track customer invoices', ['Invoice #', 'Customer', 'Amount', 'Status', 'Due Date'])
    case 'crm-billing': return renderPlaceholderModule('Billing', CreditCard, [
      { label: 'Revenue', value: '₹24.5L', icon: DollarSign, color: 'text-[#59ff00]' },
      { label: 'Pending', value: '₹3.2L', icon: Clock, color: 'text-yellow-400' },
      { label: 'Overdue', value: '₹1.1L', icon: AlertTriangle, color: 'text-red-400' },
      { label: 'Collected', value: '₹20.2L', icon: Check, color: 'text-emerald-400' },
    ], 'Manage billing cycles, payments, and financial records', ['Invoice', 'Customer', 'Amount', 'Due Date', 'Status'])
    case 'crm-sales-calendar': return renderPlaceholderModule('Sales Calendar', CalendarRange, [
      { label: 'Today', value: '3 calls', icon: CalendarRange, color: 'text-blue-400' },
      { label: 'This Week', value: '12 meetings', icon: CalendarDays, color: 'text-purple-400' },
      { label: 'Follow-ups', value: '5', icon: Clock, color: 'text-yellow-400' },
      { label: 'Closings', value: '2', icon: Check, color: 'text-emerald-400' },
    ], 'Schedule and track sales activities and meetings', ['Activity', 'Type', 'Contact', 'Date', 'Status'])
    // HRM tabs
    case 'hrm-dashboard': return renderHrmDashboard(employees)
    case 'hrm-departments': return renderPlaceholderModule('Departments', Network, [
      { label: 'Departments', value: String(new Set(employees.map((e: any) => e.department).filter(Boolean)).size || 5), icon: Network, color: 'text-blue-400' },
      { label: 'Total Staff', value: String(employees.length), icon: Users, color: 'text-purple-400' },
      { label: 'Heads', value: '5', icon: Star, color: 'text-emerald-400' },
      { label: 'Budget', value: '₹45L', icon: DollarSign, color: 'text-[#59ff00]' },
    ], 'Organize and manage company departments', ['Department', 'Head', 'Employees', 'Budget', 'Status'])
    case 'hrm-designations': return renderPlaceholderModule('Designations', Award, [
      { label: 'Designations', value: '12', icon: Award, color: 'text-blue-400' },
      { label: 'Levels', value: '6', icon: LayoutGrid, color: 'text-purple-400' },
      { label: 'Avg Salary', value: '₹35K', icon: DollarSign, color: 'text-[#59ff00]' },
      { label: 'Openings', value: '3', icon: Briefcase, color: 'text-yellow-400' },
    ], 'Define and manage employee designations and grades', ['Designation', 'Level', 'Employees', 'Salary Range', 'Actions'])
    case 'hrm-payroll': return renderPlaceholderModule('Payroll', Banknote, [
      { label: 'Monthly', value: '₹8.5L', icon: Banknote, color: 'text-[#59ff00]' },
      { label: 'Processed', value: '28/30', icon: Check, color: 'text-emerald-400' },
      { label: 'Pending', value: '2', icon: Clock, color: 'text-yellow-400' },
      { label: 'Deductions', value: '₹1.2L', icon: TrendingDown, color: 'text-red-400' },
    ], 'Process payroll, manage salary structures, and track payments', ['Employee', 'Basic', 'Deductions', 'Net Pay', 'Status'])
    case 'hrm-salary-slips': return renderPlaceholderModule('Salary Slips', Receipt, [
      { label: 'Generated', value: '28', icon: Receipt, color: 'text-blue-400' },
      { label: 'Distributed', value: '25', icon: Send, color: 'text-emerald-400' },
      { label: 'Pending', value: '3', icon: Clock, color: 'text-yellow-400' },
      { label: 'Total', value: '₹7.3L', icon: DollarSign, color: 'text-[#59ff00]' },
    ], 'Generate and distribute salary slips to employees', ['Employee', 'Month', 'Gross', 'Deductions', 'Net'])
    case 'hrm-recruitment': return renderPlaceholderModule('Recruitment', UserPlus, [
      { label: 'Open Positions', value: '5', icon: UserPlus, color: 'text-blue-400' },
      { label: 'Applications', value: '42', icon: Users, color: 'text-purple-400' },
      { label: 'Interviews', value: '12', icon: Mic, color: 'text-yellow-400' },
      { label: 'Offers', value: '3', icon: Check, color: 'text-emerald-400' },
    ], 'Manage the entire recruitment pipeline from posting to hiring', ['Position', 'Applicants', 'Stage', 'Posted', 'Actions'])
    case 'hrm-job-openings': return renderPlaceholderModule('Job Openings', BriefcaseMedical, [
      { label: 'Open', value: '5', icon: BriefcaseMedical, color: 'text-blue-400' },
      { label: 'Urgent', value: '2', icon: AlertTriangle, color: 'text-red-400' },
      { label: 'Applications', value: '42', icon: Users, color: 'text-purple-400' },
      { label: 'Avg Time', value: '21 days', icon: Clock, color: 'text-yellow-400' },
    ], 'Post and manage job openings across platforms', ['Title', 'Department', 'Type', 'Applicants', 'Status'])
    case 'hrm-interviews': return renderPlaceholderModule('Interviews', Mic, [
      { label: 'Scheduled', value: '8', icon: Mic, color: 'text-blue-400' },
      { label: 'Today', value: '2', icon: CalendarDays, color: 'text-purple-400' },
      { label: 'Completed', value: '15', icon: Check, color: 'text-emerald-400' },
      { label: 'Avg Rating', value: '4.2/5', icon: Star, color: 'text-yellow-400' },
    ], 'Schedule and track candidate interviews', ['Candidate', 'Position', 'Date', 'Interviewer', 'Status'])
    case 'hrm-performance': return renderPlaceholderModule('Performance', Star, [
      { label: 'Reviews Due', value: '8', icon: Star, color: 'text-yellow-400' },
      { label: 'Completed', value: '22', icon: Check, color: 'text-emerald-400' },
      { label: 'Avg Score', value: '4.1/5', icon: TrendingUp, color: 'text-blue-400' },
      { label: 'Top Performer', value: '15%', icon: Award, color: 'text-purple-400' },
    ], 'Track employee performance reviews and KPIs', ['Employee', 'KPI Score', 'Review Date', 'Rating', 'Status'])
    case 'hrm-appraisals': return renderPlaceholderModule('Appraisals', TrendingUp, [
      { label: 'Pending', value: '6', icon: Clock, color: 'text-yellow-400' },
      { label: 'Completed', value: '24', icon: Check, color: 'text-emerald-400' },
      { label: 'Avg Hike', value: '12%', icon: TrendingUp, color: 'text-blue-400' },
      { label: 'Budget', value: '₹5.2L', icon: DollarSign, color: 'text-[#59ff00]' },
    ], 'Manage employee appraisal cycles and salary revisions', ['Employee', 'Cycle', 'Rating', 'Hike %', 'Status'])
    case 'hrm-training': return renderPlaceholderModule('Training', GraduationCap, [
      { label: 'Active', value: '4', icon: GraduationCap, color: 'text-blue-400' },
      { label: 'Enrolled', value: '18', icon: Users, color: 'text-purple-400' },
      { label: 'Completed', value: '12', icon: Check, color: 'text-emerald-400' },
      { label: 'Upcoming', value: '3', icon: CalendarDays, color: 'text-yellow-400' },
    ], 'Organize employee training programs and skill development', ['Program', 'Type', 'Enrolled', 'Duration', 'Status'])
    case 'hrm-holidays': return renderPlaceholderModule('Holidays', PartyPopper, [
      { label: 'This Year', value: '14', icon: PartyPopper, color: 'text-blue-400' },
      { label: 'Upcoming', value: '3', icon: CalendarDays, color: 'text-purple-400' },
      { label: 'Next Holiday', value: 'Holi', icon: Star, color: 'text-yellow-400' },
      { label: 'Optional', value: '2', icon: Clock, color: 'text-gray-400' },
    ], 'Manage company holidays and optional holiday policies', ['Holiday', 'Date', 'Day', 'Type', 'Status'])
    case 'hrm-notices': return renderPlaceholderModule('Notices', Bell, [
      { label: 'Active', value: '5', icon: Bell, color: 'text-blue-400' },
      { label: 'Urgent', value: '1', icon: AlertTriangle, color: 'text-red-400' },
      { label: 'This Month', value: '8', icon: CalendarDays, color: 'text-purple-400' },
      { label: 'Acknowledged', value: '92%', icon: Check, color: 'text-emerald-400' },
    ], 'Post and manage company announcements and notices', ['Title', 'Priority', 'Posted By', 'Date', 'Status'])
    case 'hrm-assets': return renderPlaceholderModule('Assets', Monitor, [
      { label: 'Total Assets', value: '45', icon: Monitor, color: 'text-blue-400' },
      { label: 'Assigned', value: '38', icon: Check, color: 'text-emerald-400' },
      { label: 'Available', value: '7', icon: Package, color: 'text-yellow-400' },
      { label: 'Value', value: '₹12.5L', icon: DollarSign, color: 'text-[#59ff00]' },
    ], 'Track company assets assigned to employees', ['Asset', 'Type', 'Assigned To', 'Value', 'Status'])
    case 'hrm-documents': return renderPlaceholderModule('Documents', FolderOpen, [
      { label: 'Total Docs', value: '156', icon: FolderOpen, color: 'text-blue-400' },
      { label: 'Expiring', value: '8', icon: AlertTriangle, color: 'text-yellow-400' },
      { label: 'Pending', value: '12', icon: Clock, color: 'text-purple-400' },
      { label: 'Verified', value: '136', icon: Check, color: 'text-emerald-400' },
    ], 'Manage employee documents and compliance records', ['Document', 'Employee', 'Type', 'Expiry', 'Status'])
    case 'hrm-shifts': return renderPlaceholderModule('Shift Management', Clock4, [
      { label: 'Active Shifts', value: '3', icon: Clock4, color: 'text-blue-400' },
      { label: 'Employees', value: '30', icon: Users, color: 'text-purple-400' },
      { label: 'Swaps', value: '2', icon: ArrowRight, color: 'text-yellow-400' },
      { label: 'Coverage', value: '98%', icon: Check, color: 'text-emerald-400' },
    ], 'Define and manage employee shift schedules', ['Shift', 'Timing', 'Employees', 'Supervisor', 'Status'])
    case 'hrm-work-reports': return renderPlaceholderModule('Work Reports', FileSpreadsheet, [
      { label: 'Submitted', value: '24', icon: FileSpreadsheet, color: 'text-blue-400' },
      { label: 'Pending', value: '6', icon: Clock, color: 'text-yellow-400' },
      { label: 'Avg Hours', value: '8.2h', icon: Timer, color: 'text-purple-400' },
      { label: 'On Time', value: '88%', icon: Check, color: 'text-emerald-400' },
    ], 'Track daily and weekly work reports from employees', ['Employee', 'Date', 'Hours', 'Tasks', 'Status'])
    case 'hrm-team': return renderPlaceholderModule('Team Management', UsersRound, [
      { label: 'Teams', value: '5', icon: UsersRound, color: 'text-blue-400' },
      { label: 'Members', value: '30', icon: Users, color: 'text-purple-400' },
      { label: 'Team Leads', value: '5', icon: Star, color: 'text-yellow-400' },
      { label: 'Active', value: '28', icon: Check, color: 'text-emerald-400' },
    ], 'Organize teams, assign leads, and manage team structures', ['Team', 'Lead', 'Members', 'Projects', 'Status'])
    case 'hrm-permissions': return renderPlaceholderModule('Permissions & Roles', Lock, [
      { label: 'Roles', value: '6', icon: Lock, color: 'text-blue-400' },
      { label: 'Permissions', value: '42', icon: Shield, color: 'text-purple-400' },
      { label: 'Users', value: '30', icon: Users, color: 'text-yellow-400' },
      { label: 'Custom', value: '3', icon: Settings, color: 'text-emerald-400' },
    ], 'Manage user roles and granular permissions', ['Role', 'Users', 'Permissions', 'Level', 'Actions'])
    default: return null
  }
}

