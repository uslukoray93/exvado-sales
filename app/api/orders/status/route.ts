import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { OrderStatus, Platform } from '@prisma/client'
import { getTrendyolClient } from '@/lib/api/trendyol'
import { getN11Client } from '@/lib/api/n11'
import { getBolbolbulClient } from '@/lib/api/bolbolbul'

/**
 * PATCH /api/orders/status
 * Update order status both in database and platform (Trendyol)
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, status } = body

    console.log(`\n🔵 ====== STATUS UPDATE REQUEST ======`)
    console.log(`📋 Order ID: ${orderId}`)
    console.log(`📝 Yeni Status: ${status}`)

    if (!orderId || !status) {
      return NextResponse.json(
        { success: false, error: 'Order ID and status are required' },
        { status: 400 }
      )
    }

    // Get order from database
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { platform: true, platformOrderId: true, orderNumber: true, status: true }
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    console.log(`🏪 Platform: ${order.platform}`)
    console.log(`📦 Order Number: ${order.orderNumber}`)
    console.log(`📊 Mevcut Status: ${order.status}`)

    // Map internal status to platform status
    const platformStatus = mapToPlatformStatus(status, order.platform)
    console.log(`🔄 Platform Status Mapping: ${status} → ${platformStatus}`)

    // Try to update platform status BEFORE updating database
    let platformError = null
    let platformUpdateSuccess = false

    // N11 Status Update - USING REST API
    if (order.platform === Platform.N11) {
      console.log(`\n🟢 N11 Platform Detected`)
      console.log(`🔍 Platform Status: ${platformStatus}`)

      // Only support "Picking" status (status 3 = PROCESSING)
      if (platformStatus !== '3') {
        console.log(`⚠️ N11 REST API only supports "Picking" status. Skipping status ${platformStatus}`)
        platformError = `N11 sadece "Hazırlanıyor" durumuna geçişi destekler (şu anki istek: ${status})`
      } else {
        try {
          console.log(`\n🔄 N11 REST API çağrısı yapılıyor...`)
          console.log(`📦 Order Number: ${order.orderNumber}`)
          console.log(`📝 Yeni Durum: Picking`)

          // Get order items to extract lineIds (SKU values)
          const orderWithItems = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true }
          })

          console.log(`📦 Items found: ${orderWithItems?.items.length || 0}`)

          if (!orderWithItems || orderWithItems.items.length === 0) {
            throw new Error('Sipariş ürünleri bulunamadı')
          }

          // N11 REST Client kullan
          const { getN11RestClient } = await import('@/lib/api/n11-rest')
          const n11RestClient = getN11RestClient()
          console.log(`✅ N11 REST Client oluşturuldu`)

          // Extract lineIds from SKU values
          const lineIds = orderWithItems.items.map(item => parseInt(item.sku))
          console.log(`📋 Line IDs: ${lineIds.join(', ')}`)

          // Update order status via REST API
          const result = await n11RestClient.updateOrderStatus(lineIds)

          if (result.success) {
            console.log(`\n✅ N11 ${orderWithItems.items.length} ürün durumu başarıyla güncellendi`)
            platformUpdateSuccess = true
          } else {
            const failedItems = result.results.filter((r: any) => r.status !== 'SUCCESS')
            console.error(`⚠️ Bazı ürünler güncellenemedi:`, failedItems)
            throw new Error(`${failedItems.length} ürün güncellenemedi`)
          }
        } catch (error: any) {
          console.error('\n❌ N11 API Hatası:', error.message)
          console.error('Error Stack:', error.stack)
          platformError = error.message
        }
      }
    }

    // Bolbolbul Status Update (Ticimax)
    if (order.platform === Platform.BOLBOLBUL && platformStatus) {
      console.log(`\n🟠 Bolbolbul (Ticimax) Platform Detected`)
      console.log(`🔍 Platform Status ID: ${platformStatus}`)

      try {
        console.log(`🔄 Ticimax API çağrısı yapılıyor...`)
        console.log(`📦 Order Number: ${order.orderNumber}`)
        console.log(`📦 Platform Order ID: ${order.platformOrderId}`)
        console.log(`📝 Yeni Durum ID: ${platformStatus}`)

        const bolbolbulClient = getBolbolbulClient()

        // Extract actual order number (remove BBB- prefix)
        const actualOrderNumber = order.orderNumber.replace('BBB-', '')
        console.log(`📋 Actual Order Number: ${actualOrderNumber}`)

        // Update order status via Ticimax SOAP (pass both ID and order number)
        await bolbolbulClient.updateOrderStatus(
          order.platformOrderId,
          parseInt(platformStatus),
          actualOrderNumber
        )

        console.log(`✅ Ticimax durumu başarıyla güncellendi`)
        platformUpdateSuccess = true
      } catch (error: any) {
        console.error('\n❌ Ticimax API Hatası:', error.message)
        console.error('Error Stack:', error.stack)
        platformError = error.message
      }
    }

    // Trendyol Status Update
    if (order.platform === Platform.TRENDYOL && platformStatus) {
      try {
        console.log(`🔄 Trendyol API çağrısı yapılıyor...`)
        console.log(`📦 Order Number: ${order.orderNumber}`)
        console.log(`📝 Yeni Durum: ${platformStatus}`)

        const trendyolClient = getTrendyolClient()

        // OrderNumber'dan gerçek sipariş numarasını al (TY- prefix'ini kaldır)
        const actualOrderNumber = order.orderNumber.replace('TY-', '')

        // Önce Trendyol'dan siparişi çek ve shipmentPackageId'yi bul
        console.log(`🔍 Trendyol'dan sipariş detayları alınıyor: ${actualOrderNumber}`)
        const trendyolOrder = await trendyolClient.getOrderByNumber(actualOrderNumber)

        // Mevcut durumu kontrol et - geriye döndürme işlemi yapılamaz
        const currentStatus = trendyolOrder.shipmentPackageStatus || trendyolOrder.status
        console.log(`📊 Trendyol'daki mevcut durum: ${currentStatus}`)

        // Durum geçiş haritası (sadece ileriye doğru)
        const statusOrder = ['Created', 'Picking', 'Invoiced', 'Shipped', 'Delivered']
        const currentIndex = statusOrder.indexOf(currentStatus)
        const targetIndex = statusOrder.indexOf(platformStatus)

        if (currentIndex >= targetIndex && currentIndex !== -1) {
          platformError = `Sipariş zaten "${currentStatus}" durumunda. "${platformStatus}" durumuna geri döndürülemez.`
          console.warn(`⚠️ ${platformError}`)
        } else {
          // shipmentPackageId'yi kullan (varsa id, yoksa orderId)
          const shipmentPackageId = trendyolOrder.id || trendyolOrder.orderId
          console.log(`📦 Shipment Package ID: ${shipmentPackageId}`)

          // Order lines'dan lineId ve quantity bilgisini çıkar
          const lines = trendyolOrder.lines.map((line: any) => ({
            lineId: line.lineId || line.id,
            quantity: line.quantity
          }))
          console.log(`📋 Lines:`, lines)

          // Şimdi paket durumunu güncelle
          await trendyolClient.updatePackageStatus(
            String(shipmentPackageId),
            platformStatus as 'Picking' | 'Invoiced',
            lines
          )

          console.log(`✅ Trendyol durumu başarıyla güncellendi`)
        }
      } catch (error: any) {
        console.error('❌ Trendyol API Hatası:')
        console.error('Hata Mesajı:', error.message)

        if (error.response) {
          console.error('Response Status:', error.response.status)
          console.error('Response Data:', error.response.data)
        }

        platformError = error.message
      }
    }

    // Only update database if platform update was successful (for N11 and Bolbolbul)
    // For other platforms, update database anyway
    const shouldUpdateDB =
      (order.platform !== Platform.N11 && order.platform !== Platform.BOLBOLBUL) ||
      platformUpdateSuccess ||
      !platformError

    if (!shouldUpdateDB) {
      console.log(`\n❌ Platform update başarısız - Veritabanı güncellenmedi`)

      return NextResponse.json({
        success: false,
        error: platformError || 'Platform güncelleme başarısız',
        message: `N11'e yansıtılamadığı için veritabanı güncellenmedi: ${platformError}`,
        platformSync: false
      }, { status: 400 })
    }

    // Update status in database
    console.log(`\n💾 Veritabanı güncelleniyor...`)
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: status.toUpperCase() as OrderStatus },
      include: { items: true }
    })
    console.log(`✅ Veritabanı güncellendi: ${updatedOrder.status}`)

    const platformName = order.platform === Platform.N11 ? 'N11' : 'Trendyol'

    const response = {
      success: true,
      message: 'Sipariş durumu başarıyla güncellendi',
      data: updatedOrder,
      warning: platformError,
      platformSync: platformUpdateSuccess || !platformError
    }

    console.log(`\n🔵 ====== RESPONSE ======`)
    console.log(`✅ Success: ${response.success}`)
    console.log(`📝 Message: ${response.message}`)
    console.log(`⚠️  Warning: ${response.warning || 'None'}`)
    console.log(`🔄 Platform Sync: ${response.platformSync}`)
    console.log(`🔵 =====================\n`)

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Update order status error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to update order status'
      },
      { status: 500 }
    )
  }
}

/**
 * Map internal status to platform-specific status
 */
