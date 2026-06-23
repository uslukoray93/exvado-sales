import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function checkInstallments() {
  const bolbolbulOrders = await prisma.order.findMany({
    where: {
      platform: 'BOLBOLBUL',
      paymentMethod: { contains: 'Kredi', mode: 'insensitive' }
    },
    select: {
      orderNumber: true,
      customerName: true,
      paymentMethod: true,
      installmentCount: true,
      orderTotal: true
    },
    take: 10
  })

  console.log(`\n📦 Bolbolbul Kredi Kartı Siparişleri (${bolbolbulOrders.length} adet):\n`)

  bolbolbulOrders.forEach(order => {
    console.log(`Sipariş: ${order.orderNumber}`)
    console.log(`Müşteri: ${order.customerName}`)
    console.log(`Ödeme: ${order.paymentMethod}`)
    console.log(`Taksit: ${order.installmentCount || 'YOK'}`)
    console.log(`Tutar: ${order.orderTotal} TL`)
    console.log('---')
  })

  const withInstallment = bolbolbulOrders.filter(o => o.installmentCount)
  console.log(`\n✅ Taksitli sipariş sayısı: ${withInstallment.length}`)
  console.log(`❌ Taksit bilgisi olmayan: ${bolbolbulOrders.length - withInstallment.length}`)
}

checkInstallments().finally(() => prisma.$disconnect())
