import { getTicimaxClient } from './lib/api/ticimax-soap'

async function testAllPaymentTypes() {
  const client = getTicimaxClient() as any

  // Sipariş 493XC3923Q için tarih aralığı
  const startDate = '2026-05-12'
  const endDate = '2026-05-13'

  console.log(`📞 493XC3923Q sipariş için TÜM ödeme tiplerini deniyorum...\n`)

  // Ödeme tipleri: 0-10
  const paymentTypes = [
    { id: 0, name: 'Kredi Kartı' },
    { id: 1, name: 'Havale' },
    { id: 2, name: 'Kapıda Ödeme Nakit' },
    { id: 3, name: 'Kapıda Ödeme Kredi Kartı' },
    { id: 4, name: 'Mobil Ödeme' },
    { id: 5, name: 'BKM Express' },
    { id: 6, name: 'Paypal' },
    { id: 7, name: 'Cari' },
    { id: 8, name: 'Mail Order' },
    { id: 9, name: 'Ipara' },
    { id: 10, name: 'Nakit' },
  ]

  for (const paymentType of paymentTypes) {
    console.log(`\n🔍 Test: OdemeTipi=${paymentType.id} (${paymentType.name})`)

    try {
      const orders = await client.fetchOrdersByPaymentType(
        new Date(startDate),
        new Date(endDate),
        undefined, // status
        paymentType.id,
        0, // offset
        100 // limit
      )

      const target = orders.find((o: any) => o['a:SiparisNo'] === '493XC3923Q')

      if (target) {
        console.log(`\n✅✅✅ BULUNDU! ✅✅✅`)
        console.log(`Sipariş 493XC3923Q, OdemeTipi=${paymentType.id} (${paymentType.name}) ile bulundu!`)
        console.log(`OdemeTipiAdi (API): ${target['a:OdemeTipiAdi']}`)
        console.log(`SiparisNo: ${target['a:SiparisNo']}`)
        console.log(`ID: ${target['a:ID']}`)
        break
      } else {
        console.log(`❌ Bulunamadı (${orders.length} sipariş çekildi)`)
      }
    } catch (error: any) {
      console.log(`❌ Hata: ${error.message}`)
    }
  }
}

testAllPaymentTypes().catch(console.error)
