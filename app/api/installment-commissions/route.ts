import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/installment-commissions
 * Tüm taksit komisyon oranlarını getir
 */
export async function GET() {
  try {
    const commissions = await prisma.installmentCommission.findMany({
      orderBy: {
        installmentCount: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      data: commissions
    })
  } catch (error: any) {
    console.error('Get installment commissions error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch installment commissions'
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/installment-commissions
 * Yeni taksit komisyon oranı ekle veya güncelle
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { installmentCount, commissionRate } = body

    if (installmentCount === undefined || commissionRate === undefined) {
      return NextResponse.json(
        { success: false, error: 'installmentCount and commissionRate are required' },
        { status: 400 }
      )
    }

    // Upsert: varsa güncelle, yoksa ekle
    const commission = await prisma.installmentCommission.upsert({
      where: {
        installmentCount: parseInt(installmentCount)
      },
      update: {
        commissionRate: parseFloat(commissionRate)
      },
      create: {
        installmentCount: parseInt(installmentCount),
        commissionRate: parseFloat(commissionRate)
      }
    })

    return NextResponse.json({
      success: true,
      data: commission
    })
  } catch (error: any) {
    console.error('Create/Update installment commission error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to save installment commission'
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/installment-commissions
 * Tüm taksit komisyon oranlarını toplu güncelle
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { commissions } = body

    console.log('PATCH request body:', JSON.stringify(body, null, 2))

    if (!Array.isArray(commissions)) {
      return NextResponse.json(
        { success: false, error: 'commissions array is required' },
        { status: 400 }
      )
    }

    // Tüm komisyonları güncelle
    const updates = await Promise.all(
      commissions.map(({ installmentCount, commissionRate }) => {
        console.log('Upserting:', { installmentCount, commissionRate })
        return prisma.installmentCommission.upsert({
          where: { installmentCount },
          update: { commissionRate },
          create: { installmentCount, commissionRate }
        })
      })
    )

    console.log('Updates successful:', updates.length)

    return NextResponse.json({
      success: true,
      data: updates
    })
  } catch (error: any) {
    console.error('Batch update installment commissions error:', error)
    console.error('Error stack:', error.stack)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to update installment commissions'
      },
      { status: 500 }
    )
  }
}
