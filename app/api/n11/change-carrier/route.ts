import { NextRequest, NextResponse } from 'next/server'
import { getN11SoapClient } from '@/lib/api/n11-soap'
import { getN11RestClient } from '@/lib/api/n11-rest'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/n11/change-carrier
 * Change carrier for an N11 order
 *
 * Body:
 * {
 *   "platformOrderId": "112226737622213", // Package ID
 *   "shipmentCompanyId": 344, // Yurtiçi Kargo ID
 *   "trackingNumber": "1234567890" // Optional
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { platformOrderId, shipmentCompanyId, trackingNumber } = body

    if (!platformOrderId || !shipmentCompanyId) {
      return NextResponse.json(
        {
          success: false,
          error: 'platformOrderId and shipmentCompanyId are required',
        },
        { status: 400 }
      )
    }

    console.log(`Changing carrier for package ${platformOrderId} to company ${shipmentCompanyId}`)

    // 1. Get package details from REST API to get orderLineId
    const n11RestClient = getN11RestClient()
    const packageResponse = await n11RestClient.getOrders({
      packageIds: platformOrderId,
      page: 0,
      size: 1,
    })

    if (!packageResponse.content || packageResponse.content.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Package not found in N11',
        },
        { status: 404 }
      )
    }

    const packageData = packageResponse.content[0]
    const orderLines = packageData.lines || []

    if (orderLines.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No order lines found in package',
        },
        { status: 404 }
      )
    }

    // 2. Use SOAP API to change carrier for each line
    const n11SoapClient = getN11SoapClient()
    const results = []

    for (const line of orderLines) {
      const orderLineId = line.orderLineId

      if (!orderLineId) {
        console.warn('Skipping line without orderLineId:', line)
        continue
      }

      console.log(`  Changing carrier for line ${orderLineId}...`)

      try {
        // IMPORTANT: Don't send campaignNumber to let N11 generate new code
        // When changing carrier, N11 will create a new campaign code automatically
        const result = await n11SoapClient.makeOrderItemShipment(
          orderLineId,
          shipmentCompanyId,
          undefined, // Don't send campaign number
          trackingNumber
        )

        results.push({
          orderLineId,
          success: true,
          result,
        })

        console.log(`  ✅ Changed carrier for line ${orderLineId}`)
      } catch (error: any) {
        console.error(`  ❌ Failed to change carrier for line ${orderLineId}:`, error)
        results.push({
          orderLineId,
          success: false,
          error: error.message,
        })
      }
    }

    // 3. Update database
    const successCount = results.filter(r => r.success).length
    const failureCount = results.filter(r => !r.success).length

    // If all failed, return error
    if (successCount === 0) {
      const firstError = results.find(r => !r.success)?.error || 'Kargo firması değiştirilemedi'

      return NextResponse.json(
        {
          success: false,
          error: firstError,
          results,
        },
        { status: 400 }
      )
    }

    if (successCount > 0) {
      // Fetch updated package data
      const updatedPackage = await n11RestClient.getOrders({
        packageIds: platformOrderId,
        page: 0,
        size: 1,
      })

      if (updatedPackage.content && updatedPackage.content.length > 0) {
        const newPackageData = updatedPackage.content[0]

        // Update order in database
        await prisma.order.update({
          where: { platformOrderId },
          data: {
            cargoCompany: mapN11CargoCompany(newPackageData.cargoProviderName),
            trackingNumber: trackingNumber || newPackageData.cargoTrackingNumber || undefined,
          },
        })

        console.log(`✅ Updated database for package ${platformOrderId}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Changed carrier for ${successCount}/${results.length} order lines`,
      results,
      warning: failureCount > 0 ? `${failureCount} sipariş değiştirilemedi` : undefined,
    })
  } catch (error: any) {
    console.error('Failed to change carrier:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to change carrier',
      },
      { status: 500 }
    )
  }
}

/**
 * Map N11 cargo company name to internal slug
 */
function mapN11CargoCompany(n11CargoName: string | null | undefined): string {
  if (!n11CargoName) return 'aras-kargo'

  const cargoName = n11CargoName.toLowerCase()

  if (cargoName.includes('yurtiçi') || cargoName.includes('yurtici')) return 'yurtici-kargo'
  if (cargoName.includes('sürat') || cargoName.includes('surat')) return 'surat-kargo'
  if (cargoName.includes('dhl')) return 'dhl-ecommerce'
  if (cargoName.includes('ptt')) return 'ptt-kargo'
  if (cargoName.includes('kolay gelsin')) return 'kolay-gelsin'
  if (cargoName.includes('horoz')) return 'horoz-kargo'
  if (cargoName.includes('ceva')) return 'ceva-lojistik'
  if (cargoName.includes('aras')) return 'aras-kargo'
  if (cargoName.includes('mng')) return 'mng-kargo'
  if (cargoName.includes('ups')) return 'ups-kargo'

  return 'aras-kargo'
}
