import { NextRequest, NextResponse } from 'next/server'
import { getBolbolbulClient } from '@/lib/api/bolbolbul'
import { prisma } from '@/lib/prisma'
import { Platform, OrderStatus } from '@prisma/client'

/**
 * GET /api/orders/bolbolbul
 * Fetch and sync orders from Bolbolbul
 */
export async function GET(request: NextRequest) {
  try {
    const bolbolbulClient = getBolbolbulClient()

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Fetch orders from Bolbolbul API
    const bolbolbulOrders = await bolbolbulClient.getOrders({ page, limit })

    // Sync orders to database
    const syncedOrders = []

    for (const order of bolbolbulOrders.data) {
      // Map Bolbolbul status to our internal status
      const mappedStatus = mapBolbolbulStatus(order.status)

      // Upsert order (create if not exists, update if exists)
      const dbOrder = await prisma.order.upsert({
        where: {
          platformOrderId: order.orderId,
        },
        update: {
          status: mappedStatus,
          trackingNumber: order.trackingNumber || undefined,
        },
        create: {
          orderNumber: `BBB-${order.orderNumber}`,
          platform: Platform.BOLBOLBUL,
          platformOrderId: order.orderId,
          customerName: order.customer.name,
          customerPhone: order.customer.phone,
          customerAddress: order.customer.address,
          status: mappedStatus,
          orderDate: new Date(order.orderDate),
          trackingNumber: order.trackingNumber || undefined,
          commissionRate: 10, // Bolbolbul default commission
          shippingCost: 0, // Will be updated later
          items: {
            create: order.products.map((product) => ({
              productName: product.productName,
              sku: product.sku,
              quantity: product.quantity,
              purchasePrice: 0, // Will be updated manually
              salePrice: product.price,
            })),
          },
        },
        include: {
          items: true,
        },
      })

      syncedOrders.push(dbOrder)
    }

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${syncedOrders.length} orders from Bolbolbul`,
      data: syncedOrders,
      pagination: {
        page,
        limit,
        total: bolbolbulOrders.total,
      },
    })
  } catch (error: any) {
    console.error('Bolbolbul sync error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to sync Bolbolbul orders',
      },
      { status: 500 }
    )
  }
}

/**
 * Map Bolbolbul order status to internal status
 */
function mapBolbolbulStatus(bolbolbulStatus: string): OrderStatus {
  const statusMap: Record<string, OrderStatus> = {
    'pending': OrderStatus.PENDING,
    'processing': OrderStatus.PROCESSING,
    'shipped': OrderStatus.SHIPPED,
    'delivered': OrderStatus.DELIVERED,
    'completed': OrderStatus.COMPLETED,
    'cancelled': OrderStatus.CANCELLED,
  }

  return statusMap[bolbolbulStatus.toLowerCase()] || OrderStatus.PENDING
}
