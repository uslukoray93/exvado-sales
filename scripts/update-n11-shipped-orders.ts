/**
 * Update N11 SHIPPED orders to their current status from N11 API
 * Run with: npx tsx scripts/update-n11-shipped-orders.ts
 */
import { prisma } from '../lib/prisma'
import { getN11RestClient } from '../lib/api/n11-rest'
import { OrderStatus } from '@prisma/client'

async function main() {
  console.log('🔄 Fetching SHIPPED N11 orders from database...')

  // Get all N11 SHIPPED orders
  const shippedOrders = await prisma.order.findMany({
    where: {
      platform: 'N11',
      status: 'SHIPPED',
    },
    select: {
      id: true,
      orderNumber: true,
      platformOrderId: true,
      orderDate: true,
    },
    orderBy: {
      orderDate: 'desc',
    },
  })

  console.log(`📦 Found ${shippedOrders.length} SHIPPED orders`)

  if (shippedOrders.length === 0) {
    console.log('✅ No SHIPPED orders to update')
    return
  }

  const n11Client = getN11RestClient()
  let updated = 0
  let notFound = 0
  let errors = 0

  // Update each order
  for (const order of shippedOrders) {
    try {
      console.log(`\n📍 Checking ${order.orderNumber} (${order.platformOrderId})...`)

      // Query N11 API for this specific package
      const response = await n11Client.getOrders({
        packageIds: order.platformOrderId,
        page: 0,
        size: 1,
      })

      if (!response.content || response.content.length === 0) {
        console.log(`  ⚠️  Not found in N11 API`)

        // If order is older than 15 days, mark as DELIVERED
        const daysSinceOrder = Math.floor((Date.now() - order.orderDate.getTime()) / (1000 * 60 * 60 * 24))

        if (daysSinceOrder >= 15) {
          await prisma.order.update({
            where: { id: order.id },
            data: { status: 'DELIVERED' },
          })
          console.log(`  ✅ Auto-updated to DELIVERED (${daysSinceOrder} days old, not in N11 API)`)
          updated++
        } else {
          console.log(`  ℹ️  Skipping (only ${daysSinceOrder} days old)`)
          notFound++
        }
        continue
      }

      const n11Order = response.content[0]
      const n11Status = n11Order.shipmentPackageStatus

      // Map N11 status to our status
      const statusMap: Record<string, OrderStatus> = {
        'Created': 'PENDING',
        'UnPacked': 'PENDING',
        'Picking': 'PROCESSING',
        'UnSupplied': 'PROCESSING',
        'Shipped': 'SHIPPED',
        'Delivered': 'DELIVERED',
        'Cancelled': 'CANCELLED',
      }

      const newStatus = statusMap[n11Status] || 'PENDING'

      if (newStatus === 'SHIPPED') {
        console.log(`  ℹ️  Still SHIPPED in N11`)
        continue
      }

      // Update status
      await prisma.order.update({
        where: { id: order.id },
        data: { status: newStatus },
      })

      console.log(`  ✅ Updated: SHIPPED → ${newStatus}`)
      updated++

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
    } catch (error: any) {
      console.error(`  ❌ Error: ${error.message}`)
      errors++
    }
  }

  console.log(`\n📊 Summary:`)
  console.log(`  ✅ Updated: ${updated}`)
  console.log(`  ⚠️  Not found: ${notFound}`)
  console.log(`  ❌ Errors: ${errors}`)
  console.log(`  ℹ️  Still SHIPPED: ${shippedOrders.length - updated - notFound - errors}`)
}

main()
  .then(() => {
    console.log('\n✅ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  })
