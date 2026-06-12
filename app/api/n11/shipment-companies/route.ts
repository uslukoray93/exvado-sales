import { NextResponse } from 'next/server'
import { getN11SoapClient } from '@/lib/api/n11-soap'

/**
 * GET /api/n11/shipment-companies
 * Get all N11 shipment companies (kargo firmalarını listele)
 */
export async function GET() {
  try {
    console.log('Fetching N11 shipment companies...')

    const n11Client = getN11SoapClient()
    const companies = await n11Client.getShipmentCompanies()

    console.log(`Found ${companies.length} shipment companies`)

    return NextResponse.json({
      success: true,
      data: companies,
    })
  } catch (error: any) {
    console.error('Failed to get shipment companies:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to get shipment companies',
      },
      { status: 500 }
    )
  }
}
