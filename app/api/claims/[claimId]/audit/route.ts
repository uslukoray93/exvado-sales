import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/claims/[claimId]/audit
 * Get claim audit history
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { claimId: string } }
) {
  try {
    const { claimId } = params

    // Find claim by claimId (Trendyol ID)
    const claim = await prisma.returnClaim.findUnique({
      where: { claimId },
      select: { id: true }
    })

    if (!claim) {
      return NextResponse.json(
        {
          success: false,
          error: 'Claim not found',
        },
        { status: 404 }
      )
    }

    // Get audit entries
    const audits = await prisma.returnClaimAudit.findMany({
      where: { claimId: claim.id },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json({
      success: true,
      data: audits,
    })
  } catch (error: any) {
    console.error('Claim audit error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch audit',
      },
      { status: 500 }
    )
  }
}
