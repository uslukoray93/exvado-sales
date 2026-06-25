import { NextResponse } from 'next/server'

/**
 * GET /api/questions/count
 * Bekleyen (cevaplanmamış) soru sayısını döndür
 */
export async function GET() {
  try {
    // Paralel olarak Trendyol ve N11 sorularını çek
    const [trendyolResponse, n11Response] = await Promise.allSettled([
      fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/questions/trendyol?status=WAITING_FOR_ANSWER`, {
        cache: 'no-store'
      }),
      fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/questions/n11`, {
        cache: 'no-store'
      })
    ])

    let trendyolCount = 0
    let n11Count = 0

    // Trendyol sayısı
    if (trendyolResponse.status === 'fulfilled' && trendyolResponse.value.ok) {
      const data = await trendyolResponse.value.json()
      trendyolCount = data.content?.length || 0
    }

    // N11 sayısı (sadece OPEN statuslu sorular)
    if (n11Response.status === 'fulfilled' && n11Response.value.ok) {
      const data = await n11Response.value.json()
      const questions = data.productQuestions?.productQuestion || []
      const questionArray = Array.isArray(questions) ? questions : [questions]
      // Sadece cevaplanmamış soruları say (answer null veya boş olanlar)
      n11Count = questionArray.filter((q: any) => !q.answer || q.answer.trim() === '').length
    }

    const totalCount = trendyolCount + n11Count

    return NextResponse.json({
      success: true,
      total: totalCount,
      trendyol: trendyolCount,
      n11: n11Count
    })
  } catch (error: any) {
    console.error('❌ Soru sayısı çekme hatası:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Soru sayısı çekilemedi',
        total: 0,
        trendyol: 0,
        n11: 0
      },
      { status: 500 }
    )
  }
}