function mapToPlatformStatus(internalStatus: string, platform: Platform): string | null {
  const statusUpper = internalStatus.toUpperCase()

  if (platform === Platform.TRENDYOL) {
    const trendyolStatusMap: Record<string, string> = {
      'PENDING': 'Created',
      'PROCESSING': 'Picking',
      'READY_TO_SHIP': 'Invoiced',
      'SHIPPED': 'Shipped',
      'DELIVERED': 'Delivered',
      'CANCELLED': 'Cancelled'
    }
    return trendyolStatusMap[statusUpper] || null
  }

  if (platform === Platform.N11) {
    const n11StatusMap: Record<string, string> = {
      'PENDING': '1',        // Onay Bekleyen
      'APPROVED': '2',       // Onaylandı
      'PROCESSING': '3',     // Hazırlanıyor
      'SHIPPED': '4',        // Kargoya Verildi
      'DELIVERED': '8',      // Teslim Edildi
      'CANCELLED': '11'      // İptal
    }
    return n11StatusMap[statusUpper] || null
  }

  if (platform === Platform.BOLBOLBUL) {
    const bolbolbulStatusMap: Record<string, string> = {
      'PENDING': '1',        // Onay bekliyor
      'PROCESSING': '4',     // Paketleniyor
      'READY_TO_SHIP': '4',  // Paketleniyor
      'SHIPPED': '6',        // Kargoya verildi
      'DELIVERED': '7',      // Teslim edildi
      'CANCELLED': '8'       // İptal edildi
    }
    return bolbolbulStatusMap[statusUpper] || null
  }

  // Add mappings for other platforms (Hepsiburada) here
  return null
}
