import { NextRequest, NextResponse } from 'next/server'
import { getTrendyolClient } from '@/lib/api/trendyol'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/orders/update-cargo
 * Update cargo provider for Trendyol order
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderNumber, cargoCompany } = body

    if (!orderNumber || !cargoCompany) {
      return NextResponse.json(
        { success: false, error: 'Order number and cargo company are required' },
        { status: 400 }
      )
    }

    // Find order in database to get platformOrderId
    const order = await prisma.order.findFirst({
      where: {
        orderNumber: orderNumber,
        platform: 'TRENDYOL'
      }
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    // Get Trendyol client
    const trendyolClient = getTrendyolClient()

    // Remove "TY-" prefix from order number for Trendyol API
    const trendyolOrderNumber = orderNumber.replace(/^TY-/i, '')
    console.log('🔍 Searching Trendyol order:', trendyolOrderNumber)

    // Get order details from Trendyol to find shipmentPackageId
    const trendyolOrder = await trendyolClient.getOrderByNumber(trendyolOrderNumber)

    if (!trendyolOrder || !trendyolOrder.shipmentPackageId) {
      return NextResponse.json(
        { success: false, error: 'Shipment package ID not found in Trendyol order' },
        { status: 404 }
      )
    }

    // Eski kargo bilgilerini sakla
    const oldCargoProvider = trendyolOrder.cargoProviderName
    const oldTrackingNumber = trendyolOrder.cargoTrackingNumber

    // Update cargo provider on Trendyol
    let rateLimitError = false
    try {
      await trendyolClient.updateCargoProvider(
        trendyolOrder.shipmentPackageId,
        cargoCompany
      )
      console.log('✅ Trendyol API isteği gönderildi')
    } catch (updateError: any) {
      // Eğer 409 (rate limit) hatası ise, flag set et
      if (updateError.message && updateError.message.includes('409')) {
        console.log('⚠️ Trendyol rate limit (5 dakika bekleme)')
        rateLimitError = true
      } else {
        throw updateError
      }
    }

    console.log('⏳ Trendyol sisteminin güncellenmesi için 5 saniye bekleniyor...')

    // Trendyol'un sistemi güncellemesi için 5 saniye bekle
    await new Promise(resolve => setTimeout(resolve, 5000))

    console.log('🔄 Trendyol\'dan güncel sipariş bilgilerini kontrol ediliyor...')

    // Trendyol'dan güncel sipariş bilgilerini tekrar çek
    const updatedTrendyolOrder = await trendyolClient.getOrderByNumber(trendyolOrderNumber)

    if (!updatedTrendyolOrder) {
      return NextResponse.json(
        { success: false, error: 'Sipariş bulunamadı' },
        { status: 404 }
      )
    }

    const newCargoProvider = updatedTrendyolOrder.cargoProviderName
    const newTrackingNumber = String(updatedTrendyolOrder.cargoTrackingNumber)

    console.log('📦 Eski kargo:', oldCargoProvider, '-', oldTrackingNumber)
    console.log('📦 Yeni kargo:', newCargoProvider, '-', newTrackingNumber)

    // Kargo firması gerçekten değişmiş mi kontrol et
    const cargoChanged = newCargoProvider !== oldCargoProvider
    const trackingChanged = newTrackingNumber !== String(oldTrackingNumber)

    if (!cargoChanged && !trackingChanged) {
      // Hiçbir şey değişmemiş - rate limit nedeniyle
      console.log('❌ Trendyol\'da değişiklik yapılamadı (rate limit)')
      return NextResponse.json({
        success: false,
        error: 'rate_limit',
        message: 'Trendyol\'da aynı siparişin kargo firmasını 5 dakikada bir değiştirebilirsiniz. Lütfen 5 dakika sonra tekrar deneyin.',
        currentCargoProvider: oldCargoProvider,
        currentTrackingNumber: String(oldTrackingNumber)
      }, { status: 429 })
    }

    // Değişiklik başarılı - veritabanını güncelle
    console.log('✅ Trendyol\'da kargo firması değişti, veritabanı güncelleniyor...')
    console.log('📝 Veritabanına yazılacak kargo firması:', cargoCompany)

    await prisma.order.update({
      where: { id: order.id },
      data: {
        trackingNumber: newTrackingNumber,
        cargoCompany: cargoCompany
      }
    })

    console.log('✅ Veritabanında tracking number güncellendi')

    return NextResponse.json({
      success: true,
      message: 'Kargo firması başarıyla güncellendi',
      trackingNumber: newTrackingNumber,
      cargoProvider: newCargoProvider
    })
  } catch (error: any) {
    console.error('Update cargo provider error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to update cargo provider',
      },
      { status: 500 }
    )
  }
}
