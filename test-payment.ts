import { getTicimaxClient } from './lib/api/ticimax-soap'

async function testPayment() {
  const client = getTicimaxClient()
  
  // 681YH3124K siparişinin ID'sini bul - bu sipariş 6 taksitle alınmış
  const orders = await client.selectSiparis()
  const order = orders.find(o => o.SiparisNo === '681YH3124K')
  
  if (!order) {
    console.log('❌ Sipariş bulunamadı')
    return
  }
  
  console.log(`✅ Sipariş bulundu: ID=${order.ID}, SiparisNo=${order.SiparisNo}`)
  
  // SelectSiparisOdeme ile ödeme bilgilerini çek
  const payments = await client.selectSiparisOdeme(order.ID)
  console.log(`\n💳 Ödeme Bilgileri (${payments.length} kayıt):`)
  payments.forEach(p => {
    console.log(`  - OdemeTipi: ${p.OdemeTipi}`)
    console.log(`  - TaksitSayisi: ${p.TaksitSayisi}`)
    console.log(`  - Tutar: ${p.Tutar}`)
    console.log(`  - Tarih: ${p.Tarih}`)
  })
}

testPayment().catch(console.error)
