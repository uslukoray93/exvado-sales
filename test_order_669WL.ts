import 'dotenv/config'
import { getTicimaxClient } from './lib/api/ticimax-soap'

async function testOrder669WL() {
  const client = getTicimaxClient() as any

  const orderNumber = '669WL3593X'

  console.log(`🔍 ${orderNumber} sipariş numarası için detayları API'den sorguluyorum...\n`)

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
    try {
      const orders = await client.fetchOrdersByPaymentType(
        startDate,
        endDate,
        undefined, // status
        paymentType.id,
        0, // offset
        1000 // limit
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
        console.log(`📊 Sipariş Durum (Durum): ${targetOrder['a:Durum']}`)
        console.log(`📋 Sipariş Durumu Adı: ${targetOrder['a:SiparisDurum']}`)
        console.log(`📋 Sipariş Durumu ID: ${targetOrder['a:SiparisDurumID']}`)
        console.log(`💵 Ödeme Durumu: ${targetOrder['a:OdemeDurum']}`)
        console.log(`💸 Bakiye: ${targetOrder['a:Bakiye']} TL`)
        console.log(`\n🔍 Tüm order field'ları:`)
        console.log(Object.keys(targetOrder).filter(k => k.includes('Durum') || k.includes('Status')))
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

        // Mapping kontrolü
        const durum = parseInt(targetOrder['a:Durum']) || 0
        console.log(`\n🔍 Mapping Kontrolü:`)
        console.log(`   Durum değeri: ${durum}`)
        console.log(`   durum !== 0: ${durum !== 0}`)
        console.log(`   Bu sipariş ${durum !== 0 ? 'SYNC EDİLECEK ✅' : 'FİLTRELENECEK ❌'}`)

        return // Bulunca dur
      }
    } catch (error: any) {
      // Sessizce devam et
    }
  }

  console.log('\n❌ Sipariş hiçbir ödeme tipinde bulunamadı.')
}

testOrder669WL().catch(console.error)
