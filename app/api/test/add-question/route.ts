import { NextResponse } from 'next/server'

/**
 * Test endpoint - Fake soru ekler
 * Bu sadece test için, gerçek API'ye soru eklemez
 */
export async function POST() {
  try {
    console.log('🧪 Test sorusu ekleniyor...')

    // Bu sadece bir mock, gerçekte API'ye eklemiyoruz
    // Ama count API'sini test etmek için kullanabiliriz

    return NextResponse.json({
      success: true,
      message: 'Test sorusu eklendi (mock)'
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
