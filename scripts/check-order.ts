import { config } from 'dotenv'
import { getTicimaxClient } from '../lib/api/ticimax-soap'

config()

async function main() {
  const orderNo = process.argv[2]
  if (!orderNo) {
    console.error('❌ Sipariş numarası gerekli: npx tsx scripts/check-order.ts 317IW3227X')
    process.exit(1)
  }

  console.log(`🔍 Sipariş aranıyor: ${orderNo}\n`)

  const client = getTicimaxClient()

  // Son 90 günü kontrol et
  const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const endDate = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const allOrders = await client.selectSiparis(startDate, endDate, undefined, 0, 500)

  const order = allOrders.find((o) => o.SiparisNo === orderNo)

  if (!order) {
    console.log('❌ Sipariş bulunamadı (son 30 günde)\n')
    console.log('💡 Öneri: Daha eski bir sipariş olabilir veya sipariş numarası yanlış olabilir')
    process.exit(1)
  }

  console.log('✅ Sipariş bulundu!\n')
  console.log(`📋 Sipariş No: ${order.SiparisNo}`)
  console.log(`👤 Müşteri: ${order.UyeAdi} ${order.UyeSoyadi}`)
  console.log(`📅 Tarih: ${order.SiparisTarihi}`)
  console.log(`🏷️ Durum: ${order.SiparisDurum} (ID: ${order.SiparisDurumID})`)
  console.log(`💰 Toplam: ${order.SiparisToplamTutari} TL`)
  console.log(`💳 Ödeme: ${order.OdemeTipiAdi || 'Bilinmiyor'}`)
  console.log(`💵 Bakiye: ${order.Bakiye || 0} TL`)

  if (order.Bakiye && order.Bakiye > 0) {
    console.log(`\n❌ ÖDEME BEKLİYOR - Bakiye: ${order.Bakiye} TL`)
    console.log(`   → Bu sipariş sistemde GÖRÜNMEYECEKTİR (filtrelendi)`)
  } else {
    console.log(`\n✅ ÖDEME TAMAM - Bakiye: ${order.Bakiye || 0} TL`)
    console.log(`   → Bu sipariş sistemde GÖRÜNECEK`)
  }
}

main().catch(console.error)
