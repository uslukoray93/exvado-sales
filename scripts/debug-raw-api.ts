import { config } from 'dotenv'
import { getTicimaxClient } from '../lib/api/ticimax-soap'

// Load .env file
config()

async function main() {
  const client = getTicimaxClient()

  console.log('🔍 RAW API RESPONSE - SON 7 GÜN (TÜM DURUMLAR)\n')

  const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const endDate = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  console.log(`📅 Tarih Aralığı: ${startDate} - ${endDate}\n`)

  // TÜM siparişleri çek (status filter YOK)
  const allOrders = await client.selectSiparis(
    startDate,
    endDate,
    undefined, // Status filter YOK - tüm durumları getir
    0,
    200
  )

  console.log(`📦 TOPLAM SİPARİŞ: ${allOrders.length}\n`)

  // Bakiye kontrolü
  console.log('💰 BAKİYE KONTROLÜ:\n')
  const withBalance = allOrders.filter((o: any) => o.Bakiye && o.Bakiye > 0)
  const withoutBalance = allOrders.filter((o: any) => !o.Bakiye || o.Bakiye <= 0)

  console.log(`  ✅ Bakiye YOK veya ≤0 (ödeme tamam): ${withoutBalance.length} sipariş`)
  console.log(`  ❌ Bakiye VAR (ödeme bekliyor): ${withBalance.length} sipariş\n`)

  if (withBalance.length > 0) {
    console.log('  Ödeme bekleyen siparişler (Bakiye > 0):')
    withBalance.slice(0, 10).forEach((o: any) => {
      console.log(`    📋 ${o.SiparisNo} - ${o.UyeAdi} ${o.UyeSoyadi} - Bakiye: ${o.Bakiye} TL - Durum: ${o.SiparisDurum}`)
    })
    if (withBalance.length > 10) {
      console.log(`    ... ve ${withBalance.length - 10} sipariş daha`)
    }
    console.log()
  }

  // Durumlara göre grupla
  const byStatus = allOrders.reduce((acc: any, order) => {
    const key = `${order.SiparisDurumID}:${order.SiparisDurum}`
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(order)
    return acc
  }, {})

  console.log('📊 DURUMLARA GÖRE DAĞILIM:\n')
  Object.entries(byStatus).forEach(([status, orders]: [string, any]) => {
    console.log(`  🏷️ ${status} → ${orders.length} sipariş`)

    // İlk 3 siparişin detayını göster
    orders.slice(0, 3).forEach((o: any) => {
      console.log(`     📋 ${o.SiparisNo} - ${o.UyeAdi} ${o.UyeSoyadi} - ${o.SiparisTarihi}`)
    })

    if (orders.length > 3) {
      console.log(`     ... ve ${orders.length - 3} sipariş daha`)
    }
    console.log()
  })

  // DurumID=1 siparişleri özel olarak göster
  const durumID1 = allOrders.filter(o => o.SiparisDurumID === 1)

  if (durumID1.length > 0) {
    console.log(`\n✅ DURUM ID=1 SİPARİŞLER BULUNDU (${durumID1.length} adet):\n`)
    durumID1.forEach((o: any) => {
      console.log(`📋 Sipariş No: ${o.SiparisNo}`)
      console.log(`👤 Müşteri: ${o.UyeAdi} ${o.UyeSoyadi}`)
      console.log(`📅 Tarih: ${o.SiparisTarihi}`)
      console.log(`🏷️ Durum: ${o.SiparisDurum} (ID: ${o.SiparisDurumID})`)
      console.log(`💳 Ödeme Tipi: ${o.OdemeTipiAdi}`)
      console.log(`💰 Toplam: ${o.SiparisToplamTutari} TL`)
      console.log()
    })
  } else {
    console.log('\n❌ DURUM ID=1 (Onay bekliyor / Sipariş Alındı) HİÇ SİPARİŞ YOK!\n')
    console.log('🔍 BU DEMEK Kİ:')
    console.log('   1. Bu siparişler Ticimax\'te başka bir durum ID\'ye sahip')
    console.log('   2. VEYA bu siparişler 7 günden eski')
    console.log('   3. VEYA bu siparişler henüz Ticimax API\'ye senkronize olmadı')
  }

  // "Mehmet" veya "Özkal" içeren tüm siparişleri bul
  console.log('\n🔍 "MEHMET" İÇEREN TÜM SİPARİŞLER:\n')
  const mehmetOrders = allOrders.filter((o: any) =>
    (o.UyeAdi + ' ' + o.UyeSoyadi).toLowerCase().includes('mehmet')
  )

  if (mehmetOrders.length > 0) {
    mehmetOrders.forEach((o: any) => {
      console.log(`📋 ${o.SiparisNo} - ${o.UyeAdi} ${o.UyeSoyadi} - Durum: ${o.SiparisDurum} (ID:${o.SiparisDurumID})`)
    })
  } else {
    console.log('❌ "Mehmet" içeren sipariş bulunamadı')
  }

  console.log('\n🔍 "ÖZKAL" İÇEREN TÜM SİPARİŞLER:\n')
  const ozkalOrders = allOrders.filter((o: any) =>
    (o.UyeAdi + ' ' + o.UyeSoyadi).toLowerCase().includes('özkal') ||
    (o.UyeAdi + ' ' + o.UyeSoyadi).toLowerCase().includes('ozkal')
  )

  if (ozkalOrders.length > 0) {
    ozkalOrders.forEach((o: any) => {
      console.log(`📋 ${o.SiparisNo} - ${o.UyeAdi} ${o.UyeSoyadi} - Durum: ${o.SiparisDurum} (ID:${o.SiparisDurumID})`)
    })
  } else {
    console.log('❌ "Özkal" içeren sipariş bulunamadı')
  }
}

main().catch(console.error)
