import { NextRequest, NextResponse } from 'next/server'
import { getBolbolbulClient } from '@/lib/api/bolbolbul'
import { prisma } from '@/lib/prisma'
import { Platform, OrderStatus } from '@prisma/client'

/**
 * DELETE /api/orders/bolbolbul
 * Delete all Bolbolbul orders
 */
export async function DELETE(request: NextRequest) {
  try {
    // First delete all items
    const items = await prisma.orderItem.deleteMany({
      where: {
        Order: {
          platform: Platform.BOLBOLBUL
        }
      }
    })

    // Then delete all orders
    const orders = await prisma.order.deleteMany({
      where: {
        platform: Platform.BOLBOLBUL
      }
    })

    return NextResponse.json({
      success: true,
      message: `Deleted ${orders.count} Bolbolbul orders and ${items.count} items`,
    })
  } catch (error: any) {
    console.error('Delete Bolbolbul orders error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to delete Bolbolbul orders',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/orders/bolbolbul
 * Fetch and sync orders from Bolbolbul (Ticimax SOAP API)
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Starting Bolbolbul order sync...')

    const bolbolbulClient = getBolbolbulClient()

    // Fetch orders from Bolbolbul API (Ticimax SOAP)
    // Sadece son 7 günün siparişlerini çek (ödeme tipi 0 ve 1 olanlar)
    const bolbolbulOrders = await bolbolbulClient.getOrders()

    console.log(`📦 Fetched ${bolbolbulOrders.data.length} orders from Ticimax`)

    // Sync orders to database
    const syncedOrders = []
    let newOrders = 0
    let updatedOrders = 0

    for (const order of bolbolbulOrders.data) {
      try {
        // Map Bolbolbul status to our internal status
        const mappedStatus = mapBolbolbulStatus(order.status)

        // Check if order exists (using platformOrderId + platform combination)
        const existingOrder = await prisma.order.findFirst({
          where: {
            platform: Platform.BOLBOLBUL,
            platformOrderId: order.orderId,
          },
        })

        const isNew = !existingOrder

        // Create or update order
        const dbOrder = existingOrder
          ? await prisma.order.update({
              where: {
                id: existingOrder.id,
              },
              data: {
                status: mappedStatus,
                ticimaxStatus: order.ticimaxStatus,  // Ticimax orijinal durum adı
                orderTotal: order.total,  // Ticimax ToplamTutar: KDV dahil toplam sipariş tutarı
                trackingNumber: order.trackingNumber || undefined,
                cargoCompany: order.cargoCompany || undefined,
                // Update items: delete old ones and create new ones
                items: {
                  deleteMany: {}, // Delete all existing items
                  create: order.products.map((product) => ({
                    productName: product.productName,
                    sku: product.sku,
                    stockCode: product.stockCode,
                    quantity: product.quantity,
                    purchasePrice: 0,
                    salePrice: product.price,
                    imageUrl: product.imageUrl || undefined,
                  })),
                },
              },
              include: {
                items: true,
              },
            })
          : await prisma.order.create({
              data: {
                orderNumber: `BBB-${order.orderNumber}`,
                platform: Platform.BOLBOLBUL,
                platformOrderId: order.orderId,
                customerName: order.customer.name,
                customerPhone: order.customer.phone,
                customerAddress: order.customer.address,
                status: mappedStatus,
                ticimaxStatus: order.ticimaxStatus,  // Ticimax orijinal durum adı
                orderTotal: order.total,  // Ticimax ToplamTutar: KDV dahil toplam sipariş tutarı
                orderDate: new Date(order.orderDate),
                trackingNumber: order.trackingNumber || undefined,
                cargoCompany: order.cargoCompany || undefined,
                paymentType: order.paymentType,
                paymentMethod: order.paymentMethod,
                commissionRate: 0, // Bolbolbul is own website, no commission
                shippingCost: 0, // Will be calculated from order total
                items: {
                  create: order.products.map((product) => ({
                    productName: product.productName,
                    sku: product.sku,
                    stockCode: product.stockCode,
                    quantity: product.quantity,
                    purchasePrice: 0, // Will be updated manually
                    salePrice: product.price,
                    imageUrl: product.imageUrl || undefined,
                  })),
                },
              },
              include: {
                items: true,
              },
            })

        if (isNew) {
          newOrders++
        } else {
          updatedOrders++
        }

        syncedOrders.push(dbOrder)
      } catch (orderError: any) {
        console.error(`❌ Failed to sync order ${order.orderNumber}:`, orderError.message)
        // Continue with other orders
      }
    }

    console.log(`✅ Sync complete: ${newOrders} new, ${updatedOrders} updated`)

    // Fetch purchase prices from Bolbolbul XML for all synced orders
    console.log('💰 Fetching purchase prices from Bolbolbul XML...')
    try {
      const { getBolbolbulXMLClient } = await import('@/lib/api/bolbolbul-xml')
      const bolbolbulXMLClient = getBolbolbulXMLClient()

      for (const order of syncedOrders) {
        const stockCodes = order.items
          .map(item => item.stockCode)
          .filter((code): code is string => code !== null)

        if (stockCodes.length > 0) {
          const priceMap = await bolbolbulXMLClient.getPurchasePrices(stockCodes)

          for (const item of order.items) {
            if (item.stockCode) {
              const purchasePrice = priceMap.get(item.stockCode)
              if (purchasePrice && purchasePrice > 0 && (!item.purchasePrice || item.purchasePrice === 0)) {
                await prisma.orderItem.update({
                  where: { id: item.id },
                  data: { purchasePrice }
                })
                item.purchasePrice = purchasePrice // Update in-memory too
                console.log(`💰 Added purchase price for ${item.productName}: ${purchasePrice} TL`)
              }
            }
          }
        }
      }
    } catch (error: any) {
      console.error('❌ Failed to fetch purchase prices:', error.message)
      // Continue without prices - can be manually entered later
    }

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${syncedOrders.length} orders from Bolbolbul (${newOrders} new, ${updatedOrders} updated)`,
      data: syncedOrders,
      stats: {
        total: syncedOrders.length,
        new: newOrders,
        updated: updatedOrders,
      },
    })
  } catch (error: any) {
    console.error('❌ Bolbolbul sync error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to sync Bolbolbul orders',
      },
      { status: 500 }
    )
  }
}

/**
 * Map Bolbolbul order status to internal status
 */
function mapBolbolbulStatus(bolbolbulStatus: string): OrderStatus {
  const statusMap: Record<string, OrderStatus> = {
    pending: OrderStatus.PENDING,
    processing: OrderStatus.PROCESSING,
    shipped: OrderStatus.SHIPPED,
    delivered: OrderStatus.DELIVERED,
    completed: OrderStatus.COMPLETED,
    cancelled: OrderStatus.CANCELLED,
  }

  return statusMap[bolbolbulStatus.toLowerCase()] || OrderStatus.PENDING
}
