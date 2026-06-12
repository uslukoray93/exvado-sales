import 'dotenv/config'
import { getTicimaxClient } from './lib/api/ticimax-soap'

async function testLast10Days() {
  const client = getTicimaxClient()

  // Son 10 gün
  const endDate = new Date()
  const startDate = new Date(endDate.getTime() - 10 * 24 * 60 * 60 * 1000)

  const startStr = startDate.toISOString().split('T')[0]
  const endStr = endDate.toISOString().split('T')[0]

  console.log(`📅 Son 10 günün siparişleri çekiliyor...`)
  console.log(`   Tarih aralığı: ${startStr} - ${endStr}`)
  console.log(`   Ödeme tipleri: Kredi Kartı (0) ve Havale (1)\n`)

  try {
    const orders = await client.selectSiparis(startStr, endStr)

    console.log(`\n✅ Toplam ${orders.length} sipariş bulundu`)

    if (orders.length > 0) {
      console.log('\n📦 İlk 5 sipariş:')
      orders.slice(0, 5).forEach((order, index) => {
        console.log(`\n  ${index + 1}. Sipariş:`)
        console.log(`     Sipariş No: ${order.SiparisNo}`)
        console.log(`     Tarih: ${order.SiparisTarihi}`)
        console.log(`     Ödeme Tipi: ${order.OdemeTipi} (${order.OdemeTipiAdi})`)
        console.log(`     Toplam: ${order.GenelToplam} TL`)
      })
    }

  } catch (error: any) {
    console.error('\n❌ Hata:', error.message)
  }
}

testLast10Days().catch(console.error)
