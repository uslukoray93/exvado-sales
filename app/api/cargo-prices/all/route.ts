import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const prices = await prisma.cargoPrice.findMany({
      orderBy: {
        desi: 'asc'
      }
    })

    return NextResponse.json(prices)
  } catch (error) {
    console.error('Tüm fiyatları getirme hatası:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}
