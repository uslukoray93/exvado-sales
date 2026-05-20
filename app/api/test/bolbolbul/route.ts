import { NextResponse } from 'next/server'
import { getBolbolbulClient } from '@/lib/api/bolbolbul'

export async function GET() {
  try {
    const client = getBolbolbulClient()

    console.log('🧪 TEST: Calling bolbolbul getOrders...')
    const response = await client.getOrders()

    console.log(`🧪 TEST: Received response.data.length = ${response.data.length}`)
    console.log(`🧪 TEST: Received response.total = ${response.total}`)

    return NextResponse.json({
      success: true,
      dataLength: response.data.length,
      total: response.total,
      firstOrder: response.data[0] || null,
    })
  } catch (error: any) {
    console.error('🧪 TEST ERROR:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 })
  }
}
