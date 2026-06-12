import { config } from 'dotenv'
import { getTicimaxClient } from '../lib/api/ticimax-soap'

config()

async function main() {
  const orderNo = '955OG9237M'
  const targetStatusId = 4 // Paketleniyor

  console.log(`🔄 Testing SOAP SetSiparisDurum for order: ${orderNo}`)
  console.log(`📝 Target Status: ${targetStatusId} (Paketleniyor)`)
  console.log(`⏰ After this runs, REFRESH Ticimax panel and check if status changed\n`)

  const client = getTicimaxClient()

  // Get order details first
  const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const endDate = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  console.log('📡 Fetching order from Ticimax...')
  const orders = await client.selectSiparis(startDate, endDate, undefined, 0, 500)
  const order = orders.find((o) => o.SiparisNo === orderNo)

  if (!order) {
    console.error('❌ Order not found')
    process.exit(1)
  }

  console.log(`✅ Order found:`)
  console.log(`   ID: ${order.ID}`)
  console.log(`   Number: ${order.SiparisNo}`)
  console.log(`   Current Status: ${order.SiparisDurum} (ID: ${order.SiparisDurumID})`)
  console.log()

  // Call SOAP SetSiparisDurum
  console.log(`📤 Calling SOAP setSiparisDurum(${order.ID}, ${targetStatusId})...`)
  try {
    await client.setSiparisDurum(order.ID, targetStatusId, order.SiparisNo)
    console.log(`✅ SOAP API call successful!\n`)
  } catch (error: any) {
    console.error(`❌ SOAP API failed: ${error.message}`)
    process.exit(1)
  }

  console.log(`⏰ NOW GO TO TICIMAX PANEL AND:`)
  console.log(`   1. Press F5 to refresh the page`)
  console.log(`   2. Find order ${orderNo}`)
  console.log(`   3. Check if status changed to "Paketleniyor"`)
  console.log(`\n   If YES → SOAP API works (just UI doesn't refresh via SelectSiparis)`)
  console.log(`   If NO  → SOAP SetSiparisDurum is broken/disabled\n`)

  console.log(`Press Ctrl+C when done checking...`)
  await new Promise(() => {}) // Wait forever
}

main().catch(console.error)
