import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTrendyolClient } from '@/lib/api/trendyol'
import { getN11Client } from '@/lib/api/n11'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

/**
 * POST /api/orders/[id]/upload-invoice
 * Upload invoice file to marketplace (Trendyol or N11)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id

    // Get order from database
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    // Check if already invoiced
    if (order.invoiceUploaded) {
      return NextResponse.json(
        { success: false, error: 'Invoice already uploaded for this order' },
        { status: 400 }
      )
    }

    // Parse multipart form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const invoiceNumber = formData.get('invoiceNumber') as string | null
    const invoiceDateTime = formData.get('invoiceDateTime') as string | null

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Invoice file is required' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only PDF, JPEG, and PNG are allowed' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 10MB limit' },
        { status: 400 }
      )
    }

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // For N11, we need to save the file and generate a public URL
    let invoiceUrl: string | undefined

    if (order.platform === 'N11') {
      // Create invoices directory if it doesn't exist
      const invoicesDir = path.join(process.cwd(), 'public', 'invoices')
      try {
        await mkdir(invoicesDir, { recursive: true })
      } catch (e) {
        // Directory already exists, ignore
      }

      // Generate unique filename
      const fileExtension = file.name.split('.').pop() || 'pdf'
      const timestamp = Date.now()
      const sanitizedOrderNumber = order.orderNumber.replace(/[^a-zA-Z0-9]/g, '-')
      const filename = `invoice-${sanitizedOrderNumber}-${timestamp}.${fileExtension}`

      // Save file to public/invoices
      const filePath = path.join(invoicesDir, filename)
      await writeFile(filePath, buffer)

      // Generate public URL
      // TODO: Replace with your production domain
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
      invoiceUrl = `${baseUrl}/invoices/${filename}`

      console.log('💾 Fatura dosyası kaydedildi:', filePath)
      console.log('🔗 Fatura URL:', invoiceUrl)
    }

    // Upload invoice based on platform
    if (order.platform === 'TRENDYOL') {
      const trendyolClient = getTrendyolClient()

      // Get shipment package ID from platformOrderId
      const shipmentPackageId = order.platformOrderId

      await trendyolClient.uploadInvoice(
        shipmentPackageId,
        buffer,
        invoiceNumber || undefined,
        invoiceDateTime ? parseInt(invoiceDateTime) : undefined
      )
    } else if (order.platform === 'N11') {
      const n11Client = getN11Client()

      if (!invoiceUrl) {
        throw new Error('Fatura URL oluşturulamadı')
      }

      // N11 uses link-based invoice system
      await n11Client.uploadInvoiceLink(order.orderNumber, invoiceUrl)
    } else {
      return NextResponse.json(
        { success: false, error: `Invoice upload not supported for platform: ${order.platform}` },
        { status: 400 }
      )
    }

    // Update order in database
    await prisma.order.update({
      where: { id: orderId },
      data: {
        invoiceUploaded: true,
        invoiceUrl: invoiceUrl || undefined,
        invoiceNumber: invoiceNumber || undefined,
        invoiceDate: invoiceDateTime ? new Date(parseInt(invoiceDateTime)) : undefined,
        status: 'COMPLETED' // Fatura yüklendikten sonra tamamlandı olarak işaretle
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Invoice uploaded successfully',
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        platform: order.platform,
        invoiceUrl: invoiceUrl
      }
    })

  } catch (error: any) {
    console.error('Upload invoice error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to upload invoice'
      },
      { status: 500 }
    )
  }
}
