import { NextRequest, NextResponse } from 'next/server'
import { getTrendyolClient } from '@/lib/api/trendyol'

/**
 * GET /api/questions/trendyol
 * Trendyol müşteri sorularını çek
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '0')
    const size = parseInt(searchParams.get('size') || '50')
    const statusParam = searchParams.get('status')

    // Status parametresi (WAITING_FOR_ANSWER, ANSWERED, etc.)
    const status = statusParam as 'WAITING_FOR_ANSWER' | 'ANSWERED' | 'REPORTED' | 'REJECTED' | 'UNANSWERED' | undefined

    const client = getTrendyolClient()
    const response = await client.getQuestions({
      page,
      size,
      status: status || 'WAITING_FOR_ANSWER' // Varsayılan: Cevap bekleyenler
    })

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('❌ Trendyol sorular çekme hatası:', error)
    return NextResponse.json(
      { error: error.message || 'Sorular çekilemedi' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/questions/trendyol
 * Trendyol sorusunu cevapla
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

    if (answerText.length < 10 || answerText.length > 2000) {
      return NextResponse.json(
        { error: 'Cevap metni 10-2000 karakter arasında olmalıdır' },
        { status: 400 }
      )
    }

    const client = getTrendyolClient()
    await client.answerQuestion(questionId, answerText)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('❌ Trendyol soru cevaplama hatası:', error)
    return NextResponse.json(
      { error: error.message || 'Soru cevaplanamadı' },
      { status: 500 }
    )
  }
}
