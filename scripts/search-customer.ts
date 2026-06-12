import { config } from 'dotenv'
import { getTicimaxClient } from '../lib/api/ticimax-soap'

config()

async function main() {
  const customerName = process.argv[2]
  if (!customerName) {
    console.error('❌ Müşteri adı gerekli: npx tsx scripts/search-customer.ts "Ümit Dinçşahin"')
    process.exit(1)
  }

  console.log(`🔍 Müşteri aranıyor: ${customerName}\n`)

  const client = getTicimaxClient()

  // Son 30 günü kontrol et
  const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const endDate = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  console.log(`📅 Tarih Aralığı: ${startDate} - ${endDate}\n`)

  const allOrders = await client.selectSiparis(startDate, endDate, undefined, 0, 200)

  const orders = allOrders.filter((o) =>
    `${o.UyeAdi} ${o.UyeSoyadi}`.toLowerCase().includes(customerName.toLowerCase())
  )

  if (orders.length === 0) {
    console.log('❌ Müşteri bulunamadı (son 30 günde)\n')
    console.log('💡 Öneri:')
    console.log('   1. İsim yazımını kontrol edin')
    console.log('   2. Daha eski bir sipariş olabilir')
    console.log('   3. Farklı bir isimle kayıtlı olabilir')
    process.exit(1)
  }

  console.log(`✅ ${orders.length} sipariş bulundu!\n`)

  orders.forEach((order, i) => {
    console.log(`${i + 1}. 📋 Sipariş No: ${order.SiparisNo}`)
    console.log(`   👤 Müşteri: ${order.UyeAdi} ${order.UyeSoyadi}`)
    console.log(`   📅 Tarih: ${order.SiparisTarihi}`)
    console.log(`   🏷️ Durum: ${order.SiparisDurum} (ID: ${order.SiparisDurumID})`)
    console.log(`   💰 Toplam: ${order.SiparisToplamTutari} TL`)
    console.log(`   💵 Bakiye: ${order.Bakiye || 0} TL`)

    if (order.Bakiye && order.Bakiye > 0) {
      console.log(`   ❌ ÖDEME BEKLİYOR - Bu sipariş sistemde GÖRÜNMEYECEKTİR`)
    } else {
      console.log(`   ✅ ÖDEME TAMAM - Bu sipariş sistemde GÖRÜNECEK`)
    }
    console.log()
  })
}

main().catch(console.error)
