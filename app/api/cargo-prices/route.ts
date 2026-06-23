import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch all cargo prices
export async function GET() {
  try {
    const prices = await prisma.cargoPrice.findMany({
      orderBy: { desi: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: prices
    })
  } catch (error: any) {
    console.error('Fetch cargo prices error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// PUT - Update all cargo prices
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { prices, kdvRate } = body

    if (!prices || !Array.isArray(prices)) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz fiyat listesi' },
        { status: 400 }
      )
    }

    // Update or create each price
    const updates = await Promise.all(
      prices.map(async (price: any) => {
        // Skip temporary IDs
        const isNewRecord = price.id.startsWith('new-')

        if (isNewRecord) {
          // Create new record
          return prisma.cargoPrice.create({
            data: {
              desi: price.desi,
              aras: price.aras || 0,
              dhl: price.dhl || 0,
              kolayGelsin: price.kolayGelsin || 0,
              ptt: price.ptt,
              surat: price.surat || 0,
              tex: price.tex,
              yurtici: price.yurtici || 0,
              cevaTedarik: price.cevaTedarik || 0,
              ceva: price.ceva || 0,
              horoz: price.horoz || 0,
            }
          })
        } else {
          // Update existing record
          return prisma.cargoPrice.upsert({
            where: { id: price.id },
            update: {
              desi: price.desi,
              aras: price.aras || 0,
              dhl: price.dhl || 0,
              kolayGelsin: price.kolayGelsin || 0,
              ptt: price.ptt,
              surat: price.surat || 0,
              tex: price.tex,
              yurtici: price.yurtici || 0,
              cevaTedarik: price.cevaTedarik || 0,
              ceva: price.ceva || 0,
              horoz: price.horoz || 0,
            },
            create: {
              desi: price.desi,
              aras: price.aras || 0,
              dhl: price.dhl || 0,
              kolayGelsin: price.kolayGelsin || 0,
              ptt: price.ptt,
              surat: price.surat || 0,
              tex: price.tex,
              yurtici: price.yurtici || 0,
              cevaTedarik: price.cevaTedarik || 0,
              ceva: price.ceva || 0,
              horoz: price.horoz || 0,
            }
          })
        }
      })
    )

    // Update KDV settings if provided
    if (kdvRate !== undefined) {
      await prisma.cargoPriceSettings.upsert({
        where: { id: 'default' },
        update: { markupPercent: kdvRate },
        create: {
          id: 'default',
          markupPercent: kdvRate
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: updates
    })
  } catch (error: any) {
    console.error('Update cargo prices error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Remove a cargo price entry
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID gerekli' },
        { status: 400 }
      )
    }

    await prisma.cargoPrice.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete cargo price error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
