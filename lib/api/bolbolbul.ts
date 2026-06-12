/**
 * Bolbolbul API Client (Ticimax SOAP)
 * API Documentation: https://www.ticimax.com/web-servis-api/
 */

import { getTicimaxClient, type TicimaxSiparis, type TicimaxSiparisUrun } from './ticimax-soap'

export interface BolbolbulOrder {
  orderId: string
  orderNumber: string
  orderDate: string
  status: string
  ticimaxStatus?: string  // Ticimax orijinal durum adı (örn: "Ön sipariş", "Paketleniyor")
  customer: {
    name: string
    phone: string
    address: string
  }
  products: Array<{
    productName: string
    sku: string
    stockCode: string
    quantity: number
    price: number
    imageUrl?: string
  }>
  total: number
  trackingNumber?: string
  cargoCompany?: string
  paymentType?: number
  paymentMethod?: string
}

export interface BolbolbulOrdersResponse {
  data: BolbolbulOrder[]
  total: number
  page: number
  limit: number
}

class BolbolbulAPIClient {
  private ticimaxClient = getTicimaxClient()

  /**
   * Fetch orders from Bolbolbul (via Ticimax SOAP)
   * @param options - Query options (page, limit, date range, status)
   */
  async getOrders(options?: {
    page?: number
    limit?: number
    startDate?: string // YYYY-MM-DD
    endDate?: string // YYYY-MM-DD
    status?: number // Ticimax status ID
    fetchAll?: boolean // Fetch all orders with pagination
  }): Promise<BolbolbulOrdersResponse> {
    try {
      console.log('📞 Fetching orders from Ticimax SOAP API...')

      let allOrders: any[] = []

      // Date range chunking ONLY for fetchAll=true (manual historical fetch)
      // For regular sync, use last 30 days with pagination
      const shouldChunk = options?.fetchAll === true
      const dateChunks = shouldChunk
        ? this.createDateChunks(options?.startDate, options?.endDate)
        : [{
            start: options?.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last 30 days
            end: options?.endDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +1 day to include today
          }]

      if (shouldChunk) {
        console.log(`📅 Split date range into ${dateChunks.length} chunks (3-month periods)`)
      }

      // Use Map to deduplicate orders by ID
      const orderMap = new Map<string, any>()

      for (const chunk of dateChunks) {
        if (shouldChunk) {
          console.log(`📆 Fetching chunk: ${chunk.start} to ${chunk.end}`)
        }

        if (options?.fetchAll) {
          // Fetch all orders with pagination for this chunk
          let offset = 0
          const batchSize = 100 // Ticimax max limit
          let hasMore = true

          while (hasMore) {
            console.log(`📄 Fetching batch: offset=${offset}, limit=${batchSize}`)
            const batch = await this.ticimaxClient.selectSiparis(
              chunk.start,
              chunk.end,
              options?.status,
              offset,
              batchSize
            )

            if (batch.length === 0) {
              hasMore = false
            } else {
              // Add to map to deduplicate by order NUMBER (not ID) to prevent duplicates
              batch.forEach((order) => {
                orderMap.set(order.SiparisNo, order)
              })
              offset += batchSize

              // If we got less than batchSize, we've reached the end
              if (batch.length < batchSize) {
                hasMore = false
              }
            }
          }
        } else {
          // For regular sync, use pagination to get ALL orders in last 30 days
          let offset = 0
          const batchSize = 100
          let hasMore = true
          let totalFetched = 0

          while (hasMore) {
            console.log(`📄 Regular sync - Fetching batch: offset=${offset}, limit=${batchSize}`)
            const batch = await this.ticimaxClient.selectSiparis(
              chunk.start,
              chunk.end,
              options?.status,
              offset,
              batchSize
            )

            if (batch.length === 0) {
              hasMore = false
            } else {
              // Add to map to deduplicate by order NUMBER (not ID) to prevent duplicates
              batch.forEach((order) => {
                orderMap.set(order.SiparisNo, order)
              })

              totalFetched += batch.length
              offset += batchSize

              // If we got less than batchSize, we've reached the end
              if (batch.length < batchSize) {
                hasMore = false
              }

              // Safety limit: max 500 orders per sync
              if (totalFetched >= 500) {
                console.log(`⚠️ Reached safety limit of 500 orders`)
                hasMore = false
              }
            }
          }

          console.log(`✅ Total fetched from this chunk: ${totalFetched} orders`)
        }
      }

      // Convert map back to array
      allOrders = Array.from(orderMap.values())

      if (shouldChunk) {
        console.log(`📦 Fetched total ${allOrders.length} unique orders from all chunks (after deduplication)`)
      } else {
        console.log(`📦 Fetched ${allOrders.length} orders from Ticimax`)
      }

      const ticimaxOrders = allOrders

      // Map orders with products (products are included in SelectSiparis response)
      // Filter out "Ön sipariş" (unpaid orders) before mapping
      console.log(`🔍 DEBUG: Total orders fetched from Ticimax: ${ticimaxOrders.length}`)

      // Count orders by status and payment status
      const statusCount = ticimaxOrders.reduce((acc: Record<string, number>, o) => {
        const key = `Durum=${o.SiparisDurumID}:${o.SiparisDurum} | ÖdemeDurum=${o.OdemeDurumu ?? 'undefined'}`
        acc[key] = (acc[key] || 0) + 1
        return acc
      }, {})
      console.log('📊 Order Status + Payment Status Distribution:')
      Object.entries(statusCount).forEach(([status, count]) => {
        console.log(`  ${status} → ${count} orders`)
      })

      const ordersWithItems: BolbolbulOrder[] = ticimaxOrders
        .filter((order) => {
          // Bakiye > 0 ise ödeme bekliyor, atla
          // Bakiye < 0 veya = 0 ise ödeme yapılmış demektir
          if (order.Bakiye && order.Bakiye > 0) {
            console.log(`⏭️ Skipping order ${order.SiparisNo}: Ödeme bekleniyor (Bakiye: ${order.Bakiye} TL)`)
            return false
          }
          return true
        })
        .map((order) => {
          console.log(`📦 Order ${order.SiparisNo}: Urunler=${order.Urunler ? order.Urunler.length : 0}`)

          const mappedStatus = this.mapTicimaxStatus(order.SiparisDurumID, order.SiparisDurum)

          return {
            orderId: order.ID.toString(),
          orderNumber: order.SiparisNo,
          orderDate: order.SiparisTarihi,
          status: mappedStatus,
          ticimaxStatus: order.SiparisDurum,  // Ticimax orijinal durum adı
          customer: {
            name: `${order.UyeAdi} ${order.UyeSoyadi}`.trim(),
            phone: order.UyeTelefon || '',
            address: `${order.AdresBaslik ? order.AdresBaslik + ' - ' : ''}${order.Adres}`,
          },
          products: (order.Urunler || []).map((item) => {
            // SiparisToplamTutari zaten KDV + Kargo dahil toplam tutar
            // Bu tutarı ürün adedine bölerek birim fiyat hesaplıyoruz
            const totalQuantity = (order.Urunler || []).reduce((sum, u) => sum + u.Adet, 0)
            const pricePerUnit = order.SiparisToplamTutari / totalQuantity

            return {
              productName: item.UrunAdi,
              sku: item.Barkod || item.StokKodu,
              stockCode: item.StokKodu,
              quantity: item.Adet,
              price: pricePerUnit, // KDV dahil birim fiyat
              imageUrl: item.ResimURL,
            }
          }),
          // SiparisToplamTutari = KDV + Kargo dahil toplam tutar (doğru alan!)
          total: order.SiparisToplamTutari,
          trackingNumber: order.KargoTakipNo,
          cargoCompany: order.KargoFirmaAdi,
          paymentType: order.OdemeTipi,
          paymentMethod: order.OdemeTipiAdi,
        }
      })

      // Return all orders (no pagination)
      console.log(`🔍 DEBUG: ordersWithItems.length = ${ordersWithItems.length}`)
      console.log(`🔍 DEBUG: Returning ${ordersWithItems.length} orders to route`)

      return {
        data: ordersWithItems,
        total: ordersWithItems.length,
        page: 1,
        limit: 100,
      }
    } catch (error: any) {
      console.error('Bolbolbul API Error:', error.message)
      throw new Error(`Bolbolbul API Error: ${error.message}`)
    }
  }

