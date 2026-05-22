import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/dashboard - Return all dashboard statistics
export async function GET() {
  try {
    // ── Basic Counts ──
    const [
      totalOrders,
      totalLeads,
      totalProducts,
      totalCustomers,
      totalEmployees,
      activeAmcContracts,
    ] = await Promise.all([
      db.order.count(),
      db.lead.count(),
      db.product.count({ where: { status: 'active' } }),
      db.user.count({ where: { role: { roleName: 'customer' } } }),
      db.employee.count({ where: { status: 'active' } }),
      db.amcContract.count({ where: { status: 'active' } }),
    ])

    // ── Total Revenue (from delivered/paid orders) ──
    const revenueOrders = await db.order.findMany({
      where: {
        orderStatus: { in: ['delivered', 'confirmed', 'shipped'] },
        paymentStatus: 'paid',
      },
      select: { total: true, createdAt: true },
    })

    const totalRevenue = revenueOrders.reduce((sum, o) => sum + o.total, 0)

    // ── Monthly Revenue (last 12 months) ──
    const monthlyRevenue: { month: string; revenue: number }[] = []
    const now = new Date()
    for (let i = 11; i >= 0; i--) {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)
      const monthLabel = startOfMonth.toLocaleString('en-US', { month: 'short', year: '2-digit' })

      const monthOrders = revenueOrders.filter(
        o => o.createdAt >= startOfMonth && o.createdAt <= endOfMonth
      )
      const monthRevenue = monthOrders.reduce((sum, o) => sum + o.total, 0)

      monthlyRevenue.push({
        month: monthLabel,
        revenue: Math.round(monthRevenue * 100) / 100,
      })
    }

    // ── Order Status Distribution ──
    const orderStatusCounts = await db.order.groupBy({
      by: ['orderStatus'],
      _count: { orderStatus: true },
    })

    const orderStatusDistribution = orderStatusCounts.map(s => ({
      status: s.orderStatus,
      count: s._count.orderStatus,
    }))

    // ── Lead Status Distribution ──
    const leadStatusCounts = await db.lead.groupBy({
      by: ['status'],
      _count: { status: true },
    })

    const leadStatusDistribution = leadStatusCounts.map(s => ({
      status: s.status,
      count: s._count.status,
    }))

    // ── Recent Orders (last 5) ──
    const recentOrders = await db.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        items: {
          select: {
            product: { select: { name: true } },
            qty: true,
            price: true,
          },
        },
      },
    })

    // ── Recent Leads (last 5) ──
    const recentLeads = await db.lead.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        assignee: { select: { id: true, name: true } },
      },
    })

    // ── AMC Stats ──
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

    const expiringContracts = await db.amcContract.count({
      where: {
        status: 'active',
        endDate: {
          lte: thirtyDaysFromNow,
          gte: new Date(),
        },
      },
    })

    const amcStats = {
      active: activeAmcContracts,
      expiringSoon: expiringContracts,
      totalValue: await db.amcContract.aggregate({
        where: { status: 'active' },
        _sum: { amount: true },
      }).then(r => r._sum.amount || 0),
    }

    // ── Low Stock Products ──
    const lowStockProducts = await db.product.findMany({
      where: {
        status: 'active',
        stock: { lte: 5 },
      },
      select: {
        id: true,
        name: true,
        stock: true,
        price: true,
        category: { select: { name: true } },
      },
      orderBy: { stock: 'asc' },
      take: 10,
    })

    // ── Payment Method Distribution ──
    const paymentMethodCounts = await db.order.groupBy({
      by: ['paymentMethod'],
      _count: { paymentMethod: true },
    })

    const paymentDistribution = paymentMethodCounts.map(p => ({
      method: p.paymentMethod || 'cod',
      count: p._count.paymentMethod,
    }))

    // ── Category-wise Product Count ──
    const categories = await db.category.findMany({
      include: {
        _count: { select: { products: true } },
      },
      orderBy: { name: 'asc' },
    })

    const categoryDistribution = categories.map(c => ({
      name: c.name,
      count: c._count.products,
    }))

    // ── Pending Service Requests ──
    const pendingServiceRequests = await db.serviceRequest.count({
      where: { status: { in: ['open', 'in_progress'] } },
    })

    // ── Pending Tasks ──
    const pendingTasks = await db.task.count({
      where: { status: { in: ['pending', 'in_progress'] } },
    })

    return NextResponse.json({
      status: true,
      message: 'Dashboard statistics fetched successfully',
      data: {
        overview: {
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          totalOrders,
          totalLeads,
          totalProducts,
          totalCustomers,
          totalEmployees,
          activeAmcContracts,
          pendingServiceRequests,
          pendingTasks,
        },
        monthlyRevenue,
        orderStatusDistribution,
        leadStatusDistribution,
        paymentDistribution,
        categoryDistribution,
        recentOrders,
        recentLeads,
        amcStats,
        lowStockProducts,
      },
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    )
  }
}
