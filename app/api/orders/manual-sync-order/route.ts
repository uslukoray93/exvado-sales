import { NextRequest, NextResponse } from 'next/server'
import { getTrendyolClient } from '@/lib/api/trendyol'
import { prisma } from '@/lib/prisma'
import { Platform, OrderStatus } from '@prisma/client'

/**
 * POST /api/orders/manual-sync-order
 * Manuel olarak belirli bir sipariş numarasını sync et
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderNumber, platform } = body

    if (!orderNumber || !platform) {
      return NextResponse.json(
        { success: false, error: 'orderNumber ve platform gerekli' },
        { status: 400 }
      )
    }

    console.log(`🔄 Manuel sync: ${platform} - ${orderNumber}`)

    if (platform === 'TRENDYOL' || platform === 'trendyol') {
      const trendyolClient = getTrendyolClient()

      // Trendyol API'den sipariş çek
      const response = await trendyolClient.getOrders({
        page: 0,
        size: 1,
      })

      // orderNumber ile filtrele (API parametre olarak desteklemiyor, client-side filter)
      let order = response.content.find(o => o.orderNumber === orderNumber)

      // Bulunamadıysa, tüm sayfaları tara
      if (!order) {
        console.log('İlk sayfada bulunamadı, tüm sayfalar taranıyor...')
        for (let page = 0; page < 10; page++) {
          const pageResponse = await trendyolClient.getOrders({ page, size: 50 })
          order = pageResponse.content.find(o => o.orderNumber === orderNumber)
          if (order) break
        }
      }

      if (!order) {
        return NextResponse.json(
          { success: false, error: 'Sipariş Trendyol API\'sinde bulunamadı (son 7 gün içinde)' },
          { status: 404 }
        )
      }

      // Status mapping
      const statusMap: Record<string, OrderStatus> = {
        'Created': OrderStatus.PENDING,
        'Picking': OrderStatus.PROCESSING,
        'Invoiced': OrderStatus.READY_TO_SHIP,
        'Shipped': OrderStatus.SHIPPED,
        'Delivered': OrderStatus.DELIVERED,
        'UnDelivered': OrderStatus.SHIPPED,
        'Cancelled': OrderStatus.CANCELLED,
      }

      let mappedStatus = statusMap[order.status] || OrderStatus.PENDING

      // AUTO-COMPLETE mantığı: 14+ günlük DELIVERED siparişler otomatik COMPLETED
      // (İade/değişim süresi ve kargo gecikmelerini kapsamak için 14 gün)
      const orderDate = new Date(order.orderDate)
      const daysSinceOrder = Math.floor((Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24))

      if (mappedStatus === OrderStatus.DELIVERED && daysSinceOrder >= 14) {
        console.log(`📦 Sipariş ${daysSinceOrder} gün önce teslim edildi, otomatik COMPLETED yapılıyor`)
        mappedStatus = OrderStatus.COMPLETED
      }

      const dbOrderNumber = `TY-${order.orderNumber}`

      // Upsert
      const dbOrder = await prisma.order.upsert({
        where: { orderNumber: dbOrderNumber },
        update: {
          status: mappedStatus,
          customerName: order.shipmentAddress?.fullName || `${order.customerFirstName || ''} ${order.customerLastName || ''}`.trim() || 'Unknown',
          customerPhone: order.shipmentAddress?.phone || 'Belirtilmemiş',
          customerAddress: order.shipmentAddress?.fullAddress || 'Unknown',
          trackingNumber: order.cargoTrackingNumber ? String(order.cargoTrackingNumber) : undefined,
        },
        create: {
          orderNumber: dbOrderNumber,
          platform: Platform.TRENDYOL,
          platformOrderId: String(order.orderId || order.orderNumber),
          customerName: order.shipmentAddress?.fullName || `${order.customerFirstName || ''} ${order.customerLastName || ''}`.trim() || 'Unknown',
          customerPhone: order.shipmentAddress?.phone || 'Belirtilmemiş',
          customerAddress: order.shipmentAddress?.fullAddress || 'Unknown',
          status: mappedStatus,
          orderDate: new Date(order.orderDate),
          trackingNumber: order.cargoTrackingNumber ? String(order.cargoTrackingNumber) : undefined,
          commissionRate: 17,
          shippingCost: 0,
          items: {
            create: order.lines.map((line: any) => ({
              productName: line.productName,
              stockCode: line.merchantSku || null,
              sku: line.barcode,
              quantity: line.quantity,
              purchasePrice: 0,
              salePrice: line.price,
            })),
          },
        },
      })

      return NextResponse.json({
        success: true,
        message: `Sipariş ${dbOrderNumber} başarıyla sync edildi`,
        order: {
          id: dbOrder.id,
          orderNumber: dbOrder.orderNumber,
          status: dbOrder.status,
          trendyolStatus: order.status,
          daysSinceOrder,
        },
      })
    }

    return NextResponse.json(
      { success: false, error: 'Sadece TRENDYOL destekleniyor şu an' },
      { status: 400 }
    )

  } catch (error: any) {
    console.error('Manuel sync error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to sync order' },
      { status: 500 }
    )
  }
}
