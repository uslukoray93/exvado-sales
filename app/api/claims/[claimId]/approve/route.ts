import { NextRequest, NextResponse } from 'next/server'
import { getTrendyolClient } from '@/lib/api/trendyol'
import { prisma } from '@/lib/prisma'
import { ReturnClaimStatus } from '@prisma/client'

/**
 * PUT /api/claims/[claimId]/approve
 * Approve return claim items
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { claimId: string } }
) {
  try {
    const { claimId } = params
    const body = await request.json()
    const { claimLineItemIdList } = body

    if (!claimLineItemIdList || !Array.isArray(claimLineItemIdList)) {
      return NextResponse.json(
        {
          success: false,
          error: 'claimLineItemIdList gereklidir ve array olmalıdır',
        },
        { status: 400 }
      )
    }

    // Approve via Trendyol API
    const trendyolClient = getTrendyolClient()
    await trendyolClient.approveClaimLineItems(claimId, claimLineItemIdList)

    // Update database
    await prisma.returnClaim.update({
      where: { claimId },
      data: {
        status: ReturnClaimStatus.Accepted,
        lastModifiedDate: new Date(),
      },
    })

    // Create audit entry
    await prisma.returnClaimAudit.create({
      data: {
        claimId: (await prisma.returnClaim.findUnique({ where: { claimId } }))!.id,
        previousStatus: 'Created',
        newStatus: 'Accepted',
        executorName: 'Admin',
        executorApp: 'ExvadoSales',
        date: new Date(),
        notes: `Approved ${claimLineItemIdList.length} items`,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'İade talebi onaylandı',
    })
  } catch (error: any) {
    console.error('Approve claim error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to approve claim',
      },
      { status: 500 }
    )
  }
}
