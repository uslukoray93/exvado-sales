import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/orders/recent
 * Son 3 yeni (NEW) statuslu siparişi döndür
 */
export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      where: {
        status: 'PENDING'
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 3,
      include: {
        items: {
          take: 1, // Her siparişten sadece 1 ürün
          select: {
            sku: true,
            imageUrl: true
          }
        }
      }
    })

    // Format response
    const formattedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      platform: order.platform,
      customerName: order.customerFirstName && order.customerLastName
        ? `${order.customerFirstName} ${order.customerLastName}`
        : 'Müşteri',
      totalPrice: order.totalPrice,
      createdAt: order.createdAt,
      productName: order.items[0]?.sku || 'Ürün',
      imageUrl: order.items[0]?.imageUrl
    }))

    return NextResponse.json({
      success: true,
      orders: formattedOrders
    })
  } catch (error: any) {
    console.error('❌ Son siparişler çekme hatası:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Siparişler çekilemedi',
        orders: []
      },
      { status: 500 }
    )
  }
}
