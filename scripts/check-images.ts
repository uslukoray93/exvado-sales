/**
 * Check image status for specific orders and stock codes
 */
import { prisma } from '../lib/prisma'

async function main() {
  // Check Trendyol order 11234008381
  console.log('\n🔍 Checking Trendyol order TY-11234008381...')
  const trendyolOrder = await prisma.order.findFirst({
    where: { orderNumber: 'TY-11234008381' },
    include: { items: true }
  })

  if (trendyolOrder) {
    console.log(`Found order: ${trendyolOrder.orderNumber}`)
    for (const item of trendyolOrder.items) {
      console.log(`  - ${item.productName}`)
      console.log(`    Stock Code: ${item.stockCode}`)
      console.log(`    SKU: ${item.sku}`)
      console.log(`    Image URL: ${item.imageUrl || 'NONE'}`)
    }
  } else {
    console.log('Order not found')
  }

  // Check stock code 303891
  console.log('\n🔍 Checking stock code 303891...')
  const items303891 = await prisma.orderItem.findMany({
    where: { stockCode: '303891' },
    include: { order: true }
  })

  if (items303891.length > 0) {
    for (const item of items303891) {
      console.log(`  - ${item.productName} (Order: ${item.order.orderNumber})`)
      console.log(`    Stock Code: ${item.stockCode}`)
      console.log(`    Image URL: ${item.imageUrl || 'NONE'}`)
    }
  } else {
    console.log('No items found with stock code 303891')
  }

  // Check N11 orders
  console.log('\n🔍 Checking N11 orders...')
  const n11Orders = await prisma.order.findMany({
    where: { platform: 'N11' },
    include: { items: true },
    take: 5,
    orderBy: { createdAt: 'desc' }
  })

  for (const order of n11Orders) {
    console.log(`\nN11 Order: ${order.orderNumber}`)
    for (const item of order.items) {
      console.log(`  - ${item.productName}`)
      console.log(`    Stock Code: ${item.stockCode}`)
      console.log(`    SKU: ${item.sku}`)
      console.log(`    Image URL: ${item.imageUrl || 'NONE'}`)
    }
  }

  // Check XML for stock code 303891
  console.log('\n🔍 Checking XML for stock code 303891...')
  const { getProductImageByStockCode } = await import('../lib/image-fetcher')
  const imageUrl = await getProductImageByStockCode('303891')
  console.log(`XML Image URL: ${imageUrl || 'NOT FOUND IN XML'}`)

  await prisma.$disconnect()
}

main()
  .catch(console.error)
