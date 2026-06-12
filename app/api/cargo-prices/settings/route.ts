import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const settings = await prisma.cargoPriceSettings.findUnique({
      where: { id: 'default' }
    })

    if (!settings) {
      // Eğer ayar yoksa varsayılan olarak oluştur
      const newSettings = await prisma.cargoPriceSettings.create({
        data: {
          id: 'default',
          markupPercent: 20
        }
      })
      return NextResponse.json(newSettings)
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Ayarlar getirme hatası:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { markupPercent } = await request.json()

    if (typeof markupPercent !== 'number' || markupPercent < 0 || markupPercent > 100) {
      return NextResponse.json(
        { error: 'Geçersiz kar marjı değeri (0-100 arası olmalı)' },
        { status: 400 }
      )
    }

    const settings = await prisma.cargoPriceSettings.upsert({
      where: { id: 'default' },
      update: {
        markupPercent,
        updatedBy: 'Admin' // Gerçek uygulamada kullanıcı adı alınır
      },
      create: {
        id: 'default',
        markupPercent,
        updatedBy: 'Admin'
      }
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Ayarlar güncelleme hatası:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}
