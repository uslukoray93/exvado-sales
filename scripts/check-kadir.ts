import { prisma } from '../lib/prisma'

async function main() {
  const orders = await prisma.order.findMany({
    where: {
      platform: 'BOLBOLBUL',
      orderNumber: { contains: '992EE3987L' },
    },
    include: { items: true },
  })

  console.log('📦 Kadir Çökren Sipariş Kontrolü:\n')

  if (orders.length === 0) {
    console.log('❌ Sipariş bulunamadı!')
    return
  }

  orders.forEach((o) => {
    console.log(`  📋 Sipariş No: ${o.orderNumber}`)
    console.log(`  👤 Müşteri: ${o.customerName}`)
    console.log(`  💰 Toplam (orderTotal): ${o.orderTotal} TL`)
    console.log(`  📦 Ürünler:`)
    o.items.forEach((item) => {
      console.log(`    - ${item.productName} x${item.quantity} @ ${item.salePrice} TL`)
    })
    console.log()
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
