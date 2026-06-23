import { config } from 'dotenv'
config({ path: '.env.local' })

import { getTicimaxClient } from './lib/api/ticimax-soap'

async function testSinglePayment() {
  console.log('🔐 TICIMAX_WS_AUTH_CODE:', process.env.TICIMAX_WS_AUTH_CODE)
  const client = getTicimaxClient()

  // Doğrudan sipariş ID ile test - 681YH3124K siparişi
  // Önce siparişleri çekip ID'sini bulalım
  console.log('📤 Fetching orders from Ticimax...')
  const orders = await client.selectSiparis()
  console.log(`📥 Fetched ${orders.length} orders`)

  const targetOrder = orders.find(o => o.SiparisNo === '681YH3124K')

  if (!targetOrder) {
    console.log('❌ Sipariş 681YH3124K bulunamadı!')
    console.log('Mevcut siparişler:')
    orders.slice(0, 10).forEach(o => console.log(`  - ${o.SiparisNo} (ID: ${o.ID})`))
    return
  }

  console.log(`\n✅ Sipariş bulundu:`)
  console.log(`  SiparisNo: ${targetOrder.SiparisNo}`)
  console.log(`  ID: ${targetOrder.ID}`)
  console.log(`  Müşteri: ${targetOrder.UyeAdi} ${targetOrder.UyeSoyadi}`)
  console.log(`  Toplam: ${targetOrder.SiparisToplamTutari} TL`)

  console.log(`\n📞 SelectSiparisOdeme çağrılıyor... (Order ID: ${targetOrder.ID})`)
  const payments = await client.selectSiparisOdeme(targetOrder.ID)

  console.log(`\n💳 Toplam ${payments.length} ödeme kaydı geldi (tüm siparişler)`)

  // Bu sipariş için olan ödemeyi bul
  const orderPayment = payments.find(p => p.SiparisID === targetOrder.ID)

  if (!orderPayment) {
    console.log(`\n⚠️ Sipariş ID=${targetOrder.ID} için ödeme kaydı bulunamadı!`)
    console.log(`İlk 20 ödeme kaydı:`)
    payments.slice(0, 20).forEach((p, i) => {
      console.log(`\n  [${i + 1}] SiparisID: ${p.SiparisID}, TaksitSayisi: ${p.TaksitSayisi}, Tutar: ${p.Tutar}`)
    })
  } else {
    console.log(`\n✅ Sipariş ${targetOrder.SiparisNo} için ödeme bulundu:`)
    console.log(`    ID: ${orderPayment.ID}`)
    console.log(`    SiparisID: ${orderPayment.SiparisID}`)
    console.log(`    OdemeTipi: ${orderPayment.OdemeTipi}`)
    console.log(`    TaksitSayisi: ${orderPayment.TaksitSayisi}`)
    console.log(`    BankaKomisyonu: ${orderPayment.BankaKomisyonu}`)
    console.log(`    Tutar: ${orderPayment.Tutar}`)
    console.log(`    Tarih: ${orderPayment.Tarih}`)
    console.log(`    OdemeDurumu: ${orderPayment.OdemeDurumu}`)
  }
}

testSinglePayment().catch(console.error).finally(() => process.exit())
