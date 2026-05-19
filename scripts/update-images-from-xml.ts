/**
 * Update product images from Bolbolbul XML feed
 * Run with: npx tsx scripts/update-images-from-xml.ts
 */
import { prisma } from '../lib/prisma'
import axios from 'axios'
import { parseStringPromise } from 'xml2js'

const XML_URL = 'https://panel.bolbolbul.com/tum_urunler.xml'

interface Product {
  stockCode: string
  imageUrl: string
  productName: string
}

async function main() {
  console.log('🔄 Fetching product data from XML...\n')

  try {
    // Fetch XML
    const response = await axios.get(XML_URL, {
      timeout: 60000,
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    })

    console.log('✅ XML downloaded successfully')
    console.log('📊 Parsing XML...\n')

    // Parse XML
    const result = await parseStringPromise(response.data, {
      explicitArray: false,
      ignoreAttrs: true
    })

    const products: Product[] = []
    const urunler = result.Root.Urunler.Urun

    // Handle both single product and array of products
    const urunArray = Array.isArray(urunler) ? urunler : [urunler]

    // Extract products with stock codes and images
    for (const urun of urunArray) {
      const productName = urun.UrunAdi
      const imageUrl = urun.UrunUrl

      // Handle UrunSecenek - can be single or array
      const secenekler = urun.UrunSecenek?.Secenek
      if (!secenekler) continue

      const secenekArray = Array.isArray(secenekler) ? secenekler : [secenekler]

      for (const secenek of secenekArray) {
        const stockCode = secenek.StokKodu
        if (stockCode && imageUrl) {
          products.push({
            stockCode,
            imageUrl,
            productName
          })
        }
      }
    }

    console.log(`📦 Found ${products.length} products in XML\n`)

    // Update database
    let updated = 0
    let notFound = 0

    for (const product of products) {
      try {
        // Find items by stock code
        const items = await prisma.orderItem.findMany({
          where: {
            stockCode: product.stockCode
          }
        })

        if (items.length > 0) {
          // Update all items with this stock code
          await prisma.orderItem.updateMany({
            where: {
              stockCode: product.stockCode
            },
            data: {
              imageUrl: product.imageUrl
            }
          })

          updated += items.length
          console.log(`✅ Updated ${items.length} items for ${product.stockCode} - ${product.productName}`)
        } else {
          notFound++
        }
      } catch (error: any) {
        console.error(`❌ Error updating ${product.stockCode}:`, error.message)
      }
    }

    console.log('\n📊 Summary:')
    console.log(`✅ Updated: ${updated} items`)
    console.log(`⚠️  Not found in database: ${notFound} products`)
    console.log('\n🎉 Done! Refresh the orders page to see images.')

  } catch (error: any) {
    console.error('❌ Error:', error.message)
    if (error.response) {
      console.error('Response status:', error.response.status)
    }
  }
}

main()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  })
