import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { OrderStatus, Platform } from '@prisma/client'

/**
 * GET /api/reports/sales/breakdown
 * Günlük satış detaylarını döndürür (daily breakdown)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    // Get date range from query params
    const startDateParam = searchParams.get('startDate')
    const endDateParam = searchParams.get('endDate')

    if (!startDateParam || !endDateParam) {
      return NextResponse.json(
        { success: false, error: 'startDate and endDate are required' },
        { status: 400 }
      )
    }

    const startDate = new Date(startDateParam)
    const endDate = new Date(endDateParam)

    console.log('📊 Sales Breakdown:', startDate.toISOString(), '-', endDate.toISOString())

    // Fetch orders in date range
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
      orderBy: {
        orderDate: 'asc',
      },
    })

    console.log(`✅ Found ${orders.length} completed orders for breakdown`)

    // Group orders by date
    const dailyData: Record<string, any> = {}

    for (const order of orders) {
      // Get date as YYYY-MM-DD
      const dateKey = order.orderDate.toISOString().split('T')[0]

      if (!dailyData[dateKey]) {
        dailyData[dateKey] = {
          date: dateKey,
          totalSales: 0,
          totalCost: 0,
          totalCommission: 0,
          totalShipping: 0,
          totalProfit: 0,
          orderCount: 0,
          platforms: {
            TRENDYOL: { sales: 0, orders: 0 },
            N11: { sales: 0, orders: 0 },
            HEPSIBURADA: { sales: 0, orders: 0 },
            BOLBOLBUL: { sales: 0, orders: 0 },
          },
        }
      }

      const daily = dailyData[dateKey]

      // Calculate order totals
      const orderSales = order.items.reduce((sum, item) => sum + (item.salePrice * item.quantity), 0)
      const orderCost = order.items.reduce((sum, item) => sum + (item.purchasePrice * item.quantity), 0)
      const orderCommission = orderSales * (order.commissionRate || 0) / 100
      const orderShipping = order.shippingCost || 0
      const orderProfit = orderSales - orderCost - orderCommission - orderShipping

      // Update daily totals
      daily.totalSales += orderSales
      daily.totalCost += orderCost
      daily.totalCommission += orderCommission
      daily.totalShipping += orderShipping
      daily.totalProfit += orderProfit
      daily.orderCount += 1

      // Update platform stats
      const platform = order.platform
      if (daily.platforms[platform]) {
        daily.platforms[platform].sales += orderSales
        daily.platforms[platform].orders += 1
      }
    }

    // Convert to array and sort by date
    const breakdown = Object.values(dailyData).sort((a: any, b: any) =>
      a.date.localeCompare(b.date)
    )

    return NextResponse.json({
      success: true,
      data: breakdown,
    })
  } catch (error: any) {
    console.error('Sales breakdown error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate sales breakdown',
      },
      { status: 500 }
    )
  }
}
