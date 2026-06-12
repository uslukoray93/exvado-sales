import { PrismaClient, OrderStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanupOldProcessingOrders() {
  console.log('🧹 14+ günlük PROCESSING siparişleri temizleniyor...\n')
  
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
  
  // Find old PROCESSING orders from N11
  const oldOrders = await prisma.order.findMany({
    where: {
      platform: 'N11',
      status: OrderStatus.PROCESSING,
      updatedAt: {
        lt: fourteenDaysAgo
      }
    },
    include: {
      items: true
    }
  })
  
  console.log(`📦 Bulunan eski PROCESSING sipariş: ${oldOrders.length}\n`)
  
  for (const order of oldOrders) {
    const daysSince = Math.floor((Date.now() - order.updatedAt.getTime()) / (1000 * 60 * 60 * 24))
    console.log(`🔄 ${order.orderNumber} - ${order.customerName}`)
    console.log(`   Son güncelleme: ${daysSince} gün önce`)
    console.log(`   Status: PROCESSING → COMPLETED`)
    
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: OrderStatus.COMPLETED
      }
    })
    
    console.log(`   ✅ COMPLETED olarak güncellendi\n`)
  }
  
  // Show final N11 stats
  const stats = await prisma.order.groupBy({
    by: ['status'],
    where: { platform: 'N11' },
    _count: true
  })
  
  console.log('\n📊 N11 Sipariş Durumu:')
  stats.forEach(s => {
    console.log(`   ${s.status}: ${s._count}`)
  })
}

cleanupOldProcessingOrders()
  .catch(e => {
    console.error('❌ Hata:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
