import { NextRequest, NextResponse } from 'next/server'
import { getTrendyolClient } from '@/lib/api/trendyol'
import { prisma } from '@/lib/prisma'
import { ReturnClaimStatus } from '@prisma/client'

/**
 * GET /api/claims/list
 * Fetch and sync return claims from Trendyol
 */
export async function GET(request: NextRequest) {
  try {
    const trendyolClient = getTrendyolClient()
    const searchParams = request.nextUrl.searchParams

    // Get query parameters
    const page = parseInt(searchParams.get('page') || '0')
    const size = parseInt(searchParams.get('size') || '50')
    const status = searchParams.get('status') || undefined
    const orderNumber = searchParams.get('orderNumber') || undefined
    const sync = searchParams.get('sync') === 'true' // If true, fetch from Trendyol

    // Date range (default: last 30 days)
    const now = Date.now()
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000)
    const startDate = parseInt(searchParams.get('startDate') || thirtyDaysAgo.toString())
    const endDate = parseInt(searchParams.get('endDate') || now.toString())

    if (sync) {
      // Fetch from Trendyol and sync to database
      console.log('📥 Fetching claims from Trendyol...')
      console.log({startDate: new Date(startDate), endDate: new Date(endDate), status, orderNumber})

      const response = await trendyolClient.getClaims({
        page: 0,
        size: 200, // Get more records from Trendyol
        startDate,
        endDate,
        claimItemStatus: status,
        orderNumber,
      })

      console.log(`📦 Received ${response.content?.length || 0} claims from Trendyol`)

      // Debug: Log first claim structure
      if (response.content && response.content.length > 0) {
        console.log('📋 First claim structure:', JSON.stringify(response.content[0], null, 2))
      }

      // Sync claims to database
      if (response.content && Array.isArray(response.content)) {
        for (const claim of response.content) {
          await syncClaim(claim)
        }
      }
    }

    // Fetch from database with filters
    const where: any = {}

    if (status) {
      where.status = status as ReturnClaimStatus
    }

    if (orderNumber) {
      where.orderNumber = {
        contains: orderNumber,
        mode: 'insensitive'
      }
    }

    // Date filter
    where.claimDate = {
      gte: new Date(startDate),
      lte: new Date(endDate)
    }

    const [claims, totalCount] = await Promise.all([
      prisma.returnClaim.findMany({
        where,
        include: {
          items: true,
          Order: {
            select: {
              id: true,
              orderNumber: true,
              platform: true
            }
          }
        },
        orderBy: {
          claimDate: 'desc'
        },
        skip: page * size,
        take: size,
      }),
      prisma.returnClaim.count({ where })
    ])

    // Calculate statistics
    const stats = await calculateStats()

    return NextResponse.json({
      success: true,
      data: claims,
      pagination: {
        page,
        size,
        total: totalCount,
        totalPages: Math.ceil(totalCount / size),
      },
      stats,
    })
  } catch (error: any) {
    console.error('Claims list error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch claims',
      },
      { status: 500 }
    )
  }
}

/**
 * Sync a single claim from Trendyol to database
 */
