/**
 * Fix N11 order statuses - Update shipped orders that are actually delivered
 */
import { prisma } from '../lib/prisma'
import { getN11Client } from '../lib/api/n11'
import { OrderStatus } from '@prisma/client'

async function main() {
  console.log('🔄 Fixing N11 order statuses...\n')

  const n11Client = getN11Client()

  // Get all N11 orders that are currently SHIPPED
  const shippedOrders = await prisma.order.findMany({
    where: {
      platform: 'N11',
      status: 'SHIPPED'
    },
    orderBy: {
      orderDate: 'desc'
    }
  })

  console.log(`Found ${shippedOrders.length} N11 orders in SHIPPED status\n`)

  let updatedCount = 0
  let errorCount = 0
  let unchangedCount = 0

  for (const order of shippedOrders) {
    try {
      // Remove N11- prefix to get the actual N11 order number
      const n11OrderNumber = order.orderNumber.replace(/^N11-/i, '')

      // Fetch order details from N11 API
      const n11OrderDetail = await n11Client.getOrderDetail(order.platformOrderId)

      // Check N11 status
      const n11Status = String(n11OrderDetail.status)
      console.log(`📦 ${order.orderNumber}: N11 status = ${n11Status}`)

      // Status 8, 9, 10 = Delivered/Completed
      if (['8', '9', '10'].includes(n11Status)) {
        // Update to COMPLETED (with invoice)
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: OrderStatus.COMPLETED,
            invoiceUploaded: true
          }
        })
        console.log(`✅ Updated ${order.orderNumber} to COMPLETED\n`)
        updatedCount++
      } else if (n11Status === '5') {
        // Still in transit - keep as SHIPPED
        console.log(`⏳ ${order.orderNumber} still in transit (status 5)\n`)
        unchangedCount++
      } else {
        // Other status - map it correctly
        let newStatus = OrderStatus.SHIPPED
        if (['0', '1'].includes(n11Status)) newStatus = OrderStatus.PENDING
        if (n11Status === '2') newStatus = OrderStatus.APPROVED
        if (n11Status === '3') newStatus = OrderStatus.PROCESSING
        if (n11Status === '4') newStatus = OrderStatus.READY_TO_SHIP
        if (['11', '12'].includes(n11Status)) newStatus = OrderStatus.CANCELLED

        if (newStatus !== order.status) {
          await prisma.order.update({
            where: { id: order.id },
            data: { status: newStatus }
          })
          console.log(`🔄 Updated ${order.orderNumber} to ${newStatus}\n`)
          updatedCount++
        } else {
          unchangedCount++
        }
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 300))

    } catch (error: any) {
      console.error(`❌ Error processing ${order.orderNumber}:`, error.message, '\n')
      errorCount++
    }
  }

  console.log(`\n📊 Summary:`)
  console.log(`✅ Updated: ${updatedCount} orders`)
  console.log(`⏳ Unchanged: ${unchangedCount} orders`)
  console.log(`❌ Errors: ${errorCount} orders`)
  console.log(`\n🎉 Done!`)

  await prisma.$disconnect()
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  })
