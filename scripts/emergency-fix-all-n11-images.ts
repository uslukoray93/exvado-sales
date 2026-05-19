/**
 * EMERGENCY: Fix ALL N11 images at once
 * Bu script TÜM N11 ürünlerinin görsellerini XML'den çeker ve database'e YAZAR
 */
import { prisma } from '../lib/prisma'
import { getProductImagesByStockCodes } from '../lib/image-fetcher'

async function main() {
  console.log('🚨 EMERGENCY: Fixing ALL N11 images...\n')

  // Get ALL N11 orders with items
  const orders = await prisma.order.findMany({
    where: {
      platform: 'N11'
    },
    include: {
      items: true
    }
  })

  console.log(`📦 Found ${orders.length} N11 orders\n`)

  // Collect ALL stock codes
  const allStockCodes: string[] = []
  for (const order of orders) {
    for (const item of order.items) {
      if (item.stockCode) {
        allStockCodes.push(item.stockCode)
      }
    }
  }

  console.log(`📋 Total ${allStockCodes.length} products\n`)
  console.log(`🔄 Fetching ALL images from XML...\n`)

  // Fetch ALL images at once (cached for 1 hour)
  const imageMap = await getProductImagesByStockCodes(allStockCodes)

  console.log(`✅ Found ${imageMap.size} images in XML\n`)

  let updated = 0
  let notFound = 0

  // Update ALL items
  for (const order of orders) {
    for (const item of order.items) {
      if (!item.stockCode) {
        console.log(`⚠️  ${order.orderNumber} - ${item.productName} - NO STOCK CODE`)
        continue
      }

      const imageUrl = imageMap.get(item.stockCode)

      if (imageUrl) {
        // FORCE UPDATE - regardless of current value
        await prisma.orderItem.update({
          where: { id: item.id },
          data: { imageUrl }
        })
        console.log(`✅ ${order.orderNumber} - ${item.productName}`)
        console.log(`   Stock: ${item.stockCode}`)
        console.log(`   Image: ${imageUrl}\n`)
        updated++
      } else {
        console.log(`❌ ${order.orderNumber} - ${item.productName}`)
        console.log(`   Stock: ${item.stockCode} - NOT IN XML\n`)
        notFound++
      }
    }
  }

  console.log(`\n📊 FINAL SUMMARY:`)
  console.log(`✅ Updated: ${updated} items`)
  console.log(`❌ Not found: ${notFound} items`)
  console.log(`📈 Success rate: ${Math.round(100 * updated / (updated + notFound))}%`)
  console.log(`\n🎉 DONE!`)

  await prisma.$disconnect()
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ FATAL ERROR:', error)
    process.exit(1)
  })
