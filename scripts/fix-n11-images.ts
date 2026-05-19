/**
 * Fix N11 order images - Re-fetch from XML
 */
import { prisma } from '../lib/prisma'
import { getProductImagesByStockCodes } from '../lib/image-fetcher'

async function main() {
  console.log('🔄 Fixing N11 order images...\n')

  // Get all N11 orders
  const orders = await prisma.order.findMany({
    where: {
      orderNumber: {
        startsWith: 'N11'
      }
    },
    include: { items: true }
  })

  console.log(`Found ${orders.length} N11 orders\n`)

  let totalUpdated = 0
  let totalNotFound = 0

  for (const order of orders) {
    // Collect stock codes
    const stockCodes = order.items
      .map(item => item.stockCode)
      .filter((code): code is string => code !== null)

    if (stockCodes.length === 0) {
      console.log(`⚠️  ${order.orderNumber} - No stock codes`)
      continue
    }

    // Fetch images from XML
    const imageMap = await getProductImagesByStockCodes(stockCodes)

    // Update items - ONLY if imageUrl is missing or empty
    for (const item of order.items) {
      if (!item.stockCode) continue

      const imageUrl = imageMap.get(item.stockCode)

      if (imageUrl) {
        // ONLY update if current imageUrl is missing
        if (!item.imageUrl || item.imageUrl === '') {
          await prisma.orderItem.update({
            where: { id: item.id },
            data: { imageUrl }
          })
          console.log(`✅ ${order.orderNumber} - ${item.productName}`)
          console.log(`   Stock: ${item.stockCode}`)
          console.log(`   Image: ${imageUrl}`)
          totalUpdated++
        }
      } else {
        // Only log missing images if item doesn't have one
        if (!item.imageUrl || item.imageUrl === '') {
          console.log(`❌ ${order.orderNumber} - ${item.productName}`)
          console.log(`   Stock: ${item.stockCode} - NOT FOUND IN XML`)
          totalNotFound++
        }
      }
    }
    console.log()
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
