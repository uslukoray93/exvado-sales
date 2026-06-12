import { config } from 'dotenv'
import { prisma } from '../lib/prisma'
import { getTicimaxClient } from '../lib/api/ticimax-soap'

config()

async function main() {
  console.log('🧹 Ödeme yapılmamış siparişleri temizleniyor...\n')

  // 1. Tüm Bolbolbul siparişlerini al
  const allOrders = await prisma.order.findMany({
    where: { platform: 'BOLBOLBUL' },
    select: { id: true, orderNumber: true, platformOrderId: true, customerName: true }
  })

  console.log(`📦 Toplam Bolbolbul siparişi: ${allOrders.length}`)

  // 2. Ticimax'ten bu siparişlerin güncel durumunu çek
  const client = getTicimaxClient()
  const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const endDate = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  console.log('📡 Ticimax API\'den siparişler çekiliyor...')
  const ticimaxOrders = await client.selectSiparis(startDate, endDate, undefined, 0, 500)

  console.log(`✅ Ticimax'ten ${ticimaxOrders.length} sipariş çekildi\n`)

  // 3. Bakiye > 0 olan siparişleri bul
  const unpaidOrderNos = ticimaxOrders
    .filter((o) => o.Bakiye && o.Bakiye > 0)
    .map((o) => o.SiparisNo)

  console.log(`❌ Ödeme bekleyen sipariş sayısı: ${unpaidOrderNos.length}\n`)

  if (unpaidOrderNos.length === 0) {
    console.log('✅ Silinecek sipariş yok!')
    return
  }

  // 4. Bu siparişleri veritabanından sil
  const deleted = await prisma.order.deleteMany({
    where: {
      platform: 'BOLBOLBUL',
      orderNumber: {
        in: unpaidOrderNos.map((no) => `BBB-${no}`)
      }
    }
  })

  console.log(`🗑️ Silinen sipariş sayısı: ${deleted.count}`)

  if (deleted.count > 0) {
    console.log('\n✅ Ödeme yapılmamış siparişler temizlendi!')
    console.log('💡 Şimdi /api/orders/bolbolbul endpoint\'ini çağırarak siparişleri yeniden senkronize edebilirsiniz.')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
