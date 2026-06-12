/**
 * Test new Ticimax XML image fetcher
 */
import { getProductImageByStockCode } from '../lib/image-fetcher'

async function main() {
  console.log('🧪 Testing new Ticimax XML image fetcher\n')

  const testStockCodes = [
    '303891',           // Bertolini çapa
    'BCC-47-17',        // Baco bıçak
    'DAKKIN-TJ53BG',    // Dakkin tırpan
    '1727689919',       // Tomking motor
    'ING-CIRLI2028E',   // Ingco vidalama
  ]

  for (const stockCode of testStockCodes) {
    const imageUrl = await getProductImageByStockCode(stockCode)
    if (imageUrl) {
      console.log(`✅ ${stockCode}:`)
      console.log(`   ${imageUrl}`)
    } else {
      console.log(`❌ ${stockCode}: NOT FOUND`)
    }
  }

  console.log('\n✅ Test completed!')
}

main()
  .catch(console.error)
