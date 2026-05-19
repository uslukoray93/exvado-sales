import { NextRequest, NextResponse } from 'next/server'
import { getN11RestClient } from '@/lib/api/n11-rest'
import { prisma } from '@/lib/prisma'
import { Platform, OrderStatus } from '@prisma/client'

/**
 * GET /api/cron/sync-n11
 * Cron job to automatically sync N11 orders
 * Should be called every 5-10 minutes
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔄 [CRON] Starting N11 auto-sync...')
    const startTime = Date.now()

    const n11Client = getN11RestClient()

    // Sync last 30 days orders (to catch status changes)
    const now = Date.now()
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000)

    const syncedOrders = []
    let updatedCount = 0
    let newCount = 0

    // Fetch all statuses to catch any changes
    const statuses: Array<'Created' | 'Picking' | 'Shipped' | 'Cancelled' | 'Delivered'> = [
      'Created',
      'Picking',
      'Shipped',
      'Cancelled',
      'Delivered'
    ]

    for (const status of statuses) {
      try {
        const response = await n11Client.getOrders({
          page: 0,
          size: 100, // Max per request
          status: status,
          startDate: thirtyDaysAgo,
          endDate: now,
          orderByDirection: 'DESC'
        })

        console.log(`  ${status}: ${response.content.length} orders`)

        for (const order of response.content) {
          const result = await syncOrder(order)
          syncedOrders.push(result.order)

          if (result.isNew) {
            newCount++
          } else if (result.wasUpdated) {
            updatedCount++
          }
        }
      } catch (error) {
        console.error(`  Error syncing ${status}:`, error)
        // Continue with other statuses
      }
    }

    const duration = Date.now() - startTime

    console.log(`✅ [CRON] N11 sync completed in ${duration}ms`)
    console.log(`   New: ${newCount}, Updated: ${updatedCount}, Total: ${syncedOrders.length}`)

    // Auto-cleanup: Mark old shipped orders as delivered
    const fifteenDaysAgo = new Date()
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15)

    const oldShippedResult = await prisma.order.updateMany({
      where: {
        status: 'SHIPPED',
        orderDate: {
          lt: fifteenDaysAgo
        }
      },
      data: {
        status: 'DELIVERED'
      }
    })

    if (oldShippedResult.count > 0) {
      console.log(`🧹 Auto-cleanup: ${oldShippedResult.count} old shipped orders marked as delivered`)
    }

    return NextResponse.json({
      success: true,
      message: 'N11 auto-sync completed',
      stats: {
        total: syncedOrders.length,
        new: newCount,
        updated: updatedCount,
        duration: duration
      },
    })
  } catch (error: any) {
    console.error('❌ [CRON] N11 auto-sync error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Auto-sync failed',
      },
      { status: 500 }
    )
  }
}

/**
 * Sync a single order to database
 */
async function syncOrder(order: any): Promise<{ order: any; isNew: boolean; wasUpdated: boolean }> {
  const mappedStatus = mapN11RestStatus(order.shipmentPackageStatus)
  const platformOrderId = String(order.id)
  const cargoCompany = mapN11CargoCompany(order.cargoProviderName)

  const orderDate = order.lastModifiedDate ? new Date(order.lastModifiedDate) : new Date()
  const agreedDeliveryDate = order.agreedDeliveryDate ? new Date(order.agreedDeliveryDate) : null

  const customerName = order.customerfullName || order.shippingAddress?.fullName || 'Unknown'
  const customerPhone = order.shippingAddress?.gsm || order.billingAddress?.gsm || 'Belirtilmemiş'
  const customerAddress = order.shippingAddress
    ? `${order.shippingAddress.address || ''}, ${order.shippingAddress.district || ''}, ${order.shippingAddress.city || ''}`.trim()
    : 'Unknown'

  // Check if order exists
  const existingOrder = await prisma.order.findUnique({
    where: { platformOrderId },
    include: { items: true }
  })

  const isNew = !existingOrder
  let wasUpdated = false

  // If status changed, mark as updated
  if (existingOrder && existingOrder.status !== mappedStatus) {
    wasUpdated = true
    console.log(`  📝 Status change: ${existingOrder.orderNumber} ${existingOrder.status} → ${mappedStatus}`)
  }

  // Delete old items before upserting
  if (existingOrder) {
    await prisma.orderItem.deleteMany({
      where: { orderId: existingOrder.id }
    })
  }

  const dbOrder = await prisma.order.upsert({
    where: {
      platformOrderId: platformOrderId,
    },
    update: {
      status: mappedStatus,
      customerName: customerName,
      customerPhone: customerPhone,
      customerAddress: customerAddress,
      trackingNumber: order.cargoTrackingNumber || order.cargoSenderNumber || undefined,
      cargoCompany: cargoCompany,
      items: {
        create: (order.lines || []).map((item: any) => ({
          productName: item.productName || 'Ürün',
          stockCode: item.stockCode || null,
          sku: String(item.productId || item.orderLineId || ''),
          quantity: item.quantity || 1,
          purchasePrice: 0,
          salePrice: item.price || 0,
        })),
      },
    },
    create: {
      orderNumber: `N11-${order.orderNumber}`,
      platform: Platform.N11,
      platformOrderId: platformOrderId,
      customerName: customerName,
      customerPhone: customerPhone,
      customerAddress: customerAddress,
      status: mappedStatus,
      orderDate: orderDate,
      agreedDeliveryDate: agreedDeliveryDate,
      trackingNumber: order.cargoTrackingNumber || order.cargoSenderNumber || undefined,
      cargoCompany: cargoCompany,
      commissionRate: 15,
      shippingCost: 0,
      items: {
        create: (order.lines || []).map((item: any) => ({
          productName: item.productName || 'Ürün',
          stockCode: item.stockCode || null,
          sku: String(item.productId || item.orderLineId || ''),
          quantity: item.quantity || 1,
          purchasePrice: 0,
          salePrice: item.price || 0,
        })),
      },
    },
    include: {
      items: true,
    },
  })

  return { order: dbOrder, isNew, wasUpdated }
}

function mapN11RestStatus(n11Status: string): OrderStatus {
  const statusMap: Record<string, OrderStatus> = {
    'Created': OrderStatus.PENDING,
    'UnPacked': OrderStatus.PENDING,
    'Picking': OrderStatus.PROCESSING,
    'UnSupplied': OrderStatus.PROCESSING,
    'Shipped': OrderStatus.SHIPPED,
    'Delivered': OrderStatus.DELIVERED,
    'Cancelled': OrderStatus.CANCELLED,
  }

  return statusMap[n11Status] || OrderStatus.PENDING
}

function mapN11CargoCompany(n11CargoName: string | null | undefined): string {
  if (!n11CargoName) return 'aras-kargo'
  const cargoName = n11CargoName.toLowerCase()

  if (cargoName.includes('yurtiçi') || cargoName.includes('yurtici')) return 'yurtici-kargo'
  if (cargoName.includes('sürat') || cargoName.includes('surat')) return 'surat-kargo'
  if (cargoName.includes('dhl')) return 'dhl-ecommerce'
  if (cargoName.includes('ptt')) return 'ptt-kargo'
  if (cargoName.includes('kolay gelsin')) return 'kolay-gelsin'
  if (cargoName.includes('horoz')) return 'horoz-kargo'
  if (cargoName.includes('ceva')) return 'ceva-lojistik'
  if (cargoName.includes('aras')) return 'aras-kargo'
  if (cargoName.includes('mng')) return 'mng-kargo'
  if (cargoName.includes('ups')) return 'ups-kargo'

  return 'aras-kargo'
}
