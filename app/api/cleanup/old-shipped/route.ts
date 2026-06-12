import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { OrderStatus } from '@prisma/client'

/**
 * POST /api/cleanup/old-shipped
 * Mark old shipped orders (15+ days) as delivered
 */
export async function POST() {
  try {
    console.log('📦 Checking old shipped orders...')

    const fifteenDaysAgo = new Date()
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15)

    // Find shipped orders older than 15 days
    const oldShippedOrders = await prisma.order.findMany({
      where: {
        status: OrderStatus.SHIPPED,
        orderDate: {
          lt: fifteenDaysAgo
        }
      },
      select: {
        id: true,
        orderNumber: true,
        platform: true,
        orderDate: true,
        customerName: true,
      }
    })

    console.log(`Found ${oldShippedOrders.length} shipped orders older than 15 days`)

    if (oldShippedOrders.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No old shipped orders found',
        stats: {
          checked: 0,
          updated: 0
        }
      })
    }

    // Log each order
    for (const order of oldShippedOrders) {
      const daysAgo = Math.floor((Date.now() - order.orderDate.getTime()) / (1000 * 60 * 60 * 24))
      console.log(`  ${order.orderNumber} (${order.platform}) - ${daysAgo} days ago - ${order.customerName}`)
    }

    // Update to DELIVERED
    const result = await prisma.order.updateMany({
      where: {
        id: {
          in: oldShippedOrders.map(o => o.id)
        }
      },
      data: {
        status: OrderStatus.DELIVERED
      }
    })

    console.log(`✅ Updated ${result.count} orders to DELIVERED`)

    return NextResponse.json({
      success: true,
      message: `Marked ${result.count} old shipped orders as delivered`,
      stats: {
        checked: oldShippedOrders.length,
        updated: result.count,
        orders: oldShippedOrders.map(o => ({
          orderNumber: o.orderNumber,
          platform: o.platform,
          orderDate: o.orderDate,
          customerName: o.customerName
        }))
      }
    })
  } catch (error: any) {
    console.error('Cleanup error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    )
  }
}
