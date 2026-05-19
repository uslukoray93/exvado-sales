import { NextRequest, NextResponse } from 'next/server'
import { getN11RestClient } from '@/lib/api/n11-rest'
import { prisma } from '@/lib/prisma'
import { Platform, OrderStatus } from '@prisma/client'

/**
 * GET /api/orders/n11
 * Fetch and sync orders from N11
 */
export async function GET(request: NextRequest) {
  try {
    const n11Client = getN11RestClient()

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const syncAll = searchParams.get('syncAll') === 'true'
    const page = parseInt(searchParams.get('page') || '0')
    const pageSize = parseInt(searchParams.get('pageSize') || '100')

    // AKILLI SYNC: Son sync tarihini bul
    const lastSyncedOrder = await prisma.order.findFirst({
      where: { platform: Platform.N11 },
      orderBy: { updatedAt: 'desc' },
      select: { updatedAt: true }
    })

    // Son sync tarihinden itibaren çek (yoksa son 7 gün)
    const syncStartDate = lastSyncedOrder
      ? new Date(lastSyncedOrder.updatedAt.getTime() - (1 * 24 * 60 * 60 * 1000)) // 1 gün öncesinden başla (güvenlik için)
      : new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)) // İlk sync: son 7 gün

    const endDate = new Date() // Şu an

    console.log(`🔄 N11 AKILLI SYNC (REST API): ${syncStartDate.toISOString()} - ${endDate.toISOString()}`)

    // Sync orders to database
    const syncedOrders = []
    let totalOrders = 0

    if (syncAll) {
      // N11 date range limit: Maximum 30 days per request
      // Strategy: Split into 30-day chunks - SON 4 AY

      const now = Date.now()
      const fourMonthsAgo = now - (120 * 24 * 60 * 60 * 1000) // 4 ay = 120 gün
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000

      console.log('Starting N11 full sync for last 4 months...')

      // Create 30-day chunks from 4 months ago to now
      const dateRanges = []
      let currentStart = fourMonthsAgo

      while (currentStart < now) {
        const currentEnd = Math.min(currentStart + thirtyDaysMs, now)
        dateRanges.push({ start: currentStart, end: currentEnd })
        currentStart = currentEnd
      }

      console.log(`Will query ${dateRanges.length} date ranges (30-day chunks)`)

      // Fetch orders for each date range
      for (let i = 0; i < dateRanges.length; i++) {
        const range = dateRanges[i]
        console.log(`\nQuerying range ${i + 1}/${dateRanges.length}: ${new Date(range.start).toISOString()} to ${new Date(range.end).toISOString()}`)

        // Fetch all pages for this date range
        let currentPage = 0
        let hasMorePages = true

        while (hasMorePages) {
          const response = await n11Client.getOrders({
            page: currentPage,
            size: pageSize,
            startDate: range.start,
            endDate: range.end,
            orderByDirection: 'DESC'
          })

          console.log(`  Page ${currentPage}: ${response.content?.length || 0} orders (total in range: ${response.totalElements || 0})`)

          for (const order of response.content || []) {
            // REST API returns full data
            console.log(`  📦 Processing order ${order.orderNumber}...`)

            try {
              const syncedOrder = await syncOrder(order)
              syncedOrders.push(syncedOrder)
            } catch (error: any) {
              if (error.message.includes('orderNumber')) {
                console.error(`  ⚠️  Sipariş atlandı (orderNumber yok): ${order.id}`)
                // Skip this order - don't add to syncedOrders
              } else {
                // Log ALL errors before re-throwing
                console.error(`  ❌ Sipariş sync hatası (${order.orderNumber || order.id}):`, error.message)
                console.error('  Full error:', error)
                throw error // Re-throw other errors
              }
            }
          }

          totalOrders = Math.max(totalOrders, syncedOrders.length)
          currentPage++

          // Check if there are more pages
          hasMorePages = currentPage < (response.totalPages || 0)
        }
      }

      console.log(`\nCompleted N11 sync: ${syncedOrders.length} total orders synced`)
    } else {
      // AKILLI SYNC: Sadece son sync'ten beri güncellenen siparişler
      const now = new Date()

      // REST API: startDate/endDate are timestamps in milliseconds (GMT+3)
      const n11Response = await n11Client.getOrders({
        page,
        size: pageSize,
        startDate: syncStartDate.getTime(),
        endDate: now.getTime(),
        orderByDirection: 'DESC'
      })
      totalOrders = n11Response.totalElements || 0

      console.log(`📊 ${n11Response.content?.length || 0} sipariş bulundu (son sync'ten beri)`)

      for (const order of n11Response.content || []) {
        // REST API returns full order data - no need for detail call
        console.log(`\n📦 Processing order ${order.orderNumber}...`)
        console.log(`🔍 REST API Order Object Keys:`, Object.keys(order))
        console.log(`🔍 REST API orderNumber value:`, order.orderNumber, `(type: ${typeof order.orderNumber})`)

        try {
          console.log(`🔍 BEFORE syncOrder call - order object:`, Object.keys(order), order.orderNumber)
          const syncedOrder = await syncOrder(order)
          syncedOrders.push(syncedOrder)
        } catch (error: any) {
          console.error(`❌ Sipariş sync hatası (${order.orderNumber || order.id}):`)
          console.error(`  - Error message: ${error.message}`)
          console.error(`  - Error name: ${error.name}`)
          console.error(`  - Full error:`, error)

          if (error.message.includes('orderNumber')) {
            console.error(`⚠️  Sipariş atlandı (orderNumber sorunu)`)
            // Skip this order - don't add to syncedOrders
          } else {
            throw error // Re-throw other errors
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${syncedOrders.length} orders from N11`,
      data: syncedOrders,
      pagination: {
        page,
        pageSize,
        total: totalOrders,
        synced: syncedOrders.length,
      },
    })
  } catch (error: any) {
    console.error('N11 sync error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to sync N11 orders',
      },
      { status: 500 }
    )
  }
}

/**
 * Fetch product images from Bolbolbul XML feed using stock codes
 */
async function fetchProductImages(order: any) {
  const images: Record<string, string> = {}

  try {
    // Import image fetcher dynamically
    const { getProductImagesByStockCodes } = await import('@/lib/image-fetcher')

    // Collect all stock codes from order items/lines (REST API uses 'lines')
    const stockCodes: string[] = []
    for (const line of order.lines || order.items || []) {
      const stockCode = line.stockCode || line.productSellerCode
      if (stockCode) {
        stockCodes.push(stockCode)
      }
    }

    if (stockCodes.length === 0) {
      return images
    }

    // Fetch images from XML
    const imageMap = await getProductImagesByStockCodes(stockCodes)

    // Map images to item IDs (REST API uses 'lines' instead of 'items')
    for (const line of order.lines || order.items || []) {
      const stockCode = line.stockCode || line.productSellerCode
      if (stockCode) {
        const imageUrl = imageMap.get(stockCode)
        if (imageUrl) {
          images[String(line.orderLineId || line.id)] = imageUrl
          console.log(`✅ Found image for ${line.productName}: ${imageUrl}`)
        }
      }
    }

  } catch (error: any) {
    console.error('❌ Failed to fetch images from XML:', error.message)
  }

  return images
}

/**
 * Sync a single order to database
 */
async function syncOrder(order: any) {
  // Parse N11 date format (DD/MM/YYYY HH:mm) - ÖNCE TANIMLA!
  const parseN11Date = (dateStr: string): Date => {
    if (!dateStr) return new Date()
    try {
      const parts = dateStr.split(' ')
      const [day, month, year] = parts[0].split('/')
      const [hour, minute] = (parts[1] || '00:00').split(':')
      return new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hour || '0'),
        parseInt(minute || '0')
      )
    } catch {
      return new Date()
    }
  }

  // Use shipment package ID as platformOrderId (needed for status updates)
  // KRİTİK: orderNumber OLMADAN sipariş oluşturma - duplicate riski!
  console.log(`🔍 DEBUG - orderNumber kontrolü ÖNCE:`)
  console.log(`  - orderNumber: ${order.orderNumber}`)
  console.log(`  - hasOrderNumber: ${!!order.orderNumber}`)
  console.log(`  - orderId: ${order.id}`)
  console.log(`  - typeof order: ${typeof order}`)
  console.log(`  - order constructor: ${order?.constructor?.name}`)
  console.log(`  - Object.keys length: ${Object.keys(order || {}).length}`)

  if (!order.orderNumber) {
    console.error(`❌ UYARI: Sipariş orderNumber field'ı yok! order.id: ${order.id}`)
    console.error(`Bu sipariş SKIP ediliyor - duplicate riski var!`)
    console.error(`Order object keys:`, Object.keys(order))
    throw new Error(`Order missing orderNumber field (id: ${order.id})`)
  }

  // orderNumber = real order number for display
  const platformOrderId = String(order.id) // Paket/Shipment ID
  const realOrderNumber = order.orderNumber // Gerçek sipariş numarası (artık fallback YOK!)

  // DUPLICATE ÖNLEME: orderNumber ile kontrol et
  const existingOrder = await prisma.order.findUnique({
    where: { orderNumber: `N11-${realOrderNumber}` },
    include: { items: true }
  })

  // Map N11 status to our internal status (REST API uses shipmentPackageStatus)
  const rawStatus = order.shipmentPackageStatus || order.status
  console.log(`🔍 N11 RAW Status for order ${order.orderNumber}: "${rawStatus}" (type: ${typeof rawStatus})`)
  let mappedStatus = mapN11Status(rawStatus)
  console.log(`✅ Mapped to: ${mappedStatus}`)

  // DEBUG: Log customer name source (REST API format)
  console.log(`👤 Customer Name Debug:`)
  console.log(`  - customerfullName: ${order.customerfullName || 'N/A'}`)
  console.log(`  - shippingAddress.fullName: ${order.shippingAddress?.fullName || 'N/A'}`)
  console.log(`  - billingAddress.fullName: ${order.billingAddress?.fullName || 'N/A'}`)

  // Get cargo company (REST API has cargoProviderName directly)
  const cargoCompany = mapN11CargoCompanyName(order.cargoProviderName)

  // AUTO-COMPLETE: 7+ günlük SHIPPED siparişleri otomatik DELIVERED yap
  // (N11 API bazen teslim edilen siparişleri güncellemez)
  if (mappedStatus === OrderStatus.SHIPPED) {
    // REST API uses lastModifiedDate (timestamp)
    const orderDate = new Date(order.lastModifiedDate)
    const daysSinceOrder = Math.floor((Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24))

    if (daysSinceOrder >= 7) {
      console.log(`📦 Sipariş ${daysSinceOrder} gün önce kargoya verildi, otomatik DELIVERED yapılıyor`)
      mappedStatus = OrderStatus.SHIPPED
    }
  }

  // N11'de fatura kontrolü: Status 8, 9, 10 (Delivered) = Faturalı
  // REST API'de shipmentPackageStatus string: "Delivered"
  const n11StatusStr = String(order.shipmentPackageStatus || order.status)
  const isInvoiced = n11StatusStr === 'Delivered' || ['8', '9', '10'].includes(n11StatusStr)

  // 7+ günlük DELIVERED siparişler otomatik COMPLETED olur (N11 otomatik faturalıyor)
  const orderDate = new Date(order.lastModifiedDate)
  const daysSinceOrder = Math.floor((Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24))
  const autoCompleted = mappedStatus === OrderStatus.DELIVERED && daysSinceOrder >= 7

  const finalStatus = (isInvoiced || autoCompleted) ? OrderStatus.COMPLETED : mappedStatus
  const finalInvoiceStatus = isInvoiced || autoCompleted

  // Fetch product images ONLY if this is a new order or existing order has missing images
  let productImages: Record<string, string> = {}

  if (!existingOrder) {
    // New order - fetch all images
    console.log(`🔍 NEW order ${order.orderNumber} - Fetching images...`)
    try {
      productImages = await fetchProductImages(order)
      console.log(`📸 Found ${Object.keys(productImages).length} images for NEW order ${order.orderNumber}`)
    } catch (error: any) {
      console.error(`❌ Failed to fetch images for NEW order ${order.orderNumber}:`, error.message)
      // Continue without images - will be fixed later by emergency script
    }
  } else {
    // Existing order - only fetch if there are missing images
    const missingImageCount = existingOrder.items.filter(item => !item.imageUrl || item.imageUrl === '').length

    if (missingImageCount > 0) {
      console.log(`🔍 EXISTING order ${order.orderNumber} - ${missingImageCount} missing images, fetching...`)
      try {
        productImages = await fetchProductImages(order)
        console.log(`📸 Found ${Object.keys(productImages).length} images for EXISTING order ${order.orderNumber}`)
      } catch (error: any) {
        console.error(`❌ Failed to fetch images for EXISTING order ${order.orderNumber}:`, error.message)
        // Continue - emergency script will fix it
      }
    } else {
      console.log(`✅ EXISTING order ${order.orderNumber} - All images present, skipping fetch`)
    }
  }

  // UPSERT: orderNumber ile unique kontrolü (duplicate önleme)
  const dbOrder = await prisma.order.upsert({
    where: {
      orderNumber: `N11-${realOrderNumber}`, // orderNumber ile unique kontrolü
    },
    update: {
      platformOrderId: platformOrderId, // Update edilebilir (bazen değişiyor)
      status: finalStatus,
      customerName: order.customerfullName || order.shippingAddress?.fullName || 'Müşteri (N11 Gizli)',
      customerPhone: order.shippingAddress?.gsm || 'Belirtilmemiş',
      customerAddress: `${order.shippingAddress?.address || ''}, ${order.shippingAddress?.neighborhood || ''}, ${order.shippingAddress?.district || ''}, ${order.shippingAddress?.city || ''}`.trim() || 'Unknown',
      trackingNumber: order.cargoTrackingNumber || undefined,
      cargoCompany: cargoCompany,
      commissionRate: 15, // N11 default commission
      invoiceUploaded: finalInvoiceStatus,
      // KRİTİK: Items'e DOKUNMA - Görseller kaybolmasın!
      // Items sadece post-update hook ile güncellenecek (satır 308+)
    },
    create: {
      orderNumber: `N11-${realOrderNumber}`,
      platform: Platform.N11,
      platformOrderId: platformOrderId,
      customerName: order.customerfullName || order.shippingAddress?.fullName || 'Müşteri (N11 Gizli)',
      customerPhone: order.shippingAddress?.gsm || 'Belirtilmemiş',
      customerAddress: `${order.shippingAddress?.address || ''}, ${order.shippingAddress?.neighborhood || ''}, ${order.shippingAddress?.district || ''}, ${order.shippingAddress?.city || ''}`.trim() || 'Unknown',
      status: finalStatus,
      invoiceUploaded: finalInvoiceStatus,
      orderDate: new Date(order.lastModifiedDate),
      trackingNumber: order.cargoTrackingNumber || undefined,
      cargoCompany: cargoCompany,
      commissionRate: 15, // N11 default commission
      shippingCost: 0, // Will be updated later
      items: {
        create: (order.lines || []).map((line: any) => {
          const imageUrl = productImages[String(line.orderLineId)]
          // ONLY set imageUrl if we actually have one - don't set null!
          const itemData: any = {
            productName: line.productName,
            stockCode: line.stockCode || null,
            sku: String(line.orderLineId),
            quantity: line.quantity,
            purchasePrice: 0, // Will be updated manually
            salePrice: line.price,
          }
          if (imageUrl) {
            itemData.imageUrl = imageUrl
          }
          return itemData
        }),
      },
    },
    include: {
      items: true,
    },
  })

  // KESİN ÇÖZÜM: MEVCUT SİPARİŞLERDE görselleri koru ve eksikleri doldur
  if (existingOrder) {
    // Mevcut items'ları al (upsert sonrası güncel hali)
    const currentItems = await prisma.orderItem.findMany({
      where: { orderId: dbOrder.id }
    })

    for (const dbItem of currentItems) {
      // Eğer item'da zaten görsel varsa, DOKUNMA!
      if (dbItem.imageUrl && dbItem.imageUrl !== '') {
        console.log(`✅ KORUNDU: ${dbItem.productName} - Görsel zaten var`)
        continue
      }

      // Görsel yoksa, XML'den çekmeye çalış
      const newItem = order.lines.find((i: any) => String(i.orderLineId) === dbItem.sku)
      if (!newItem) continue

      const imageUrl = productImages[String(newItem.orderLineId)]

      if (imageUrl) {
        // Görsel bulundu, ekle
        await prisma.orderItem.update({
          where: { id: dbItem.id },
          data: { imageUrl },
        })
        console.log(`✅ EKLENDİ: ${dbItem.productName} - ${imageUrl}`)
      } else {
        // Görsel bulunamadı, warning ver
        console.log(`⚠️  EKSİK: ${dbItem.productName} (${dbItem.stockCode}) - XML'de bulunamadı`)
      }
    }
  }

  return dbOrder
}

/**
 * Map N11 order status to internal status
 * N11 uses numeric status codes:
 * 0,1 = Yeni (Pending)
 * 2 = Onaylandı (Approved)
 * 3 = Hazırlanıyor (Processing)
 * 4 = Kargoya Hazır (Ready to Ship)
 * 5 = Kargoya Verildi (Shipped)
 * 8,9,10 = Tamamlandı (Delivered)
 * 11,12 = İptal (Cancelled)
 */
function mapN11Status(n11Status: string | number): OrderStatus {
  // Convert to string if number
  const status = String(n11Status)

  // Numeric status codes
  const numericMap: Record<string, OrderStatus> = {
    '0': OrderStatus.PENDING,
    '1': OrderStatus.PENDING,
    '2': OrderStatus.APPROVED,
    '3': OrderStatus.PROCESSING,
    '4': OrderStatus.READY_TO_SHIP,
    '5': OrderStatus.SHIPPED,
    '8': OrderStatus.DELIVERED,
    '9': OrderStatus.DELIVERED,
    '10': OrderStatus.DELIVERED,
    '11': OrderStatus.CANCELLED,
    '12': OrderStatus.CANCELLED,
  }

  // Text status codes (fallback + REST API format)
  const textMap: Record<string, OrderStatus> = {
    // REST API statuses
    'Created': OrderStatus.PENDING,  // Yeni sipariş - Onay bekliyor
    'Picking': OrderStatus.PROCESSING,
    'Shipped': OrderStatus.SHIPPED,
    'Cancelled': OrderStatus.CANCELLED,
    'Delivered': OrderStatus.DELIVERED,
    'UnPacked': OrderStatus.CANCELLED,
    'UnSupplied': OrderStatus.CANCELLED,
    // Turkish statuses
    'Yeni': OrderStatus.PENDING,
    'Onaylandı': OrderStatus.APPROVED,
    'Onaylandi': OrderStatus.APPROVED,
    'Hazırlanıyor': OrderStatus.PROCESSING,
    'Hazirlaniyor': OrderStatus.PROCESSING,
    'Kargoya Verildi': OrderStatus.SHIPPED,
    'Kargoda': OrderStatus.SHIPPED,
    'Tamamlandı': OrderStatus.DELIVERED,
    'Tamamlandi': OrderStatus.DELIVERED,
    'İptal': OrderStatus.CANCELLED,
    'Iptal': OrderStatus.CANCELLED,
  }

  return numericMap[status] || textMap[status] || OrderStatus.PENDING
}

/**
 * Map N11 cargo company name to internal slug
 */
function mapN11CargoCompany(n11CargoName: string | null | undefined): string {
  if (!n11CargoName) return 'aras-kargo' // default

  const cargoName = n11CargoName.toLowerCase()

  // Mapping from N11 cargo names to our internal slugs
  if (cargoName.includes('yurtiçi') || cargoName.includes('yurtici')) return 'yurtici-kargo'
  if (cargoName.includes('sürat') || cargoName.includes('surat')) return 'surat-kargo'
  if (cargoName.includes('dhl')) return 'dhl-ecommerce'
  if (cargoName.includes('ptt')) return 'ptt-kargo'
  if (cargoName.includes('kolay gelsin')) return 'kolay-gelsin'
  if (cargoName.includes('horoz')) return 'horoz-kargo'
  if (cargoName.includes('ceva')) return 'ceva-lojistik'
  if (cargoName.includes('aras')) return 'aras-kargo'
  if (cargoName.includes('mng')) return 'mng-kargo'
  if (cargoName.includes('ups')) return 'ups-kargo'

  // Default to aras-kargo if not recognized
  console.log(`⚠️ Unrecognized N11 cargo company: ${n11CargoName}, defaulting to aras-kargo`)
  return 'aras-kargo'
}

// Alias for REST API (cargoProviderName)
const mapN11CargoCompanyName = mapN11CargoCompany
