import { getTicimaxClient } from './lib/api/ticimax-soap'

async function test() {
  const client = getTicimaxClient()
  console.log('Son 90 günün siparişleri sorgulanıyor...')

  // Son 90 gün
  const endDate = new Date()
  const startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000)

  const startStr = startDate.toISOString().split('T')[0]
  const endStr = endDate.toISOString().split('T')[0]

  console.log(`Tarih aralığı: ${startStr} - ${endStr}`)

  const orders = await client.selectSiparis(startStr, endStr)

  console.log(`Toplam ${orders.length} sipariş bulundu`)

  // 493XC3923Q siparişini ara
  const target = orders.find(o => o.SiparisNo === '493XC3923Q')

  if (target) {
    console.log('\n=== SONUÇ ===')
    console.log('Sipariş 493XC3923Q BULUNDU!')
    console.log('OdemeTipi:', target.OdemeTipi)
    console.log('OdemeTipiAdi:', target.OdemeTipiAdi)
    console.log('=============')
  } else {
    console.log('\n❌ 493XC3923Q bulunamadı (son 90 günde yok)')
    console.log('İlk 5 sipariş:')
    orders.slice(0, 5).forEach(o => {
      console.log(`  - ${o.SiparisNo}: OdemeTipi=${o.OdemeTipi}, OdemeTipiAdi=${o.OdemeTipiAdi}`)
    })
  }
}

test().catch(console.error)
