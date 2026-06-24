import { NextResponse } from 'next/server'

// In-memory cache
let cachedXML: string | null = null
let cacheTimestamp: number | null = null
const CACHE_DURATION = 60 * 60 * 1000 // 1 saat (milisaniye)

export async function GET() {
  try {
    // Cache kontrolü
    const now = Date.now()
    if (cachedXML && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
      console.log('📦 Bolbolbul XML served from cache')
      return new NextResponse(cachedXML, {
        status: 200,
        headers: {
          'Content-Type': 'application/xml',
          'X-Cache': 'HIT'
        },
      })
    }

    console.log('🌐 Fetching fresh Bolbolbul XML...')
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000) // 30 saniye timeout

    const response = await fetch('https://panel.bolbolbul.com/tum_urunler.xml', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      signal: controller.signal
    })

    clearTimeout(timeout)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const xmlText = await response.text()

    // Cache'e kaydet
    cachedXML = xmlText
    cacheTimestamp = now
    console.log(`✅ Bolbolbul XML fetched and cached (${Math.round(xmlText.length / 1024)} KB)`)

    return new NextResponse(xmlText, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'X-Cache': 'MISS'
      },
    })
  } catch (error: any) {
    console.error('❌ Bolbolbul XML fetch error:', error.message)
    return NextResponse.json(
      { error: 'Bolbolbul XML çekilemedi', message: error.message },
      { status: 500 }
    )
  }
}
