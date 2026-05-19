/**
 * Sync N11 order invoice status from API
 * N11 API'den gerçek fatura durumlarını çeker ve database'i günceller
 */
import { prisma } from '../lib/prisma'
import { getN11Client } from '../lib/api/n11'

async function main() {
  console.log('🔄 Syncing N11 invoice statuses from API...\n')

  // Get all N11 DELIVERED orders without invoices
  const orders = await prisma.order.findMany({
    where: {
      platform: 'N11',
      status: 'DELIVERED',
      invoiceUploaded: false
    },
    orderBy: {
      orderDate: 'desc'
    }
  })

  console.log(`📦 Found ${orders.length} N11 orders in DELIVERED status without invoices\n`)

  if (orders.length === 0) {
    console.log('✅ No orders to sync!')
    return
  }

  const n11Client = getN11Client()
  let invoicedCount = 0
  let notInvoicedCount = 0
  let errorCount = 0

  for (const order of orders) {
    try {
      // Remove "N11-" prefix to get pure order number
      const pureOrderNumber = order.orderNumber.replace(/^N11-/i, '')

      console.log(`🔍 Checking ${order.orderNumber}...`)

      // Fetch order detail from N11 API
      const n11Order = await getN11Client().getOrderDetail(pureOrderNumber)

      // N11 status codes:
      // 0,1 = Pending
      // 2 = Approved
      // 3 = Processing
      // 4 = Ready to Ship
      // 5 = Shipped
      // 8,9,10 = Delivered (with invoice)
      // 11,12 = Cancelled
      const n11StatusNum = String(n11Order.status)
      const isInvoiced = ['8', '9', '10'].includes(n11StatusNum)

      if (isInvoiced) {
        // Update order to mark as invoiced and completed
        await prisma.order.update({
          where: { id: order.id },
          data: {
            invoiceUploaded: true,
            status: 'COMPLETED'
          }
        })
        console.log(`✅ ${order.orderNumber} - Invoice uploaded (N11 status: ${n11StatusNum}) → COMPLETED`)
        invoicedCount++
      } else {
        console.log(`⏳ ${order.orderNumber} - No invoice yet (N11 status: ${n11StatusNum})`)
        notInvoicedCount++
      }

      // Delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500))

    } catch (error: any) {
      console.error(`❌ ${order.orderNumber} - Error:`, error.message)
      errorCount++

      // If rate limited, wait longer
      if (error.message.includes('429')) {
        console.log('⚠️  Rate limited, waiting 5 seconds...')
        await new Promise(resolve => setTimeout(resolve, 5000))
      }
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