  /**
   * Get order details by order ID
   */
  async getOrderDetails(orderId: string): Promise<BolbolbulOrder> {
    try {
      // Since Ticimax doesn't have a single order endpoint, we fetch all and filter
      const response = await this.getOrders()
      const order = response.data.find((o) => o.orderId === orderId)

      if (!order) {
        throw new Error(`Order not found: ${orderId}`)
      }

      return order
    } catch (error: any) {
      console.error('Bolbolbul API Error:', error.message)
      throw new Error(`Bolbolbul API Error: ${error.message}`)
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId: string, statusId: number, orderNumber?: string): Promise<void> {
    try {
      await this.ticimaxClient.setSiparisDurum(parseInt(orderId), statusId, orderNumber)
    } catch (error: any) {
      console.error('Bolbolbul API Error:', error.message)
      throw new Error(`Bolbolbul API Error: ${error.message}`)
    }
  }

  /**
   * Mark order as shipped with tracking number
   */
  async markAsShipped(
    orderId: string,
    trackingNumber: string,
    cargoCompany?: string
  ): Promise<void> {
    try {
      await this.ticimaxClient.setSiparisKargoyaVerildi(
        parseInt(orderId),
        trackingNumber,
        cargoCompany
      )
    } catch (error: any) {
      console.error('Bolbolbul API Error:', error.message)
      throw new Error(`Bolbolbul API Error: ${error.message}`)
    }
  }

  /**
   * Map Ticimax status to internal status string
   * @param statusId - Ticimax status ID
   * @param statusName - Ticimax status name (optional, used for more accurate mapping)
   */
  private mapTicimaxStatus(statusId: number, statusName?: string): string {
    // Öncelik: Statü ismine göre eşleştir (daha doğru)
    // getDurumName() fonksiyonu tüm durum adlarını döner, bu mapping ile eşleşmeli
    if (statusName) {
      const nameMap: Record<string, string> = {
        // PENDING (ID: 0, 1, 3)
        'Ön sipariş': 'PENDING',
        'Onay bekliyor': 'PENDING',
        'Ödeme bekliyor': 'PENDING',

        // PROCESSING (ID: 2, 4, 5)
        'Onaylandı': 'PROCESSING',
        'Paketleniyor': 'PROCESSING',
        'Tedarik ediliyor': 'PROCESSING',

        // SHIPPED (ID: 6)
        'Kargoya verildi': 'SHIPPED',

        // COMPLETED (ID: 7)
        'Teslim edildi': 'COMPLETED',

        // CANCELLED (ID: 8-17)
        'İptal edildi': 'CANCELLED',
        'İade edildi': 'CANCELLED',
        'Silinmiş': 'CANCELLED',
        'İade talebi alındı': 'CANCELLED',
        'İade ulaştı ödeme yapılacak': 'CANCELLED',
        'İade ödemesi yapıldı': 'CANCELLED',
        'Teslimat öncesi iptal talebi': 'CANCELLED',
        'İptal talebi': 'CANCELLED',
        'Kısmi iade talebi': 'CANCELLED',
        'Kısmi iade yapıldı': 'CANCELLED',
      }

      if (nameMap[statusName]) {
        return nameMap[statusName]
      }
    }

    // Fallback: ID'ye göre (ticimax-soap.ts getDurumName() ile uyumlu)
    const idMap: Record<number, string> = {
      0: 'PENDING',        // Ön sipariş
      1: 'PENDING',        // Onay bekliyor
      2: 'PROCESSING',     // Onaylandı
      3: 'PENDING',        // Ödeme bekliyor
      4: 'PROCESSING',     // Paketleniyor
      5: 'PROCESSING',     // Tedarik ediliyor
      6: 'SHIPPED',        // Kargoya verildi
      7: 'COMPLETED',      // Teslim edildi
      8: 'CANCELLED',      // İptal edildi
      9: 'CANCELLED',      // İade edildi
      10: 'CANCELLED',     // Silinmiş
      11: 'CANCELLED',     // İade talebi alındı
      12: 'CANCELLED',     // İade ulaştı ödeme yapılacak
      13: 'CANCELLED',     // İade ödemesi yapıldı
      14: 'CANCELLED',     // Teslimat öncesi iptal talebi
      15: 'CANCELLED',     // İptal talebi
      16: 'CANCELLED',     // Kısmi iade talebi
      17: 'CANCELLED',     // Kısmi iade yapıldı
    }

    return idMap[statusId] || 'PENDING'
  }

  /**
   * Create 3-month date chunks from start to end date
   * Ticimax API works better with smaller date ranges (3 months)
   */
  private createDateChunks(
    startDate?: string,
    endDate?: string
  ): Array<{ start: string; end: string }> {
    const end = endDate ? new Date(endDate) : new Date()
    const start = startDate ? new Date(startDate) : new Date(end.getTime() - 365 * 24 * 60 * 60 * 1000) // Default 1 year back

    const chunks: Array<{ start: string; end: string }> = []
    let currentStart = new Date(start)

    while (currentStart < end) {
      // Add 3 months to current start
      const currentEnd = new Date(currentStart)
      currentEnd.setMonth(currentEnd.getMonth() + 3)

      // Don't exceed the end date
      if (currentEnd > end) {
        currentEnd.setTime(end.getTime())
      }

      chunks.push({
        start: currentStart.toISOString().split('T')[0], // YYYY-MM-DD
        end: currentEnd.toISOString().split('T')[0], // YYYY-MM-DD
      })

      // Move to next chunk
      currentStart = new Date(currentEnd.getTime() + 24 * 60 * 60 * 1000) // Add 1 day to avoid overlap
    }

    return chunks
  }
}

// Singleton instance
let bolbolbulClient: BolbolbulAPIClient | null = null

export function getBolbolbulClient(): BolbolbulAPIClient {
  if (!bolbolbulClient) {
    bolbolbulClient = new BolbolbulAPIClient()
  }
  return bolbolbulClient
}

export default getBolbolbulClient
