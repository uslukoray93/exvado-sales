import { NextRequest, NextResponse } from 'next/server'
import { getN11Client } from '@/lib/api/n11'
import { prisma } from '@/lib/prisma'
import { Platform, OrderStatus } from '@prisma/client'

/**
 * GET /api/orders/n11
 * Fetch and sync orders from N11
 */
export async function GET(request: NextRequest) {
  try {
    const n11Client = getN11Client()

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

    console.log(`🔄 N11 AKILLI SYNC: ${syncStartDate.toISOString()} tarihinden itibaren güncellemeler çekiliyor...`)

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
            pageSize,
            startDate: new Date(range.start).toISOString(),
            endDate: new Date(range.end).toISOString()
          })

          console.log(`  Page ${currentPage}: ${response.orders.length} orders (total in range: ${response.totalCount})`)

          for (const order of response.orders) {
            // Fetch full order details for each order
            console.log(`  📦 Fetching details for order ${order.orderNumber}...`)
            const fullOrderDetail = await n11Client.getOrderDetail(String(order.id))

            // KRİTİK: orderNumber yoksa, liste response'ından al (duplicate önleme)
            if (!fullOrderDetail.orderNumber && order.orderNumber) {
              console.log(`  ⚠️  Order detail'de orderNumber yok, liste response'ından ekleniyor: ${order.orderNumber}`)
              fullOrderDetail.orderNumber = order.orderNumber
            }

            try {
              const syncedOrder = await syncOrder(fullOrderDetail)
              syncedOrders.push(syncedOrder)
            } catch (error: any) {
              if (error.message.includes('orderNumber')) {
                console.error(`  ⚠️  Sipariş atlandı (orderNumber yok): ${order.id}`)
                // Skip this order - don't add to syncedOrders
              } else {
                throw error // Re-throw other errors
              }
            }
          }

          totalOrders = Math.max(totalOrders, syncedOrders.length)
          currentPage++

          // Check if there are more pages
          hasMorePages = currentPage * pageSize < response.totalCount
        }
      }

      console.log(`\nCompleted N11 sync: ${syncedOrders.length} total orders synced`)
    } else {
      // AKILLI SYNC: Sadece son sync'ten beri güncellenen siparişler
      const now = new Date()

      const n11Orders = await n11Client.getOrders({
        page,
        pageSize,
        startDate: syncStartDate.toISOString(),
        endDate: now.toISOString()
      })
      totalOrders = n11Orders.totalCount

      console.log(`📊 ${n11Orders.orders.length} sipariş bulundu (son sync'ten beri)`)

      for (const order of n11Orders.orders) {
        // Fetch full order details for each order
        console.log(`\n📦 Fetching details for order...`)
        console.log(`  - List Response orderNumber: ${order.orderNumber || 'MISSING'}`)
        console.log(`  - List Response id: ${order.id}`)

        const fullOrderDetail = await n11Client.getOrderDetail(String(order.id))
        console.log(`  - Detail Response orderNumber: ${fullOrderDetail.orderNumber || 'MISSING'}`)

        // KRİTİK: orderNumber yoksa, liste response'ından al (duplicate önleme)
        if (!fullOrderDetail.orderNumber && order.orderNumber) {
          console.log(`⚠️  Order detail'de orderNumber yok, liste response'ından ekleniyor: ${order.orderNumber}`)
          fullOrderDetail.orderNumber = order.orderNumber
        } else if (!fullOrderDetail.orderNumber && !order.orderNumber) {
          console.error(`❌ CRITICAL: Hem liste hem detail'de orderNumber YOK! order.id: ${order.id}`)
        }

        try {
          const syncedOrder = await syncOrder(fullOrderDetail)
          syncedOrders.push(syncedOrder)
        } catch (error: any) {
          if (error.message.includes('orderNumber')) {
            console.error(`⚠️  Sipariş atlandı (orderNumber yok): ${order.id}`)
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

    // Collect all stock codes from order items
    const stockCodes: string[] = []
    for (const item of order.items || []) {
      if (item.productSellerCode) {
        stockCodes.push(item.productSellerCode)
      }
    }

    if (stockCodes.length === 0) {
      return images
    }

    // Fetch images from XML
    const imageMap = await getProductImagesByStockCodes(stockCodes)

    // Map images to item IDs (we use item ID as SKU in N11)
    for (const item of order.items || []) {
      const stockCode = item.productSellerCode
      if (stockCode) {
        const imageUrl = imageMap.get(stockCode)
        if (imageUrl) {
          images[String(item.id)] = imageUrl
          console.log(`✅ Found image for ${item.productName}: ${imageUrl}`)
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
  if (!order.orderNumber) {
    console.error(`❌ UYARI: Sipariş orderNumber field'ı yok! order.id: ${order.id}`)
    console.error(`Bu sipariş SKIP ediliyor - duplicate riski var!`)
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

  // Map N11 status to our internal status
  console.log(`🔍 N11 RAW Status for order ${order.orderNumber}: "${order.status}" (type: ${typeof order.status})`)
  let mappedStatus = mapN11Status(order.status)
  console.log(`✅ Mapped to: ${mappedStatus}`)

  // DEBUG: Log customer name source
  console.log(`👤 Customer Name Debug:`)
  console.log(`  - buyer.fullName: ${order.buyer?.fullName || 'N/A'}`)
  console.log(`  - shippingAddress.fullName: ${order.shippingAddress?.fullName || 'N/A'}`)
  console.log(`  - billingAddress.fullName: ${order.billingAddress?.fullName || 'N/A'}`)

  // Get cargo company from shipmentInfo
  const cargoCompany = mapN11CargoCompany(order.shipmentInfo?.shipmentCompany)

  // KRİTİK FİX: Eğer tracking number varsa ama status APPROVED/PROCESSING ise, otomatik SHIPPED yap
  const hasTrackingNumber = order.shipmentInfo?.trackingNumber && order.shipmentInfo.trackingNumber.trim() !== ''
  if (hasTrackingNumber && (mappedStatus === OrderStatus.APPROVED || mappedStatus === OrderStatus.PROCESSING)) {
    console.log(`🚚 Tracking number var (${order.shipmentInfo.trackingNumber}), status SHIPPED'e çevriliyor`)
    mappedStatus = OrderStatus.SHIPPED
  }

  // AUTO-COMPLETE: 7+ günlük SHIPPED siparişleri otomatik DELIVERED yap
  // (N11 API bazen teslim edilen siparişleri güncellemez)
  if (mappedStatus === OrderStatus.SHIPPED) {
    const orderDate = parseN11Date(order.createDate)
    const daysSinceOrder = Math.floor((Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24))

    if (daysSinceOrder >= 7) {
      console.log(`📦 Sipariş ${daysSinceOrder} gün önce kargoya verildi, otomatik DELIVERED yapılıyor`)
      mappedStatus = OrderStatus.DELIVERED
    }
  }

  // N11'de fatura kontrolü: Status 8, 9, 10 (Delivered) = Faturalı
  // N11 API'sinde direkt invoice field yok, status ile belirliyoruz
  const n11StatusNum = String(order.status)
  const isInvoiced = ['8', '9', '10'].includes(n11StatusNum)

  // 7+ günlük DELIVERED siparişler otomatik COMPLETED olur (N11 otomatik faturalıyor)
  const orderDate = parseN11Date(order.createDate)
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
      customerName: (order as any).customerfullName || order.buyer?.fullName || order.shippingAddress?.fullName || 'Müşteri (N11 Gizli)',
      customerPhone: order.buyer?.phone || 'Belirtilmemiş',
      customerAddress: `${order.shippingAddress?.address || ''}, ${order.shippingAddress?.district || ''}, ${order.shippingAddress?.city || ''}`.trim() || 'Unknown',
      trackingNumber: order.shipmentInfo?.trackingNumber || undefined,
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
      customerName: (order as any).customerfullName || order.buyer?.fullName || order.shippingAddress?.fullName || 'Müşteri (N11 Gizli)',
      customerPhone: order.buyer?.phone || 'Belirtilmemiş',
      customerAddress: `${order.shippingAddress?.address || ''}, ${order.shippingAddress?.district || ''}, ${order.shippingAddress?.city || ''}`.trim() || 'Unknown',
      status: finalStatus,
      invoiceUploaded: finalInvoiceStatus,
      orderDate: parseN11Date(order.createDate),
      trackingNumber: order.shipmentInfo?.trackingNumber || undefined,
      cargoCompany: cargoCompany,
      commissionRate: 15, // N11 default commission
      shippingCost: 0, // Will be updated later
      items: {
        create: order.items.map((item: any) => {
          const imageUrl = productImages[String(item.id)]
          // ONLY set imageUrl if we actually have one - don't set null!
          const itemData: any = {
            productName: item.productName,
            stockCode: item.productSellerCode || null,
            sku: String(item.id),
            quantity: item.quantity,
            purchasePrice: 0, // Will be updated manually
            salePrice: item.price,
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
      const newItem = order.items.find((i: any) => String(i.id) === dbItem.sku)
      if (!newItem) continue

      const imageUrl = productImages[String(newItem.id)]

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

  // Text status codes (fallback)
  const textMap: Record<string, OrderStatus> = {
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
