import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTrendyolClient } from '@/lib/api/trendyol'
import { Platform } from '@prisma/client'

/**
 * GET /api/orders/shipping-label
 * Get shipping label URL for an order
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const orderId = searchParams.get('orderId')

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Get order from database
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        platform: true,
        platformOrderId: true,
        orderNumber: true
      }
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    let labelUrl: string | null = null

    // Get shipping label based on platform
    if (order.platform === Platform.TRENDYOL) {
      // Trendyol API ZPL formatında etiket döndürüyor (PDF değil)
      // En iyi çözüm: Merchant panel'e yönlendirmek
      const actualOrderNumber = order.orderNumber.replace('TY-', '')
      labelUrl = `https://merchantpanel.trendyol.com/orders/${actualOrderNumber}`

      console.log(`📦 Trendyol kargo etiketi linki: ${labelUrl}`)
    } else if (order.platform === Platform.N11) {
      // N11 için kargo etiketi URL'i
      labelUrl = `https://satici.n11.com/siparis-detay?orderId=${order.platformOrderId}`
    } else if (order.platform === Platform.HEPSIBURADA) {
      // Hepsiburada için kargo etiketi URL'i
      labelUrl = `https://merchant.hepsiburada.com/orders/${order.platformOrderId}/shipping-label`
    } else {
      return NextResponse.json(
        { success: false, error: 'Platform desteklenmiyor' },
        { status: 400 }
      )
    }

    if (!labelUrl) {
      return NextResponse.json(
        { success: false, error: 'Kargo etiketi URL alınamadı' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      labelUrl: labelUrl
    })
  } catch (error: any) {
    console.error('Shipping label error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to get shipping label'
      },
      { status: 500 }
    )
  }
}
