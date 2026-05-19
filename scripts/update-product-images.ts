/**
 * Update product images for existing orders from Trendyol
 * Run with: npx tsx scripts/update-product-images.ts
 *
 * This script triggers a full sync of all Trendyol orders which will:
 * 1. Fetch fresh data from Trendyol API
 * 2. Generate CDN URLs from contentId
 * 3. Update existing order items with imageUrl
 */
import axios from 'axios'

async function main() {
  console.log('🔄 Triggering full Trendyol sync to update product images...\n')

  const baseUrl = 'http://localhost:3000'

  try {
    // Trigger full sync with all orders
    const response = await axios.get(`${baseUrl}/api/orders/trendyol`, {
      params: {
        syncAll: true,
        size: 200
      }
    })

    if (response.data.success) {
      console.log(`\n✅ Successfully synced ${response.data.pagination.synced} orders`)
      console.log(`📊 Total orders: ${response.data.pagination.total}`)

      // Count items with images
      let itemsWithImages = 0
      for (const order of response.data.data) {
        for (const item of order.items) {
          if (item.imageUrl) {
            itemsWithImages++
          }
        }
      }

      console.log(`🖼️  Items with images: ${itemsWithImages}`)
    } else {
      console.error('❌ Sync failed:', response.data.error)
    }
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    if (error.response?.data) {
      console.error('Response:', error.response.data)
    }
  }

  console.log('\n📦 N11 orders: N11 API does not provide product images')
  console.log('\n🎉 Done! Refresh the orders page to see images.')
}

main()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  })