async function syncClaim(trendyolClaim: any) {
  try {
    // Get the first claim item status for the overall claim status
    const firstClaimStatus = trendyolClaim.items?.[0]?.claimItems?.[0]?.claimItemStatus?.name || 'Created'
    const status = mapTrendyolStatus(firstClaimStatus)

    // Upsert claim
    const claim = await prisma.returnClaim.upsert({
      where: {
        claimId: trendyolClaim.id?.toString() || trendyolClaim.claimId
      },
      update: {
        lastModifiedDate: trendyolClaim.lastModifiedDate
          ? new Date(trendyolClaim.lastModifiedDate)
          : undefined,
        status,
        cargoTrackingNumber: trendyolClaim.cargoTrackingNumber?.toString() || null,
        cargoProviderName: trendyolClaim.cargoProviderName || null,
      },
      create: {
        claimId: trendyolClaim.id?.toString() || trendyolClaim.claimId,
        orderNumber: trendyolClaim.orderNumber,
        claimDate: new Date(trendyolClaim.claimDate),
        lastModifiedDate: trendyolClaim.lastModifiedDate
          ? new Date(trendyolClaim.lastModifiedDate)
          : undefined,
        customerName: trendyolClaim.customerFirstName && trendyolClaim.customerLastName
          ? `${trendyolClaim.customerFirstName} ${trendyolClaim.customerLastName}`
          : 'Unknown',
        cargoTrackingNumber: trendyolClaim.cargoTrackingNumber?.toString() || null,
        cargoProviderName: trendyolClaim.cargoProviderName || null,
        status,
      },
    })

    // Sync claim items - Trendyol structure: items[].orderLine + items[].claimItems[]
    if (trendyolClaim.items && Array.isArray(trendyolClaim.items)) {
      for (const itemGroup of trendyolClaim.items) {
        const orderLine = itemGroup.orderLine
        const claimItems = itemGroup.claimItems || []

        for (const claimItem of claimItems) {
          await prisma.returnClaimItem.upsert({
            where: {
              claimItemId: claimItem.id || `${claim.id}-${orderLine.barcode}`
            },
            update: {
              status: claimItem.claimItemStatus?.name || null,
              quantity: 1, // Trendyol doesn't always send quantity per claim item
            },
            create: {
              claimId: claim.id,
              claimItemId: claimItem.id || `${claim.id}-${orderLine.barcode}`,
              barcode: orderLine.barcode,
              productName: orderLine.productName,
              quantity: 1,
              reasonId: claimItem.customerClaimItemReason?.id || claimItem.trendyolClaimItemReason?.id || 0,
              reasonText: claimItem.customerClaimItemReason?.name || claimItem.trendyolClaimItemReason?.name || null,
              status: claimItem.claimItemStatus?.name || null,
              refundAmount: orderLine.price || 0,
              purchasePrice: 0, // Will be updated later
              customerNote: claimItem.customerNote || claimItem.note || null,
            },
          })
        }
      }
    }

    console.log(`✅ Synced claim: ${claim.claimId}`)
    return claim
  } catch (error: any) {
    console.error(`❌ Failed to sync claim ${trendyolClaim.id}:`, error.message)
    throw error
  }
}

/**
 * Map Trendyol claim status to our enum
 */
function mapTrendyolStatus(trendyolStatus: string): ReturnClaimStatus {
  const statusMap: Record<string, ReturnClaimStatus> = {
    'Created': ReturnClaimStatus.Created,
    'WaitingInAction': ReturnClaimStatus.WaitingInAction,
    'WaitingFraudCheck': ReturnClaimStatus.WaitingFraudCheck,
    'Accepted': ReturnClaimStatus.Accepted,
    'Unresolved': ReturnClaimStatus.Unresolved,
    'Rejected': ReturnClaimStatus.Rejected,
    'Cancelled': ReturnClaimStatus.Cancelled,
    'InAnalysis': ReturnClaimStatus.InAnalysis,
    'Completed': ReturnClaimStatus.Completed,
  }

  return statusMap[trendyolStatus] || ReturnClaimStatus.Created
}

/**
 * Calculate claim statistics
 */
async function calculateStats() {
  const [
    total,
    pending,
    inReview,
    accepted,
    rejected,
    completed,
  ] = await Promise.all([
    prisma.returnClaim.count(),
    prisma.returnClaim.count({
      where: {
        status: {
          in: [ReturnClaimStatus.Created, ReturnClaimStatus.WaitingInAction]
        }
      }
    }),
    prisma.returnClaim.count({
      where: {
        status: {
          in: [ReturnClaimStatus.WaitingFraudCheck, ReturnClaimStatus.InAnalysis]
        }
      }
    }),
    prisma.returnClaim.count({
      where: { status: ReturnClaimStatus.Accepted }
    }),
    prisma.returnClaim.count({
      where: { status: ReturnClaimStatus.Rejected }
    }),
    prisma.returnClaim.count({
      where: {
        status: {
          in: [ReturnClaimStatus.Completed, ReturnClaimStatus.Cancelled]
        }
      }
    }),
  ])

  return {
    total,
    pending,
    inReview,
    accepted,
    rejected,
    completed,
  }
}
