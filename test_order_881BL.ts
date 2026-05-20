import 'dotenv/config'
import { getTicimaxClient } from './lib/api/ticimax-soap'

async function testOrder881BL() {
  const client = getTicimaxClient() as any

  const orderNumber = '881BL9129G'

  console.log(`🔍 ${orderNumber} sipariş numarası için ödeme tipini API'den sorguluyorum...\n`)

  // Geniş tarih aralığı (son 30 gün)
  const endDate = new Date()
  const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000)

  console.log(`📅 Tarih aralığı: ${startDate.toISOString().split('T')[0]} - ${endDate.toISOString().split('T')[0]}\n`)

  // Tüm ödeme tiplerini dene (0-10)
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
    console.log(`\n🔎 OdemeTipi=${paymentType.id} (${paymentType.name}) deneniyor...`)

    try {
      const orders = await client.fetchOrdersByPaymentType(
        startDate,
        endDate,
        undefined, // status
        paymentType.id,
        0, // offset
        1000 // limit - geniş tutuyorum
      )

      // Sipariş numarasını ara
      const targetOrder = orders.find((o: any) => {
        const orderNo = o['a:SiparisNo'] || ''
        return orderNo.includes(orderNumber) || orderNo === orderNumber
      })

      if (targetOrder) {
        console.log(`\n🎯 ✅ BULUNDU! ✅ 🎯\n`)
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
        console.log(`📦 Sipariş No: ${targetOrder['a:SiparisNo']}`)
        console.log(`💳 Ödeme Tipi: ${paymentType.id} (${paymentType.name})`)
        console.log(`📝 Ödeme Tipi Adı (API): ${targetOrder['a:OdemeTipiAdi']}`)
        console.log(`🆔 Sipariş ID: ${targetOrder['a:ID']}`)
        console.log(`📅 Sipariş Tarihi: ${targetOrder['a:SiparisTarihi']}`)
        console.log(`👤 Müşteri: ${targetOrder['a:AdiSoyadi']}`)
        console.log(`💰 Toplam: ${targetOrder['a:GenelToplam']} TL`)
        console.log(`📊 Durum: ${targetOrder['a:SiparisDurum']} (${targetOrder['a:Durum']})`)
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

        return // Bulunca dur
      } else {
        console.log(`   ❌ Bulunamadı (${orders.length} sipariş tarandı)`)
      }
    } catch (error: any) {
      console.log(`   ⚠️ Hata: ${error.message}`)
    }
  }

  console.log('\n❌ Sipariş hiçbir ödeme tipinde bulunamadı.')
  console.log('   Sipariş numarasını kontrol edin veya tarih aralığını genişletin.')
}

testOrder881BL().catch(console.error)
