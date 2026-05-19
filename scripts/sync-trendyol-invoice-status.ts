/**
 * Sync Trendyol order invoice status from API
 */
import { prisma } from '../lib/prisma'
import { getTrendyolClient } from '../lib/api/trendyol'

async function main() {
  console.log('🔄 Syncing Trendyol invoice statuses from API...\n')

  const trendyolClient = getTrendyolClient()

  // Get all Trendyol orders from database
  const orders = await prisma.order.findMany({
    where: {
      platform: 'TRENDYOL',
      status: {
        in: ['SHIPPED', 'DELIVERED']
      }
    },
    orderBy: {
      orderDate: 'desc'
    }
  })

  console.log(`Found ${orders.length} Trendyol shipped/delivered orders\n`)

  let invoicedCount = 0
  let notInvoicedCount = 0
  let errorCount = 0

  for (const order of orders) {
    try {
      // Remove TY- prefix
      const trendyolOrderNumber = order.orderNumber.replace(/^TY-/i, '')

      // Get order details from Trendyol API
      const trendyolOrder = await trendyolClient.getOrderByNumber(trendyolOrderNumber)

      if (!trendyolOrder) {
        console.log(`⚠️  ${order.orderNumber} - Not found in Trendyol API`)
        errorCount++
        continue
      }

      // Check if invoice is uploaded (invoice field exists in the response)
      const hasInvoice = trendyolOrder.invoice !== null && trendyolOrder.invoice !== undefined
      const invoiceLink = trendyolOrder.invoiceLink || null

      if (hasInvoice || invoiceLink) {
        // Update order to mark as invoiced and completed
        await prisma.order.update({
          where: { id: order.id },
          data: {
            invoiceUploaded: true,
            status: 'COMPLETED'
          }
        })
        console.log(`✅ ${order.orderNumber} - Invoice uploaded → COMPLETED`)
        invoicedCount++
      } else {
        console.log(`⏳ ${order.orderNumber} - No invoice yet`)
        notInvoicedCount++
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200))

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
