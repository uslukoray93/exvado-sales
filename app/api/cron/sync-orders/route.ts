import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/cron/sync-orders
 * Cron job endpoint to automatically sync orders from all platforms
 *
 * This endpoint can be called by:
 * 1. Vercel Cron Jobs (vercel.json configuration)
 * 2. External cron services (cron-job.org, etc.)
 * 3. GitHub Actions scheduled workflows
 *
 * Security: Protect this endpoint with an API key
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'default-cron-secret-change-me'

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get the base URL
    const protocol = request.headers.get('x-forwarded-proto') || 'http'
    const host = request.headers.get('host') || 'localhost:3020'
    const baseUrl = `${protocol}://${host}`

    // Call the sync endpoint
    const syncResponse = await fetch(`${baseUrl}/api/orders/sync`)
    const syncData = await syncResponse.json()

    // Log the sync result
    console.log(`[CRON] Order sync completed at ${new Date().toISOString()}`)
    console.log(`[CRON] Result:`, syncData.summary)

    return NextResponse.json({
      success: true,
      message: 'Cron job executed successfully',
      timestamp: new Date().toISOString(),
      result: syncData,
    })
  } catch (error: any) {
    console.error('[CRON] Sync orders error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Cron job failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

// Optionally support POST method as well
export async function POST(request: NextRequest) {
  return GET(request)
}
