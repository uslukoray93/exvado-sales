import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Platform, OrderStatus } from '@prisma/client'

/**
 * GET /api/reports/sales
 * Generate sales report for a given time period
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const period = searchParams.get('period') || 'week'
    const startDateParam = searchParams.get('startDate')
    const endDateParam = searchParams.get('endDate')

    // Calculate date range based on period or custom dates
    let startDate: Date
    let endDate: Date = new Date()

    if (startDateParam && endDateParam) {
      // Custom date range
      startDate = new Date(startDateParam)
      endDate = new Date(endDateParam)
      endDate.setHours(23, 59, 59, 999) // End of day
    } else {
      // Predefined period
      const now = new Date()
      endDate = now

      switch (period) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0))
          break
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        case '3months':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
          break
        case '6months':
          startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
          break
        case 'year':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
          break
        default:
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      }
    }

    console.log(`📊 Sales Report: ${startDate.toISOString()} - ${endDate.toISOString()}`)

    // Fetch orders in date range (DELIVERED or COMPLETED only - exclude CANCELLED)
    const orders = await prisma.order.findMany({
      where: {
        orderDate: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          in: [OrderStatus.DELIVERED, OrderStatus.COMPLETED],
        },
      },
      include: {
        items: true,
      },
    })

    console.log(`✅ Found ${orders.length} orders in date range`)

    // Calculate platform-wise statistics
    const platformStats: Record<string, any> = {}

    for (const order of orders) {
      const platform = order.platform

      if (!platformStats[platform]) {
        platformStats[platform] = {
          platform,
          totalSales: 0,
          totalCost: 0,
          commission: 0,
          shipping: 0,
          profit: 0,
          orderCount: 0,
          profitMargin: 0,
        }
      }

      const stats = platformStats[platform]

      // Calculate order totals
      const orderSales = order.items.reduce((sum, item) => sum + (item.salePrice * item.quantity), 0)
      const orderCost = order.items.reduce((sum, item) => sum + (item.purchasePrice * item.quantity), 0)
      const orderCommission = orderSales * (order.commissionRate || 0) / 100
      const orderShipping = order.shippingCost || 0

      stats.totalSales += orderSales
      stats.totalCost += orderCost
      stats.commission += orderCommission
      stats.shipping += orderShipping
      stats.orderCount += 1
    }

    // Calculate profit and profit margin for each platform
    const platformData = Object.values(platformStats).map((stats: any) => {
      const profit = stats.totalSales - stats.totalCost - stats.commission - stats.shipping
      const profitMargin = stats.totalSales > 0 ? (profit / stats.totalSales) * 100 : 0

      return {
        ...stats,
        profit,
        profitMargin,
      }
    })

    // Calculate overall totals
    const totals = {
      totalSales: platformData.reduce((sum, p) => sum + p.totalSales, 0),
      totalCost: platformData.reduce((sum, p) => sum + p.totalCost, 0),
      totalCommission: platformData.reduce((sum, p) => sum + p.commission, 0),
      totalShipping: platformData.reduce((sum, p) => sum + p.shipping, 0),
      totalProfit: platformData.reduce((sum, p) => sum + p.profit, 0),
      totalOrders: platformData.reduce((sum, p) => sum + p.orderCount, 0),
      averageOrderValue: 0,
      profitMargin: 0,
    }

    totals.averageOrderValue = totals.totalOrders > 0 ? totals.totalSales / totals.totalOrders : 0
    totals.profitMargin = totals.totalSales > 0 ? (totals.totalProfit / totals.totalSales) * 100 : 0

    return NextResponse.json({
      success: true,
      data: {
        period,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        platforms: platformData,
        totals,
      },
    })
  } catch (error: any) {
    console.error('Sales report error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate sales report',
      },
      { status: 500 }
    )
  }
}
