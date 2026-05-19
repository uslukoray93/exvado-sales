/**
 * Check for blank/missing Trendyol images
 */
import { prisma } from '../lib/prisma'
import axios from 'axios'

async function main() {
  console.log('🔍 Checking Trendyol images...\n')

  // Get all Trendyol orders
  const trendyolOrders = await prisma.order.findMany({
    where: { platform: 'TRENDYOL' },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
    take: 20
  })

  console.log(`Found ${trendyolOrders.length} recent Trendyol orders\n`)

  let blankImages = 0
  let workingImages = 0
  let missingImages = 0

  for (const order of trendyolOrders) {
    for (const item of order.items) {
      if (!item.imageUrl) {
        console.log(`❌ No image: ${order.orderNumber} - ${item.productName} (${item.stockCode})`)
        missingImages++
        continue
      }

      // Test if image URL is accessible
      try {
        const response = await axios.head(item.imageUrl, {
          timeout: 5000,
          validateStatus: (status) => status < 500
        })

        if (response.status === 200) {
          const contentType = response.headers['content-type'] || ''
          if (contentType.startsWith('image/')) {
            console.log(`✅ OK: ${item.imageUrl}`)
            workingImages++
          } else {
            console.log(`⚠️  Not an image: ${item.imageUrl} (${contentType})`)
            blankImages++
          }
        } else {
          console.log(`❌ HTTP ${response.status}: ${item.imageUrl}`)
          blankImages++
        }
      } catch (error: any) {
        console.log(`❌ Failed: ${item.imageUrl} - ${error.message}`)
        blankImages++
      }

      // Rate limit
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  console.log(`\n📊 Summary:`)
  console.log(`✅ Working images: ${workingImages}`)
  console.log(`❌ Blank/broken images: ${blankImages}`)
  console.log(`⚠️  Missing images: ${missingImages}`)

  await prisma.$disconnect()
}

main()
  .catch(console.error)
