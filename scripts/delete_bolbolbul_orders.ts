import { PrismaClient, Platform } from '@prisma/client'

const prisma = new PrismaClient()

async function deleteBolbolbulOrders() {
  try {
    console.log('🗑️  Bolbolbul siparişleri siliniyor...\n')

    // Önce kaç sipariş var kontrol et
    const count = await prisma.order.count({
      where: {
        platform: Platform.BOLBOLBUL,
      },
    })

    console.log(`📦 Toplam ${count} Bolbolbul siparişi bulundu`)

    if (count === 0) {
      console.log('✅ Silinecek sipariş yok')
      return
    }

    // Önce OrderItem'ları sil (foreign key constraint)
    const deletedItems = await prisma.orderItem.deleteMany({
      where: {
        Order: {
          platform: Platform.BOLBOLBUL,
        },
      },
    })

    console.log(`🗑️  ${deletedItems.count} sipariş ürünü silindi`)

    // Sonra Order'ları sil
    const deletedOrders = await prisma.order.deleteMany({
      where: {
        platform: Platform.BOLBOLBUL,
      },
    })

    console.log(`🗑️  ${deletedOrders.count} sipariş silindi`)

    console.log('\n✅ Tüm Bolbolbul siparişleri başarıyla silindi!')
  } catch (error: any) {
    console.error('❌ Hata:', error.message)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

deleteBolbolbulOrders()
