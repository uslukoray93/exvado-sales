import { NextResponse } from 'next/server'
import { getTrendyolClient } from '@/lib/api/trendyol'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/claims/reasons
 * Get claim issue reasons (cache from database, fallback to Trendyol API)
 */
export async function GET() {
  try {
    // Try to get from database first (cache)
    let reasons = await prisma.claimIssueReason.findMany({
      where: { isActive: true },
      orderBy: { id: 'asc' }
    })

    // If not in cache, fetch from Trendyol and cache
    if (reasons.length === 0) {
      console.log('📥 Fetching claim issue reasons from Trendyol...')
      const trendyolClient = getTrendyolClient()
      const trendyolReasons = await trendyolClient.getClaimIssueReasons()

      // Save to database
      for (const reason of trendyolReasons) {
        await prisma.claimIssueReason.upsert({
          where: { id: reason.id },
          update: { name: reason.name, isActive: true },
          create: {
            id: reason.id,
            name: reason.name,
            isActive: true,
          },
        })
      }

      reasons = await prisma.claimIssueReason.findMany({
        where: { isActive: true },
        orderBy: { id: 'asc' }
      })

      console.log(`✅ Cached ${reasons.length} claim issue reasons`)
    }

    return NextResponse.json({
      success: true,
      data: reasons,
    })
  } catch (error: any) {
    console.error('Claim reasons error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch claim reasons',
      },
      { status: 500 }
    )
  }
}
