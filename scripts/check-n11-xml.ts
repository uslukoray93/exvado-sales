/**
 * Check if N11 stock codes exist in XML
 */
import { getProductImageByStockCode } from '../lib/image-fetcher'

const n11StockCodes = [
  'BCC-47-17',
  'DAKKIN-TJ53BG',
  '1727689919',
  'ING-CIRLI2028E',
  'DAKKIN-SLP600B'
]

async function main() {
  console.log('🔍 Checking N11 stock codes in XML...\n')

  for (const stockCode of n11StockCodes) {
    const imageUrl = await getProductImageByStockCode(stockCode)
    console.log(`${stockCode}: ${imageUrl || '❌ NOT FOUND'}`)
  }
}

main()
