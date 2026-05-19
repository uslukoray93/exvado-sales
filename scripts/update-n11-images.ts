/**
 * Update N11 order images from XML feed
 */
import { prisma } from '../lib/prisma'
import { getProductImagesByStockCodes } from '../lib/image-fetcher'

async function main() {
  console.log('🔄 Updating N11 order images from XML...\n')

  // Get all N11 orders with items
  const n11Orders = await prisma.order.findMany({
    where: { platform: 'N11' },
    include: { items: true }
  })

  console.log(`Found ${n11Orders.length} N11 orders`)

  let totalUpdated = 0
  let totalNotFound = 0

  for (const order of n11Orders) {
    // Collect stock codes from this order
    const stockCodes = order.items
      .map(item => item.stockCode)
      .filter((code): code is string => code !== null)

    if (stockCodes.length === 0) {
      console.log(`⚠️  Order ${order.orderNumber}: No stock codes`)
      continue
    }

    // Fetch images from XML
    const imageMap = await getProductImagesByStockCodes(stockCodes)

    // Update items
    for (const item of order.items) {
      if (!item.stockCode) continue

      const imageUrl = imageMap.get(item.stockCode)

      if (imageUrl) {
        await prisma.orderItem.update({
          where: { id: item.id },
          data: { imageUrl }
        })
        console.log(`✅ ${order.orderNumber} - ${item.productName}: ${imageUrl}`)
        totalUpdated++
      } else {
        console.log(`❌ ${order.orderNumber} - ${item.productName}: NOT FOUND (${item.stockCode})`)
        totalNotFound++
      }
    }
  }

  console.log(`\n📊 Summary:`)
  console.log(`✅ Updated: ${totalUpdated} items`)
  console.log(`❌ Not found: ${totalNotFound} items`)
  console.log(`\n🎉 Done!`)

  await prisma.$disconnect()
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
