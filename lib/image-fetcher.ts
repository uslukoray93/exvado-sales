/**
 * Image fetcher utility to get product images from Bolbolbul Ticimax XML feed
 * Uses two XML files:
 * 1. Urunler.xml - Contains product info with StokKodu and UrunKartiID
 * 2. UrunResimleri.xml - Contains image URLs mapped by UrunKartiID
 */
import axios from 'axios'
import { parseStringPromise } from 'xml2js'

const PRODUCTS_XML_URL = 'https://www.bolbolbul.com/TicimaxXmlV2/8745C6599D254948A476B0C4EDEF3437/Urunler.xml'
const IMAGES_XML_URL = 'https://www.bolbolbul.com/TicimaxXmlV2/8745C6599D254948A476B0C4EDEF3437/UrunResimleri.xml'
const CACHE_DURATION = 1000 * 60 * 60 // 1 hour

interface ProductImage {
  stockCode: string
  imageUrl: string
}

// In-memory cache
let imageCache: Map<string, string> | null = null
let lastFetchTime: number = 0

/**
 * Fetch and cache all product images from Ticimax XML
 * Step 1: Fetch products XML to map StokKodu -> UrunKartiID
 * Step 2: Fetch images XML to map UrunKartiID -> ImageURL
 * Step 3: Combine to create StokKodu -> ImageURL mapping
 */
async function fetchAllProductImages(): Promise<Map<string, string>> {
  console.log('📥 Fetching product images from Ticimax XML...')

  try {
    // Fetch products XML
    console.log('  ⏳ Fetching products...')
    const productsResponse = await axios.get(PRODUCTS_XML_URL, {
      timeout: 60000,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })

    const productsData = await parseStringPromise(productsResponse.data, {
      explicitArray: false,
      ignoreAttrs: true
    })

    // Build StokKodu -> UrunKartiID map
    const stockToCardId = new Map<string, string>()
    const urunler = productsData.Root.Urunler.Urun
    const urunArray = Array.isArray(urunler) ? urunler : [urunler]

    for (const urun of urunArray) {
      const urunKartiID = urun.UrunKartiID
      if (!urunKartiID) continue

      const secenekler = urun.UrunSecenek?.Secenek
      if (!secenekler) continue

      const secenekArray = Array.isArray(secenekler) ? secenekler : [secenekler]

      for (const secenek of secenekArray) {
        const stockCode = secenek.StokKodu
        if (stockCode) {
          stockToCardId.set(stockCode, urunKartiID)
        }
      }
    }

    console.log(`  ✅ Mapped ${stockToCardId.size} stock codes`)

    // Fetch images XML
    console.log('  ⏳ Fetching images...')
    const imagesResponse = await axios.get(IMAGES_XML_URL, {
      timeout: 60000,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })

    const imagesData = await parseStringPromise(imagesResponse.data, {
      explicitArray: false,
      ignoreAttrs: true
    })

    // Build UrunKartiID -> ImageURL map
    const cardIdToImage = new Map<string, string>()
    const resimler = imagesData.Resimler.Resim
    const resimArray = Array.isArray(resimler) ? resimler : [resimler]

    for (const resim of resimArray) {
      const urunKartiID = resim.UrunKartiID
      const imageUrl = resim.ResimAdresi
      if (urunKartiID && imageUrl) {
        cardIdToImage.set(urunKartiID, imageUrl)
      }
    }

    console.log(`  ✅ Mapped ${cardIdToImage.size} product images`)

    // Combine: StokKodu -> ImageURL
    const imageMap = new Map<string, string>()
    for (const [stockCode, cardId] of stockToCardId.entries()) {
      const imageUrl = cardIdToImage.get(cardId)
      if (imageUrl) {
        imageMap.set(stockCode, imageUrl)
      }
    }

    console.log(`✅ Cached ${imageMap.size} product images (Ticimax XML)`)
    return imageMap

  } catch (error: any) {
    console.error('❌ Failed to fetch product images from XML:', error.message)
    return new Map()
  }
}

/**
 * Get product image URL by stock code
 * Uses cache to avoid fetching XML on every request
 */
export async function getProductImageByStockCode(stockCode: string): Promise<string | null> {
  // Check if cache needs refresh
  const now = Date.now()
  if (!imageCache || now - lastFetchTime > CACHE_DURATION) {
    imageCache = await fetchAllProductImages()
    lastFetchTime = now
  }

  return imageCache.get(stockCode) || null
}

/**
 * Get multiple product images by stock codes
 */
export async function getProductImagesByStockCodes(stockCodes: string[]): Promise<Map<string, string>> {
  // Ensure cache is loaded
  const now = Date.now()
  if (!imageCache || now - lastFetchTime > CACHE_DURATION) {
    imageCache = await fetchAllProductImages()
    lastFetchTime = now
  }

  const result = new Map<string, string>()
  for (const stockCode of stockCodes) {
    const imageUrl = imageCache.get(stockCode)
    if (imageUrl) {
      result.set(stockCode, imageUrl)
    }
  }

  return result
}

/**
 * Force refresh the image cache
 */
export async function refreshImageCache(): Promise<void> {
  imageCache = await fetchAllProductImages()
  lastFetchTime = Date.now()
}
