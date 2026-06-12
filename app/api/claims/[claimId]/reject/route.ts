import { NextRequest, NextResponse } from 'next/server'
import { getTrendyolClient } from '@/lib/api/trendyol'
import { prisma } from '@/lib/prisma'
import { ReturnClaimStatus } from '@prisma/client'

/**
 * POST /api/claims/[claimId]/reject
 * Reject return claim
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { claimId: string } }
) {
  try {
    const { claimId } = params
    const formData = await request.formData()

    const claimIssueReasonId = parseInt(formData.get('claimIssueReasonId') as string)
    const claimItemIdList = formData.get('claimItemIdList') as string
    const description = formData.get('description') as string
    const files = formData.getAll('files')

    if (!claimIssueReasonId || !claimItemIdList || !description) {
      return NextResponse.json(
        {
          success: false,
          error: 'claimIssueReasonId, claimItemIdList ve description gereklidir',
        },
        { status: 400 }
      )
    }

    // Reject via Trendyol API
    const trendyolClient = getTrendyolClient()
    await trendyolClient.createClaimIssue(claimId, {
      claimIssueReasonId,
      claimItemIdList,
      description,
      files: files as any,
    })

    // Update database
    await prisma.returnClaim.update({
      where: { claimId },
      data: {
        status: ReturnClaimStatus.Rejected,
        lastModifiedDate: new Date(),
        notes: description,
      },
    })

    // Create audit entry
    await prisma.returnClaimAudit.create({
      data: {
        claimId: (await prisma.returnClaim.findUnique({ where: { claimId } }))!.id,
        previousStatus: 'Created',
        newStatus: 'Rejected',
        executorName: 'Admin',
        executorApp: 'ExvadoSales',
        date: new Date(),
        notes: `Rejected: ${description}`,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'İade talebi reddedildi',
    })
  } catch (error: any) {
    console.error('Reject claim error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to reject claim',
      },
      { status: 500 }
    )
  }
}
