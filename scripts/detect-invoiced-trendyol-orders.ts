/**
 * Detect which Trendyol orders have invoices uploaded by checking API response
 */
import { prisma } from '../lib/prisma'
import { getTrendyolClient } from '../lib/api/trendyol'

async function main() {
  console.log('🔍 Detecting Trendyol orders with uploaded invoices...\n')

  const trendyolClient = getTrendyolClient()

  // Get recent Trendyol orders (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const orders = await prisma.order.findMany({
    where: {
      platform: 'TRENDYOL',
      orderDate: {
        gte: thirtyDaysAgo
      }
    },
    orderBy: {
      orderDate: 'desc'
    }
  })

  console.log(`Found ${orders.length} Trendyol orders from last 30 days\n`)

  let invoicedCount = 0
  let notInvoicedCount = 0
  let errorCount = 0

  for (const order of orders) {
    try {
      // Remove TY- prefix
      const trendyolOrderNumber = order.orderNumber.replace(/^TY-/i, '')

      // Fetch order from Trendyol API
      const response = await trendyolClient.getOrders({
        page: 0,
        size: 1,
        startDate: new Date(order.orderDate).getTime() - 86400000, // 1 day before
        endDate: new Date(order.orderDate).getTime() + 86400000, // 1 day after
      })

      // Find the specific order in response
      const trendyolOrder = response.content.find((o: any) => o.orderNumber === trendyolOrderNumber)

      if (!trendyolOrder) {
        console.log(`⚠️  ${order.orderNumber} - Not found in API`)
        errorCount++
        continue
      }

      // Check invoice fields
      const hasInvoice = trendyolOrder.invoice !== null && trendyolOrder.invoice !== undefined
      const hasInvoiceLink = trendyolOrder.invoiceLink !== null && trendyolOrder.invoiceLink !== undefined && trendyolOrder.invoiceLink !== ''
      const isInvoiced = hasInvoice || hasInvoiceLink

      if (isInvoiced) {
        console.log(`✅ ${order.orderNumber} - INVOICE UPLOADED`)
        console.log(`   Status in DB: ${order.status}`)
        console.log(`   Invoice Link: ${trendyolOrder.invoiceLink || 'N/A'}`)
        console.log(`   Current invoiceUploaded: ${order.invoiceUploaded}`)

        // Update if not already marked
        if (!order.invoiceUploaded || order.status !== 'COMPLETED') {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              invoiceUploaded: true,
              status: 'COMPLETED'
            }
          })
          console.log(`   ⚡ UPDATED to COMPLETED`)
        }

        invoicedCount++
      } else {
        console.log(`⏳ ${order.orderNumber} - No invoice yet (Status: ${trendyolOrder.status})`)
        notInvoicedCount++
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 300))

    } catch (error: any) {
      console.error(`❌ ${order.orderNumber} - Error: ${error.message}`)
      errorCount++
    }
  }

  console.log(`\n📊 Summary:`)
  console.log(`✅ Invoiced: ${invoicedCount} orders`)
  console.log(`⏳ Not invoiced: ${notInvoicedCount} orders`)
  console.log(`❌ Errors: ${errorCount} orders`)
  console.log(`\n🎉 Done!`)

  await prisma.$disconnect()
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
