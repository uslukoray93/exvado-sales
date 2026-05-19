import { NextRequest, NextResponse } from 'next/server'
import { getTrendyolClient } from '@/lib/api/trendyol'
import { prisma } from '@/lib/prisma'
import { Platform, OrderStatus } from '@prisma/client'

/**
 * GET /api/orders/trendyol
 * Fetch and sync orders from Trendyol
 */
export async function GET(request: NextRequest) {
  try {
    const trendyolClient = getTrendyolClient()

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const syncAll = searchParams.get('syncAll') === 'true'
    const page = parseInt(searchParams.get('page') || '0')
    const size = parseInt(searchParams.get('size') || '50')

    // Sync orders to database
    const syncedOrders = []
    let totalOrders = 0

    if (syncAll) {
      // Trendyol API limits:
      // - Without dates: Returns last 7 days only
      // - With dates: Maximum 2 week range, can query up to 3 months back
      // Strategy: Split 3 months into 2-week chunks

      const now = Date.now()
      const fiveYearsAgo = now - (1825 * 24 * 60 * 60 * 1000) // 1825 days (5 years)
      const twoWeeksMs = 14 * 24 * 60 * 60 * 1000

      console.log('Starting full sync for last 5 years...')

      // Create 2-week chunks from 5 years ago to now
      const dateRanges = []
      let currentStart = fiveYearsAgo

      while (currentStart < now) {
        const currentEnd = Math.min(currentStart + twoWeeksMs, now)
        dateRanges.push({ start: currentStart, end: currentEnd })
        currentStart = currentEnd
      }

      console.log(`Will query ${dateRanges.length} date ranges (2-week chunks)`)

      // Fetch orders for each date range
      for (let i = 0; i < dateRanges.length; i++) {
        const range = dateRanges[i]
        console.log(`\nQuerying range ${i + 1}/${dateRanges.length}: ${new Date(range.start).toISOString()} to ${new Date(range.end).toISOString()}`)

        // Fetch all pages for this date range
        let currentPage = 0
        let hasMorePages = true

        while (hasMorePages) {
          const response = await trendyolClient.getOrders({
            page: currentPage,
            size,
            startDate: range.start,
            endDate: range.end
          })

          console.log(`  Page ${currentPage}: ${response.content.length} orders (total in range: ${response.totalElements})`)

          for (const order of response.content) {
            // Debug: Log order status from Trendyol API
            console.log(`📦 Order ${order.orderNumber}: status="${order.status}"`)
            const syncedOrder = await syncOrder(order, trendyolClient)
            syncedOrders.push(syncedOrder)
          }

          totalOrders = Math.max(totalOrders, syncedOrders.length)
          currentPage++

          // Check if there are more pages
          hasMorePages = currentPage * size < response.totalElements
        }
      }

      console.log(`\nCompleted sync: ${syncedOrders.length} total orders synced`)
    } else {
      // Fetch single page (default: last 7 days)
      const trendyolOrders = await trendyolClient.getOrders({ page, size })
      totalOrders = trendyolOrders.totalElements

      for (const order of trendyolOrders.content) {
        // Log first order to see product image field
        if (syncedOrders.length === 0) {
          console.log('🔍 Sample Trendyol Order Data:', JSON.stringify(order, null, 2))
        }
        const syncedOrder = await syncOrder(order, trendyolClient)
        syncedOrders.push(syncedOrder)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${syncedOrders.length} orders from Trendyol`,
      data: syncedOrders,
      pagination: {
        page,
        size,
        total: totalOrders,
        synced: syncedOrders.length,
      },
    })
  } catch (error: any) {
    console.error('Trendyol sync error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to sync Trendyol orders',
      },
      { status: 500 }
    )
  }
}

/**
 * Fetch product images from Bolbolbul XML feed using stock codes
 */
async function fetchProductImages(order: any, trendyolClient?: any) {
  const images: Record<string, string> = {}

  try {
    // Import image fetcher dynamically
    const { getProductImagesByStockCodes } = await import('@/lib/image-fetcher')

    // Collect all stock codes from order lines
    const stockCodes: string[] = []
    for (const line of order.lines || []) {
      if (line.merchantSku || line.stockCode) {
        stockCodes.push(line.merchantSku || line.stockCode)
      }
    }

    if (stockCodes.length === 0) {
      return images
    }

    // Fetch images from XML
    const imageMap = await getProductImagesByStockCodes(stockCodes)

    // Map images to barcodes
    for (const line of order.lines || []) {
      const stockCode = line.merchantSku || line.stockCode
      if (stockCode) {
        const imageUrl = imageMap.get(stockCode)
        if (imageUrl) {
          images[line.barcode] = imageUrl
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
async function syncOrder(order: any, trendyolClient?: any) {
  // Map Trendyol status to our internal status
  const mappedStatus = mapTrendyolStatus(order.status)

  // Use orderNumber as platformOrderId since orderId might be undefined
  const platformOrderId = String(order.orderId || order.orderNumber)

  // Check if order already exists
  const existingOrder = await prisma.order.findUnique({
    where: { platformOrderId: platformOrderId },
    select: { status: true }
  })

  // Her zaman Trendyol'dan gelen güncel status'ü kullan
  // Trendyol API'si her zaman doğru ve güncel bilgi sağlar
  const shouldUpdateStatus = true

  // Map Trendyol cargo provider name to our internal slug
  const cargoCompany = mapTrendyolCargoProvider(order.cargoProviderName)

  // Fetch product images if trendyolClient is provided
  const productImages = trendyolClient ? await fetchProductImages(order, trendyolClient) : {}

  // Check if invoice is uploaded (invoice link exists in API response)
  const hasInvoice = order.invoice !== null && order.invoice !== undefined
  const invoiceLink = order.invoiceLink || null
  const isInvoiced = hasInvoice || invoiceLink !== null

  // If invoice is uploaded, mark order as completed
  const finalStatus = isInvoiced ? OrderStatus.COMPLETED : mappedStatus

  const dbOrder = await prisma.order.upsert({
    where: {
      platformOrderId: platformOrderId,
    },
    update: {
      ...(shouldUpdateStatus && { status: finalStatus }),
      customerName: order.shipmentAddress?.fullName || `${order.customerFirstName || ''} ${order.customerLastName || ''}`.trim() || 'Unknown',
      customerPhone: order.shipmentAddress?.phone || 'Belirtilmemiş',
      customerAddress: order.shipmentAddress?.fullAddress || 'Unknown',
      trackingNumber: order.cargoTrackingNumber ? String(order.cargoTrackingNumber) : undefined,
      cargoCompany: cargoCompany,
      agreedDeliveryDate: order.agreedDeliveryDate ? new Date(order.agreedDeliveryDate) : undefined,
      commissionRate: 17, // Trendyol default commission
      invoiceUploaded: isInvoiced,
    },
    create: {
      orderNumber: `TY-${order.orderNumber}`,
      platform: Platform.TRENDYOL,
      platformOrderId: platformOrderId,
      customerName: order.shipmentAddress?.fullName || `${order.customerFirstName || ''} ${order.customerLastName || ''}`.trim() || 'Unknown',
      customerPhone: order.shipmentAddress?.phone || 'Belirtilmemiş',
      customerAddress: order.shipmentAddress?.fullAddress || 'Unknown',
      status: finalStatus,
      orderDate: new Date(order.orderDate),
      agreedDeliveryDate: order.agreedDeliveryDate ? new Date(order.agreedDeliveryDate) : undefined,
      trackingNumber: order.cargoTrackingNumber ? String(order.cargoTrackingNumber) : undefined,
      cargoCompany: cargoCompany,
      commissionRate: 17, // Trendyol default commission
      shippingCost: 0, // Will be updated later
      invoiceUploaded: isInvoiced,
      items: {
        create: order.lines.map((line: any) => ({
          productName: line.productName,
          stockCode: line.merchantSku || null,
          sku: line.barcode,
          quantity: line.quantity,
          purchasePrice: 0, // Will be updated manually
          salePrice: line.price,
          imageUrl: productImages[line.barcode] || null,
        })),
      },
    },
    include: {
      items: true,
    },
  })

  // Update existing items with image URLs if this is an update
  if (existingOrder && Object.keys(productImages).length > 0) {
    for (const item of dbOrder.items) {
      const imageUrl = productImages[item.sku]
      if (imageUrl && !item.imageUrl) {
        await prisma.orderItem.update({
          where: { id: item.id },
          data: { imageUrl },
        })
      }
    }
  }

  return dbOrder
}

/**
 * Map Trendyol order status to internal status
 */
function mapTrendyolStatus(trendyolStatus: string): OrderStatus {
  const statusMap: Record<string, OrderStatus> = {
    'Created': OrderStatus.PENDING,
    'Picking': OrderStatus.PROCESSING,
    'Invoiced': OrderStatus.READY_TO_SHIP,
    'Shipped': OrderStatus.SHIPPED,
    'Delivered': OrderStatus.DELIVERED,
    'UnDelivered': OrderStatus.SHIPPED,
    'Cancelled': OrderStatus.CANCELLED,
  }

  return statusMap[trendyolStatus] || OrderStatus.PENDING
}

/**
 * Map Trendyol cargo provider name to internal slug
 * Trendyol returns names like "DHL eCommerce Marketplace", "Sürat Kargo Marketplace"
 */
function mapTrendyolCargoProvider(trendyolCargoName: string | null | undefined): string {
  if (!trendyolCargoName) return 'aras-kargo' // default

  const cargoName = trendyolCargoName.toLowerCase()

  // Mapping from Trendyol cargo names to our internal slugs
  if (cargoName.includes('yurtiçi') || cargoName.includes('yurtici')) return 'yurtici-kargo'
  if (cargoName.includes('sürat') || cargoName.includes('surat')) return 'surat-kargo'
  if (cargoName.includes('dhl')) return 'dhl-ecommerce'
  if (cargoName.includes('ptt')) return 'ptt-kargo'
  if (cargoName.includes('kolay gelsin')) return 'kolay-gelsin'
  if (cargoName.includes('horoz')) return 'horoz-kargo'
  if (cargoName.includes('ceva')) return 'ceva-lojistik'
  if (cargoName.includes('aras')) return 'aras-kargo'
  if (cargoName.includes('trendyol express')) return 'trendyol-express'

  // Default to aras-kargo if not recognized
  console.log(`⚠️ Unrecognized Trendyol cargo provider: ${trendyolCargoName}, defaulting to aras-kargo`)
  return 'aras-kargo'
}
