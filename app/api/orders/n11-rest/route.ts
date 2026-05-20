import { NextRequest, NextResponse } from 'next/server'
import { getN11RestClient } from '@/lib/api/n11-rest'
import { prisma } from '@/lib/prisma'
import { Platform, OrderStatus } from '@prisma/client'
import { getProductImagesByStockCodes } from '@/lib/image-fetcher'

/**
 * GET /api/orders/n11-rest
 * Fetch and sync orders from N11 using REST API
 */
export async function GET(request: NextRequest) {
  try {
    const n11Client = getN11RestClient()

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const syncAll = searchParams.get('syncAll') === 'true'
    const days = parseInt(searchParams.get('days') || '90') // Default 90 days (3 months)
    const page = parseInt(searchParams.get('page') || '0')
    const pageSize = parseInt(searchParams.get('pageSize') || '100')

    // Sync orders to database
    const syncedOrders = []
    let totalOrders = 0

    if (syncAll) {
      // Fetch all 2026 orders (from Jan 1, 2026 to now)
      console.log('Starting N11 REST sync for all 2026 orders...')

      const now = Date.now()
      const startOf2026 = new Date('2026-01-01T00:00:00Z').getTime()
      const threeMonthsAgo = startOf2026  // Changed to start of 2026

      // N11 REST API can handle up to 1 month per request
      // Split into monthly chunks
      const monthlyChunks = []
      let currentStart = threeMonthsAgo

      while (currentStart < now) {
        const currentEnd = Math.min(currentStart + (30 * 24 * 60 * 60 * 1000), now)
        monthlyChunks.push({ start: currentStart, end: currentEnd })
        currentStart = currentEnd
      }

      console.log(`Will query ${monthlyChunks.length} monthly chunks`)

      // Fetch all status types
      const statuses: Array<'Created' | 'Picking' | 'Shipped' | 'Cancelled' | 'Delivered'> = [
        'Created',
        'Picking',
        'Shipped',
        'Cancelled',
        'Delivered'
      ]

      for (const chunk of monthlyChunks) {
        console.log(`\nQuerying ${new Date(chunk.start).toISOString()} to ${new Date(chunk.end).toISOString()}`)

        for (const status of statuses) {
          let currentPage = 0
          let hasMorePages = true

          while (hasMorePages) {
            const response = await n11Client.getOrders({
              page: currentPage,
              size: pageSize,
              status: status,
              startDate: chunk.start,
              endDate: chunk.end,
              orderByDirection: 'DESC'
            })

            console.log(`  ${status} - Page ${currentPage}: ${response.content.length} orders`)

            for (const order of response.content) {
              const syncedOrder = await syncOrder(order)
              syncedOrders.push(syncedOrder)
            }

            totalOrders = Math.max(totalOrders, syncedOrders.length)
            currentPage++

            // Check if there are more pages
            hasMorePages = currentPage < response.totalPages
          }
        }
      }

      console.log(`\nCompleted N11 REST sync: ${syncedOrders.length} total orders synced`)
    } else {
      // Fetch single page (last N days by default)
      const now = Date.now()
      const startDate = now - (days * 24 * 60 * 60 * 1000)

      console.log(`Fetching last ${days} days orders...`)
      console.log(`Date range: ${new Date(startDate).toISOString()} to ${new Date(now).toISOString()}`)

      const response = await n11Client.getOrders({
        page,
        size: pageSize,
        startDate: startDate,
        endDate: now,
        orderByDirection: 'DESC'
      })

      totalOrders = response.totalElements

      for (const order of response.content) {
        // Log first order to see product image field
        if (syncedOrders.length === 0) {
          console.log('🔍 Sample N11 Order Data:', JSON.stringify(order, null, 2))
        }
        const syncedOrder = await syncOrder(order)
        syncedOrders.push(syncedOrder)
      }
    }

    // Fetch product images and purchase prices from XML feed
    console.log('📥 Fetching product images and prices from Ticimax XML...')
    const allStockCodes: string[] = []
    for (const order of syncedOrders) {
      for (const item of order.items || []) {
        if (item.stockCode) {
          allStockCodes.push(item.stockCode)
        }
      }
    }

    if (allStockCodes.length > 0) {
      // Fetch images
      const imageMap = await getProductImagesByStockCodes(allStockCodes)
      console.log(`✅ Fetched ${imageMap.size} product images from XML`)

      // Fetch purchase prices
      const { getBolbolbulXMLClient } = await import('@/lib/api/bolbolbul-xml')
      const bolbolbulClient = getBolbolbulXMLClient()
      const priceMap = await bolbolbulClient.getPurchasePrices(allStockCodes)
      console.log(`💰 Fetched ${priceMap.size} purchase prices from XML`)

      // Update order items with images and prices
      for (const order of syncedOrders) {
        for (const item of order.items || []) {
          if (item.stockCode) {
            const updateData: any = {}

            // Add image if found
            const imageUrl = imageMap.get(item.stockCode)
            if (imageUrl) {
              updateData.imageUrl = imageUrl
              item.imageUrl = imageUrl // Update in-memory object too
            }

            // Add purchase price if found (and current price is 0)
            const purchasePrice = priceMap.get(item.stockCode)
            if (purchasePrice && purchasePrice > 0 && (!item.purchasePrice || item.purchasePrice === 0)) {
              updateData.purchasePrice = purchasePrice
              item.purchasePrice = purchasePrice // Update in-memory object too
              console.log(`💰 Added purchase price for ${item.productName}: ${purchasePrice} TL`)
            }

            // Update if we have data to update
            if (Object.keys(updateData).length > 0) {
              await prisma.orderItem.update({
                where: { id: item.id },
                data: updateData
              })
            }
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${syncedOrders.length} orders from N11 (REST)`,
      data: syncedOrders,
      pagination: {
        page,
        pageSize,
        total: totalOrders,
        synced: syncedOrders.length,
      },
    })
  } catch (error: any) {
    console.error('N11 REST sync error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to sync N11 orders',
        details: error.response?.data || null
      },
      { status: 500 }
    )
  }
}

/**
 * Sync a single order to database
 */
async function syncOrder(order: any) {
  // Map N11 REST status to internal status
  const mappedStatus = mapN11RestStatus(order.shipmentPackageStatus)

  // Use package ID as BOTH platformOrderId and for orderNumber
  // N11 API: order.id = package ID (unique), order.orderNumber = order number (can have multiple packages)
  // We treat each package as a separate order in our system
  const packageId = String(order.id)
  const orderNumberFromN11 = String(order.orderNumber)

  // Get cargo company
  const cargoCompany = mapN11CargoCompany(order.cargoProviderName)

  // Parse dates
  const orderDate = order.lastModifiedDate ? new Date(order.lastModifiedDate) : new Date()
  const agreedDeliveryDate = order.agreedDeliveryDate ? new Date(order.agreedDeliveryDate) : null

  // Customer info - prefer customerfullName (buyer name)
  const customerName = order.customerfullName || order.shippingAddress?.fullName || 'Unknown'
  const customerPhone = order.shippingAddress?.gsm || order.billingAddress?.gsm || 'Belirtilmemiş'
  const customerAddress = order.shippingAddress
    ? `${order.shippingAddress.address || ''}, ${order.shippingAddress.district || ''}, ${order.shippingAddress.city || ''}`.trim()
    : 'Unknown'

  // Check if this package already exists in database
  // Use platformOrderId (package ID) for uniqueness check
  const existingOrder = await prisma.order.findFirst({
    where: {
      platform: Platform.N11,
      platformOrderId: packageId  // Search by package ID
    },
    include: { items: true }
  })

  if (existingOrder) {
    // If order exists, delete old items before upserting
    await prisma.orderItem.deleteMany({
      where: { orderId: existingOrder.id }
    })
  }

  // Upsert logic - if order exists, update it, otherwise create it
  const dbOrder = existingOrder
    ? await prisma.order.update({
        where: { id: existingOrder.id },
        data: {
          status: mappedStatus,
          customerName: customerName,
          customerPhone: customerPhone,
          customerAddress: customerAddress,
          trackingNumber: order.cargoTrackingNumber || order.cargoSenderNumber || undefined,
          cargoCompany: cargoCompany,
          commissionRate: 15,
          items: {
            create: (order.lines || []).map((item: any) => ({
              productName: item.productName || 'Ürün',
              stockCode: item.stockCode || null,
              sku: String(item.productId || item.orderLineId || ''),
              quantity: item.quantity || 1,
              purchasePrice: 0,
              salePrice: item.price || 0,
            })),
          },
        },
        include: { items: true },
      })
    : await prisma.order.create({
        data: {
          orderNumber: `N11-${packageId}`, // Use package ID for orderNumber (unique per package)
          platform: Platform.N11,
          platformOrderId: packageId, // Use package ID as platformOrderId for uniqueness
          customerName: customerName,
          customerPhone: customerPhone,
          customerAddress: customerAddress,
          status: mappedStatus,
          orderDate: orderDate,
          agreedDeliveryDate: agreedDeliveryDate,
          trackingNumber: order.cargoTrackingNumber || order.cargoSenderNumber || undefined,
          cargoCompany: cargoCompany,
          commissionRate: 15, // N11 default commission
          shippingCost: 0, // Will be updated later
          items: {
            create: (order.lines || []).map((item: any) => ({
              productName: item.productName || 'Ürün',
              stockCode: item.stockCode || null,
              sku: String(item.productId || item.orderLineId || ''),
              quantity: item.quantity || 1,
              purchasePrice: 0, // Will be updated manually
              salePrice: item.price || 0,
            })),
          },
        },
        include: {
          items: true,
        },
      })

  return dbOrder
}

/**
 * Map N11 REST status to internal status
 * REST API Status values: Created, Picking, Shipped, Cancelled, Delivered, UnPacked, UnSupplied
 */
function mapN11RestStatus(n11Status: string): OrderStatus {
  const statusMap: Record<string, OrderStatus> = {
    'Created': OrderStatus.PENDING, // Yeni sipariş - onay bekliyor
    'UnPacked': OrderStatus.PENDING, // Paketlenmemiş
    'Picking': OrderStatus.PROCESSING, // Hazırlanıyor
    'UnSupplied': OrderStatus.PROCESSING, // Tedarik edilemiyor
    'Shipped': OrderStatus.SHIPPED, // Kargoda
    'Delivered': OrderStatus.DELIVERED, // Teslim edildi
    'Cancelled': OrderStatus.CANCELLED, // İptal
  }

  return statusMap[n11Status] || OrderStatus.PENDING
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

  return 'aras-kargo' // default fallback
}
