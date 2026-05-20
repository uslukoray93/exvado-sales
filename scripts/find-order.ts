import { config } from 'dotenv'
import { getTicimaxClient } from '../lib/api/ticimax-soap'

config()

async function main() {
  const searchTerm = process.argv[2] || '312VH6355K'
  console.log(`🔍 Aranıyor: ${searchTerm}\n`)

  const client = getTicimaxClient()
  const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const endDate = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const orders = await client.selectSiparis(startDate, endDate, undefined, 0, 200)

  console.log(`📦 Toplam sipariş: ${orders.length}\n`)

  const found = orders.filter(o =>
    o.SiparisNo.includes(searchTerm) ||
    o.SiparisNo.includes(searchTerm.replace('K', '')) ||
    `${o.UyeAdi} ${o.UyeSoyadi}`.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (found.length > 0) {
    console.log(`✅ ${found.length} eşleşme bulundu:\n`)
    found.forEach(o => {
      console.log(`📋 Sipariş No: ${o.SiparisNo}`)
      console.log(`👤 Müşteri: ${o.UyeAdi} ${o.UyeSoyadi}`)
      console.log(`📅 Tarih: ${o.SiparisTarihi}`)
      console.log(`🏷️ Durum: ${o.SiparisDurum} (ID: ${o.SiparisDurumID})`)
      console.log(`💵 Bakiye: ${o.Bakiye || 0} TL`)
      console.log(`💰 Toplam: ${o.SiparisToplamTutari} TL`)

      if (o.Bakiye && o.Bakiye > 0) {
        console.log(`❌ ÖDEME BEKLİYOR - Sistemde görünmeyecek`)
      } else {
        console.log(`✅ ÖDEME TAMAM - Sistemde görünecek`)
      }
      console.log()
    })
  } else {
    console.log('❌ Eşleşme bulunamadı\n')
    console.log('İlk 30 sipariş:')
    orders.slice(0, 30).forEach((o, i) => {
      console.log(`${i + 1}. ${o.SiparisNo} - ${o.UyeAdi} ${o.UyeSoyadi}`)
    })
  }
}

main().catch(console.error)
