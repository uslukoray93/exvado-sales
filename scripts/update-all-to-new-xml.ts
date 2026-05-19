/**
 * Update ALL order images to new Ticimax XML URLs
 */
import { prisma } from '../lib/prisma'
import { getProductImagesByStockCodes } from '../lib/image-fetcher'

async function main() {
  console.log('🔄 Updating ALL orders to new Ticimax XML images...\n')

  // Get all orders with items
  const orders = await prisma.order.findMany({
    include: { items: true }
  })

  console.log(`Found ${orders.length} orders\n`)

  let totalUpdated = 0
  let totalNotFound = 0

  for (const order of orders) {
    // Collect stock codes
    const stockCodes = order.items
      .map(item => item.stockCode)
      .filter((code): code is string => code !== null)

    if (stockCodes.length === 0) continue

    // Fetch images from XML
    const imageMap = await getProductImagesByStockCodes(stockCodes)

    // Update items
    for (const item of order.items) {
      if (!item.stockCode) continue

      const imageUrl = imageMap.get(item.stockCode)

      if (imageUrl) {
        // Only update if different from current
        if (item.imageUrl !== imageUrl) {
          await prisma.orderItem.update({
            where: { id: item.id },
            data: { imageUrl }
          })
          console.log(`✅ ${order.orderNumber} - ${item.productName}`)
          console.log(`   OLD: ${item.imageUrl || 'NONE'}`)
          console.log(`   NEW: ${imageUrl}`)
          totalUpdated++
        }
      } else {
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
