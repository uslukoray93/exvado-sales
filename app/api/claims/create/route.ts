import { NextRequest, NextResponse } from 'next/server'
import { getTrendyolClient } from '@/lib/api/trendyol'
import { prisma } from '@/lib/prisma'
import { ReturnClaimStatus } from '@prisma/client'

/**
 * POST /api/claims/create
 * Create a new return claim
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderNumber, claimItems, customerId, excludeListing, forcePackageCreation, shipmentCompanyId } = body

    // Validate required fields
    if (!orderNumber || !claimItems || claimItems.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'orderNumber ve claimItems gereklidir',
        },
        { status: 400 }
      )
    }

    // Create claim via Trendyol API
    const trendyolClient = getTrendyolClient()
    const response = await trendyolClient.createClaim({
      orderNumber,
      claimItems,
      customerId,
      excludeListing,
      forcePackageCreation,
      shipmentCompanyId,
    })

    console.log('✅ Trendyol response:', response)

    // Save to database
    const claim = await prisma.returnClaim.create({
      data: {
        claimId: response.claimId,
        orderNumber,
        claimDate: new Date(),
        customerName: 'Unknown', // Will be updated when syncing
        status: ReturnClaimStatus.Created,
        cargoTrackingNumber: response.cargoTrackingNumber?.toString(),
        items: {
          create: claimItems.map((item: any, index: number) => ({
            claimItemId: response.claimItemIds?.[index] || `temp-${Date.now()}-${index}`,
            barcode: item.barcode,
            productName: 'Unknown', // Will be updated when syncing
            quantity: item.quantity,
            reasonId: item.reasonId || 401,
            reasonText: item.reasonText,
            customerNote: item.customerNote,
          })),
        },
      },
      include: {
        items: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: claim,
      message: 'İade talebi başarıyla oluşturuldu',
    })
  } catch (error: any) {
    console.error('Create claim error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create claim',
      },
      { status: 500 }
    )
  }
}
