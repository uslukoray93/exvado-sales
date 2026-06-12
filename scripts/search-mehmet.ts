import { config } from 'dotenv'
import { prisma } from '../lib/prisma'
import { getBolbolbulClient } from '../lib/api/bolbolbul'

// Load .env file
config()

async function main() {
  console.log('🔍 Searching for Mehmet Özkal order...\n')

  // 1. Search in database
  console.log('📊 Database Search:')
  const dbOrders = await prisma.order.findMany({
    where: {
      platform: 'BOLBOLBUL',
      customerName: {
        contains: 'Mehmet',
        mode: 'insensitive',
      },
    },
    orderBy: { orderDate: 'desc' },
  })

  if (dbOrders.length > 0) {
    console.log(`✅ Found ${dbOrders.length} order(s) in database:`)
    dbOrders.forEach((o) => {
      console.log(`  📋 Order: ${o.orderNumber}`)
      console.log(`  👤 Customer: ${o.customerName}`)
      console.log(`  📅 Date: ${o.orderDate}`)
      console.log(`  🏷️ Status: ${o.status}`)
      console.log(`  💰 Total: ${o.orderTotal} TL`)
      console.log()
    })
  } else {
    console.log('❌ No orders found in database with "Mehmet"\n')
  }

  // 2. Search in API
  console.log('📡 API Search (last 30 days):')
  const client = getBolbolbulClient()
  const apiResponse = await client.getOrders()

  const mehmetOrders = apiResponse.data.filter((o) =>
    o.customer.name.toLowerCase().includes('mehmet')
  )

  if (mehmetOrders.length > 0) {
    console.log(`✅ Found ${mehmetOrders.length} order(s) in API:`)
    mehmetOrders.forEach((o) => {
      console.log(`  📋 Order: ${o.orderNumber}`)
      console.log(`  👤 Customer: ${o.customer.name}`)
      console.log(`  📅 Date: ${o.orderDate}`)
      console.log(`  🏷️ Status: ${o.status}`)
      console.log(`  🏷️ Ticimax Status: ${o.ticimaxStatus}`)
      console.log(`  💰 Total: ${o.total} TL`)
      console.log()
    })
  } else {
    console.log('❌ No orders found in API with "Mehmet"\n')
  }

  // 3. Search all variations
  console.log('🔍 Searching all "Özkal" variations:')
  const ozkalOrders = apiResponse.data.filter((o) =>
    o.customer.name.toLowerCase().includes('özkal') ||
    o.customer.name.toLowerCase().includes('ozkal')
  )

  if (ozkalOrders.length > 0) {
    console.log(`✅ Found ${ozkalOrders.length} order(s) with "Özkal":`)
    ozkalOrders.forEach((o) => {
      console.log(`  📋 Order: ${o.orderNumber}`)
      console.log(`  👤 Customer: ${o.customer.name}`)
      console.log(`  📅 Date: ${o.orderDate}`)
      console.log(`  🏷️ Status: ${o.status}`)
      console.log(`  🏷️ Ticimax Status: ${o.ticimaxStatus}`)
      console.log(`  💰 Total: ${o.total} TL`)
      console.log()
    })
  } else {
    console.log('❌ No orders found with "Özkal"\n')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
