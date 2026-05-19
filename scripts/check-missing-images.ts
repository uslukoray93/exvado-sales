/**
 * Check orders with missing images
 */
import { prisma } from '../lib/prisma'
import { getProductImageByStockCode } from '../lib/image-fetcher'

async function main() {
  console.log('🔍 Checking orders with missing images...\n')

  const orderNumbers = [
    'TY-11232460685',
    'TY-11230264272',
    'TY-11230154776',
    'TY-11229170950',
  ]

  for (const orderNumber of orderNumbers) {
    const order = await prisma.order.findFirst({
      where: { orderNumber },
      include: { items: true }
    })

    if (!order) {
      console.log(`❌ Order ${orderNumber} not found\n`)
      continue
    }

    console.log(`📦 ${orderNumber}:`)
    for (const item of order.items) {
      console.log(`  - ${item.productName}`)
      console.log(`    Stock Code: ${item.stockCode || 'NONE'}`)
      console.log(`    SKU: ${item.sku}`)
      console.log(`    Current Image: ${item.imageUrl || 'NONE'}`)

      if (item.stockCode) {
        const imageUrl = await getProductImageByStockCode(item.stockCode)
        if (imageUrl) {
          console.log(`    ✅ Found in XML: ${imageUrl}`)
        } else {
          console.log(`    ❌ Not found in XML`)
        }
      }
    }
    console.log()
  }

  await prisma.$disconnect()
}

main()
  .catch(console.error)
