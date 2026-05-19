import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/orders/sync
 * Sync orders from all platforms (Trendyol, N11, Bolbolbul)
 */
export async function GET(request: NextRequest) {
  try {
    const baseUrl = request.nextUrl.origin

    // Sync all platforms in parallel - AKILLI SYNC (sadece yeni/güncellenen siparişler)
    const [trendyolResult, n11Result, bolbolbulResult] = await Promise.allSettled([
      fetch(`${baseUrl}/api/orders/trendyol`).then(res => res.json()),
      fetch(`${baseUrl}/api/orders/n11`).then(res => res.json()), // N11 AKILLI SYNC
      fetch(`${baseUrl}/api/orders/bolbolbul`).then(res => res.json()),
    ])

    // Collect results
    const results = {
      trendyol: {
        success: trendyolResult.status === 'fulfilled' && trendyolResult.value.success,
        message: trendyolResult.status === 'fulfilled'
          ? trendyolResult.value.message
          : (trendyolResult as PromiseRejectedResult).reason,
        count: trendyolResult.status === 'fulfilled' && trendyolResult.value.data
          ? trendyolResult.value.data.length
          : 0,
      },
      n11: {
        success: n11Result.status === 'fulfilled' && n11Result.value.success,
        message: n11Result.status === 'fulfilled'
          ? n11Result.value.message
          : (n11Result as PromiseRejectedResult).reason,
        count: n11Result.status === 'fulfilled' && n11Result.value.data
          ? n11Result.value.data.length
          : 0,
      },
      bolbolbul: {
        success: bolbolbulResult.status === 'fulfilled' && bolbolbulResult.value.success,
        message: bolbolbulResult.status === 'fulfilled'
          ? bolbolbulResult.value.message
          : (bolbolbulResult as PromiseRejectedResult).reason,
        count: bolbolbulResult.status === 'fulfilled' && bolbolbulResult.value.data
          ? bolbolbulResult.value.data.length
          : 0,
      },
    }

    // Calculate totals
    const totalSuccess = Object.values(results).filter(r => r.success).length
    const totalOrders = results.trendyol.count + results.n11.count + results.bolbolbul.count

    return NextResponse.json({
      success: totalSuccess > 0,
      message: `Synced ${totalOrders} orders from ${totalSuccess}/3 platforms`,
      timestamp: new Date().toISOString(),
      platforms: results,
      summary: {
        totalPlatforms: 3,
        successfulPlatforms: totalSuccess,
        failedPlatforms: 3 - totalSuccess,
        totalOrdersSynced: totalOrders,
      },
    })
  } catch (error: any) {
    console.error('Sync all platforms error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to sync orders from all platforms',
      },
      { status: 500 }
    )
  }
}
