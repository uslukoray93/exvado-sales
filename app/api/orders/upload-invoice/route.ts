import { NextRequest, NextResponse } from 'next/server'
import { getTrendyolClient } from '@/lib/api/trendyol'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/orders/upload-invoice
 * Upload invoice file to Trendyol
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const orderNumber = formData.get('orderNumber') as string
    const file = formData.get('file') as File
    const invoiceNumber = formData.get('invoiceNumber') as string | null
    const invoiceDate = formData.get('invoiceDate') as string | null

    if (!orderNumber || !file) {
      return NextResponse.json(
        { success: false, error: 'Order number and file are required' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only PDF, JPEG, and PNG are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size must be less than 10MB' },
        { status: 400 }
      )
    }

    // Find order in database to get shipmentPackageId
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

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Convert invoice date to Unix timestamp if provided
    let invoiceDateTime: number | undefined
    if (invoiceDate) {
      invoiceDateTime = new Date(invoiceDate).getTime()
    }

    // Upload invoice to Trendyol
    await trendyolClient.uploadInvoice(
      trendyolOrder.shipmentPackageId,
      buffer,
      invoiceNumber || undefined,
      invoiceDateTime
    )

    // Update order in database to mark invoice as uploaded and status as completed
    await prisma.order.update({
      where: { id: order.id },
      data: {
        invoiceUploaded: true,
        invoiceNumber: invoiceNumber || undefined,
        invoiceDate: invoiceDate ? new Date(invoiceDate) : undefined,
        status: 'COMPLETED', // Fatura yüklenince sipariş tamamlandı olarak işaretlenir
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Invoice uploaded successfully to Trendyol',
    })
  } catch (error: any) {
    console.error('Upload invoice error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to upload invoice',
      },
      { status: 500 }
    )
  }
}
