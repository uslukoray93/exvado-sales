import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/orders/count
 * Yeni (NEW) statuslu siparişlerin sayısını döndür
 */
export async function GET() {
  try {
    // Sadece "PENDING" (Yeni) statuslu siparişleri say
    const count = await prisma.order.count({
      where: {
        status: 'PENDING'
      }
    })

    return NextResponse.json({
      success: true,
      count
    })
  } catch (error: any) {
    console.error('❌ Sipariş sayısı çekme hatası:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Sipariş sayısı çekilemedi',
        count: 0
      },
      { status: 500 }
    )
  }
}
