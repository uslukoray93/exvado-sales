import { NextRequest, NextResponse } from 'next/server'
import { getN11SoapClient } from '@/lib/api/n11-soap'

// Cache mekanizması: N11 API'si 1 dakikada bir kez istek sınırı koyuyor
let cachedQuestions: any = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 60 * 1000 // 1 dakika

/**
 * GET /api/questions/n11
 * N11 müşteri sorularını çek (SOAP API)
 * Cache: 1 dakika
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '0')
    const pageSize = parseInt(searchParams.get('pageSize') || '100')
    const forceRefresh = searchParams.get('refresh') === 'true'

    // Cache kontrolü
    const now = Date.now()
    if (!forceRefresh && cachedQuestions && (now - cacheTimestamp) < CACHE_DURATION) {
      console.log('✅ N11 sorular cache\'ten döndürülüyor')
      return NextResponse.json({
        ...cachedQuestions,
        cached: true,
        cacheAge: Math.floor((now - cacheTimestamp) / 1000),
      })
    }

    // API'den çek
    const client = getN11SoapClient()
    const response = await client.getProductQuestionList(page, pageSize)

    // Cache'e kaydet
    cachedQuestions = response
    cacheTimestamp = now

    console.log('✅ N11 sorular API\'den çekildi ve cache\'lendi')
    return NextResponse.json(response)
  } catch (error: any) {
    console.error('❌ N11 sorular çekme hatası:', error)

    // Rate limit hatası ise cache'ten dön
    if (error.message && error.message.includes('dakikada bir kez')) {
      if (cachedQuestions) {
        console.log('⚠️ Rate limit - Cache\'ten döndürülüyor')
        return NextResponse.json({
          ...cachedQuestions,
          cached: true,
          rateLimited: true,
        })
      }
    }

    return NextResponse.json(
      { error: error.message || 'Sorular çekilemedi' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/questions/n11
 * N11 sorusunu cevapla (SOAP API)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { questionId, answerText } = body

    if (!questionId || !answerText) {
      return NextResponse.json(
        { error: 'questionId ve answerText gerekli' },
        { status: 400 }
      )
    }

    const client = getN11SoapClient()
    await client.saveProductAnswer(questionId, answerText)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('❌ N11 soru cevaplama hatası:', error)
    return NextResponse.json(
      { error: error.message || 'Soru cevaplanamadı' },
      { status: 500 }
    )
  }
}
