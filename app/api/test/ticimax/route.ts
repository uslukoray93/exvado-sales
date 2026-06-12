import { NextResponse } from 'next/server'
import { getTicimaxClient } from '@/lib/api/ticimax-soap'

export async function GET() {
  try {
    const client = getTicimaxClient()

    const end = new Date()
    const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000)

    console.log('🧪 TEST: Calling selectSiparis...')
    const orders = await client.selectSiparis(
      start.toISOString().split('T')[0],
      end.toISOString().split('T')[0]
    )

    console.log(`🧪 TEST: Received ${orders.length} orders`)
    console.log(`🧪 TEST: First order:`, orders[0] ? JSON.stringify(orders[0], null, 2).substring(0, 500) : 'NO ORDERS')

    return NextResponse.json({
      success: true,
      count: orders.length,
      firstOrder: orders[0] || null,
    })
  } catch (error: any) {
    console.error('🧪 TEST ERROR:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 })
  }
}
