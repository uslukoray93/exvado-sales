import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Platform, OrderStatus } from '@prisma/client'

/**
 * GET /api/orders/list
 * Get orders from database with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    // Pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    // Filters
    const platform = searchParams.get('platform') as Platform | null
    const status = searchParams.get('status') as OrderStatus | null
    const search = searchParams.get('search')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build where clause
    const where: any = {}

    if (platform) {
      where.platform = platform
    }

    if (status) {
      where.status = status
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { platformOrderId: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerPhone: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (startDate || endDate) {
      where.orderDate = {}
      if (startDate) where.orderDate.gte = new Date(startDate)
      if (endDate) where.orderDate.lte = new Date(endDate)
    }

    // Get total count
    const totalCount = await prisma.order.count({ where })

    // Get orders with items
    const orders = await prisma.order.findMany({
      where,
      include: {
        items: true,
      },
      orderBy: {
        orderDate: 'desc',
      },
      skip,
      take: limit,
    })

    // Transform orders to match frontend format
    const transformedOrders = orders.map((order) => {
      const totalSale = order.items.reduce(
        (sum, item) => sum + item.salePrice * item.quantity,
        0
      )
      const totalPurchase = order.items.reduce(
        (sum, item) => sum + item.purchasePrice * item.quantity,
        0
      )
      const commissionAmount = order.commissionRate
        ? (totalSale * order.commissionRate) / 100
        : 0
      const estimatedProfit =
        totalSale - totalPurchase - commissionAmount - order.shippingCost

      return {
        id: order.id,
        orderNumber: order.orderNumber,
        platform: order.platform.toLowerCase(),
        platformOrderId: order.platformOrderId,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        customerAddress: order.customerAddress,
        items: order.items.map((item) => ({
          id: item.id,
          productName: item.productName,
          stockCode: item.stockCode,
          sku: item.sku,
          quantity: item.quantity,
          purchasePrice: item.purchasePrice,
          salePrice: item.salePrice,
          imageUrl: item.imageUrl,
        })),
        status: order.status.toLowerCase().replace('_', ''),
        commissionRate: order.commissionRate,
        shippingCost: order.shippingCost,
        orderDate: order.orderDate.toISOString(),
        agreedDeliveryDate: order.agreedDeliveryDate?.toISOString(),
        estimatedProfit,
        commissionAmount,
        trackingNumber: order.trackingNumber,
        invoiceUrl: order.invoiceUrl,
        notes: order.notes,
        cargoCompany: order.cargoCompany,
      }
    })

    return NextResponse.json({
      success: true,
      data: transformedOrders,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: skip + limit < totalCount,
      },
    })
  } catch (error: any) {
    console.error('List orders error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch orders',
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/orders/list
 * Update order status or details
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, status, commissionRate, shippingCost, trackingNumber, notes, cargoCompany } = body

    console.log('📥 PATCH /api/orders/list - Request body:', body)

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Build update data
    const updateData: any = {}
    if (status) {
      // Convert frontend status format to Prisma enum format
      // e.g. "cancelled" -> "CANCELLED", "readytoship" -> "READY_TO_SHIP"
      const statusUpper = status.toUpperCase()
      updateData.status = statusUpper.includes('_') ? statusUpper : statusUpper
    }
    if (commissionRate !== undefined) updateData.commissionRate = commissionRate
    if (shippingCost !== undefined) updateData.shippingCost = shippingCost
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber
    if (notes !== undefined) updateData.notes = notes
    if (cargoCompany !== undefined) updateData.cargoCompany = cargoCompany

    console.log('💾 Update data:', updateData)

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: { items: true },
    })

    console.log('✅ Order updated successfully:', updatedOrder.id)

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully',
      data: updatedOrder,
    })
  } catch (error: any) {
    console.error('Update order error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to update order',
      },
      { status: 500 }
    )
  }
}
