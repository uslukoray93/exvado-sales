import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { OrderStatus } from '@prisma/client'

/**
 * GET /api/reports/products
 * Generate product performance reports
 */
export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching product reports...')

    // Fetch all DELIVERED and COMPLETED orders with items
    const orders = await prisma.order.findMany({
      where: {
        status: {
          in: [OrderStatus.DELIVERED, OrderStatus.COMPLETED],
        },
      },
      include: {
        items: true,
      },
      orderBy: {
        orderDate: 'desc',
      },
    })

    console.log(`✅ Found ${orders.length} completed orders`)

    // Group by stock code
    const productMap = new Map<string, {
      stockCode: string
      productName: string
      imageUrl: string | null
      totalSold: number
      totalReturned: number
      lastSalePrice: number
      lastPurchasePrice: number
      totalRevenue: number
      totalCost: number
      totalProfit: number
      profitMargin: number
      lastOrderDate: Date
    }>()

    for (const order of orders) {
      for (const item of order.items) {
        const stockCode = item.stockCode || item.sku

        if (!productMap.has(stockCode)) {
          productMap.set(stockCode, {
            stockCode: stockCode,
            productName: item.productName,
            imageUrl: item.imageUrl,
            totalSold: 0,
            totalReturned: 0, // TODO: İade sistemi eklendiğinde güncellenecek
            lastSalePrice: item.salePrice,
            lastPurchasePrice: item.purchasePrice,
            totalRevenue: 0,
            totalCost: 0,
            totalProfit: 0,
            profitMargin: 0,
            lastOrderDate: order.orderDate,
          })
        }

        const product = productMap.get(stockCode)!

        // Update last prices if this is a more recent order
        if (order.orderDate > product.lastOrderDate) {
          product.lastSalePrice = item.salePrice
          product.lastPurchasePrice = item.purchasePrice
          product.lastOrderDate = order.orderDate
        }

        // Update totals
        product.totalSold += item.quantity
        const revenue = item.salePrice * item.quantity
        const cost = item.purchasePrice * item.quantity
        product.totalRevenue += revenue
        product.totalCost += cost
        product.totalProfit += revenue - cost
      }
    }

    // Convert to array and filter products with minimum 2 sales
    const allProducts = Array.from(productMap.values())
      .filter(p => p.totalSold >= 2) // Minimum 2 satış şartı
      .map(p => ({
        ...p,
        profitMargin: p.totalRevenue > 0 ? (p.totalProfit / p.totalRevenue) * 100 : 0,
      }))

    console.log(`📦 Found ${allProducts.length} products with 2+ sales`)

    // Best sellers (most sold quantity)
    const bestSellers = [...allProducts]
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 100)

    // Most profitable (highest total profit)
    const mostProfitable = [...allProducts]
      .sort((a, b) => b.totalProfit - a.totalProfit)
      .slice(0, 100)

    // Products with returns (TODO: implement return tracking)
    // For now, we'll return empty array
    const returns: any[] = []

    console.log(`✅ Best Sellers: ${bestSellers.length}, Most Profitable: ${mostProfitable.length}, Returns: ${returns.length}`)

    return NextResponse.json({
      success: true,
      data: {
        bestSellers,
        mostProfitable,
        returns,
      },
    })
  } catch (error: any) {
    console.error('❌ Product reports error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate product reports',
      },
      { status: 500 }
    )
  }
}
