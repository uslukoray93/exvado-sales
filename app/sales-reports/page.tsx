import React from "react"
import { prisma } from "@/lib/prisma"
import { OrderStatus } from "@prisma/client"
import { SalesReportsClient } from "./sales-reports-client"

// Platform type
type Platform = "trendyol" | "n11" | "hepsiburada" | "bolbolbul"

// Sales data interface
interface SalesData {
  platform: Platform
  totalSales: number
  totalCost: number
  commission: number
  shipping: number
  profit: number
  orderCount: number
  profitMargin: number
}

// Calculate sales data from orders
async function calculateSalesData(startDate: Date, endDate: Date): Promise<SalesData[]> {
  // Fetch orders from database
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

  // Calculate platform-wise statistics
  const platformStats: Record<string, any> = {}

  for (const order of orders) {
    const platform = order.platform.toLowerCase()

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
    } as SalesData
  })

  return platformData
}

export default async function SalesReportsPage() {
  // Calculate date ranges for all periods
  const now = new Date()

  const periods = {
    today: {
      start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0),
      end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999),
    },
    week: {
      start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      end: now,
    },
    month: {
      start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      end: now,
    },
    "3months": {
      start: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      end: now,
    },
    "6months": {
      start: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000),
      end: now,
    },
    year: {
      start: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
      end: now,
    },
  }

  // Fetch data for all periods in parallel
  const [todayData, weekData, monthData, threeMonthsData, sixMonthsData, yearData] = await Promise.all([
    calculateSalesData(periods.today.start, periods.today.end),
    calculateSalesData(periods.week.start, periods.week.end),
    calculateSalesData(periods.month.start, periods.month.end),
    calculateSalesData(periods["3months"].start, periods["3months"].end),
    calculateSalesData(periods["6months"].start, periods["6months"].end),
    calculateSalesData(periods.year.start, periods.year.end),
  ])

  const allData = {
    today: todayData,
    week: weekData,
    month: monthData,
    "3months": threeMonthsData,
    "6months": sixMonthsData,
    year: yearData,
  }

  return <SalesReportsClient initialData={allData} />
}
