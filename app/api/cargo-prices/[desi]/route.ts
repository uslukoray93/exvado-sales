import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ desi: string }> }
) {
  try {
    const { desi } = await params
    const desiNumber = parseInt(desi)

    if (isNaN(desiNumber) || desiNumber < 0) {
      return NextResponse.json(
        { error: 'Geçersiz desi değeri' },
        { status: 400 }
      )
    }

    // Desi değerine göre fiyat bul
    const cargoPrice = await prisma.cargoPrice.findUnique({
      where: { desi: desiNumber }
    })

    if (!cargoPrice) {
      // Eğer tam desi bulunamazsa, en yakın üst desi'yi bul
      const nearestPrice = await prisma.cargoPrice.findFirst({
        where: {
          desi: {
            gte: desiNumber
          }
        },
        orderBy: {
          desi: 'asc'
        }
      })

      if (!nearestPrice) {
        return NextResponse.json(
          { error: 'Bu desi için fiyat bulunamadı' },
          { status: 404 }
        )
      }

      return NextResponse.json(nearestPrice)
    }

    return NextResponse.json(cargoPrice)
  } catch (error) {
    console.error('Kargo fiyatı getirme hatası:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}
