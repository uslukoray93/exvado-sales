import { parseStringPromise } from 'xml2js'

interface BolbolbulProduct {
  StokKodu: string
  AlisFiyati: number
  SatisFiyati: number
  StokAdedi: number
}

/**
 * Bolbolbul XML Parser
 * Fetches and parses product data from Bolbolbul XML feed
 */
export class BolbolbulXMLClient {
  private xmlUrl = 'https://panel.bolbolbul.com/tum_urunler.xml'
  private cache: Map<string, BolbolbulProduct> | null = null
  private cacheTime: number = 0
  private cacheDuration = 15 * 60 * 1000 // 15 dakika cache

  /**
   * Fetch and parse Bolbolbul XML
   */
  async fetchProducts(): Promise<Map<string, BolbolbulProduct>> {
    // Check cache
    const now = Date.now()
    if (this.cache && (now - this.cacheTime) < this.cacheDuration) {
      console.log('✅ Using cached Bolbolbul products')
      return this.cache
    }

    console.log('⏳ Fetching Bolbolbul XML...')

    try {
      const response = await fetch(this.xmlUrl)
      const xmlText = await response.text()

      console.log(`✅ Fetched XML (${(xmlText.length / 1024).toFixed(2)} KB)`)

      // Parse XML
      const result = await parseStringPromise(xmlText, {
        explicitArray: false,
        mergeAttrs: true
      })

      const products = new Map<string, BolbolbulProduct>()
      const urunler = result.Root?.Urunler?.Urun || []

      // Handle both single product and array of products
      const urunArray = Array.isArray(urunler) ? urunler : [urunler]

      for (const urun of urunArray) {
        const secenekler = urun.UrunSecenek?.Secenek
        const secenekArray = secenekler ? (Array.isArray(secenekler) ? secenekler : [secenekler]) : []

        for (const secenek of secenekArray) {
          const stokKodu = secenek.StokKodu
          const alisFiyati = parseFloat(secenek.AlisFiyati || '0')
          const satisFiyati = parseFloat(secenek.SatisFiyati || '0')
          const stokAdedi = parseInt(secenek.StokAdedi || '0')

          if (stokKodu) {
            products.set(stokKodu, {
              StokKodu: stokKodu,
              AlisFiyati: alisFiyati,
              SatisFiyati: satisFiyati,
              StokAdedi: stokAdedi
            })
          }
        }
      }

      console.log(`✅ Parsed ${products.size} products from Bolbolbul XML`)

      // Update cache
      this.cache = products
      this.cacheTime = now

      return products
    } catch (error: any) {
      console.error('❌ Bolbolbul XML fetch error:', error.message)
      throw error
    }
  }

  /**
   * Get purchase price for a stock code
   */
  async getPurchasePrice(stockCode: string): Promise<number | null> {
    try {
      const products = await this.fetchProducts()
      const product = products.get(stockCode)
      return product ? product.AlisFiyati : null
    } catch (error) {
      console.error(`❌ Error getting purchase price for ${stockCode}:`, error)
      return null
    }
  }

  /**
   * Get purchase prices for multiple stock codes
   */
  async getPurchasePrices(stockCodes: string[]): Promise<Map<string, number>> {
    const prices = new Map<string, number>()

    try {
      const products = await this.fetchProducts()

      for (const stockCode of stockCodes) {
        const product = products.get(stockCode)
        if (product && product.AlisFiyati > 0) {
          prices.set(stockCode, product.AlisFiyati)
        }
      }

      console.log(`✅ Found purchase prices for ${prices.size}/${stockCodes.length} products`)
    } catch (error) {
      console.error('❌ Error getting purchase prices:', error)
    }

    return prices
  }

  /**
   * Clear cache (useful for testing)
   */
  clearCache() {
    this.cache = null
    this.cacheTime = 0
  }
}

/**
 * Singleton instance
 */
let bolbolbulXMLClientInstance: BolbolbulXMLClient | null = null

export function getBolbolbulXMLClient(): BolbolbulXMLClient {
  if (!bolbolbulXMLClientInstance) {
    bolbolbulXMLClientInstance = new BolbolbulXMLClient()
  }
  return bolbolbulXMLClientInstance
}
