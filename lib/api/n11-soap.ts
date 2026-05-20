import * as soap from 'soap'

/**
 * N11 SOAP API Client
 * WSDL Endpoints:
 * - ShipmentCompany: https://api.n11.com/ws/ShipmentCompanyService.wsdl
 * - Order: https://api.n11.com/ws/OrderService.wsdl
 */

export interface N11ShipmentCompany {
  id: number
  name: string
  shortName: string
}

export interface N11OrderItem {
  id: number // orderLineId from REST API response
  shipmentInfo: {
    shipmentCompany: {
      id: number // Kargo şirketi ID
    }
    campaignNumber?: string // Kampanya kodu (barkod)
    trackingNumber?: string // Takip numarası
    shipmentMethod: number // 1: Kargo, 2: Diğer
  }
}

export class N11SoapClient {
  private apiKey: string
  private apiSecret: string

  constructor(apiKey?: string, apiSecret?: string) {
    this.apiKey = apiKey || process.env.N11_API_KEY || ''
    this.apiSecret = apiSecret || process.env.N11_API_SECRET || ''
  }

  /**
   * Get all shipment companies (kargo firmalarını listele)
   */
  async getShipmentCompanies(): Promise<N11ShipmentCompany[]> {
    const wsdlUrl = 'https://api.n11.com/ws/ShipmentCompanyService.wsdl'

    return new Promise((resolve, reject) => {
      soap.createClient(wsdlUrl, (err, client) => {
        if (err) {
          console.error('SOAP client error:', err)
          return reject(err)
        }

        const args = {
          auth: {
            appKey: this.apiKey,
            appSecret: this.apiSecret,
          },
        }

        client.GetShipmentCompanies(args, (err: any, result: any) => {
          if (err) {
            console.error('GetShipmentCompanies error:', err)
            return reject(err)
          }

          // Check result status
          if (result.result?.status !== 'success') {
            console.error('GetShipmentCompanies failed:', result.result)
            return reject(new Error(result.result?.errorMessage || 'Failed to get shipment companies'))
          }

          const companies = result.shipmentCompanies?.shipmentCompany || []

          // Convert to array if single item
          const companiesArray = Array.isArray(companies) ? companies : [companies]

          resolve(companiesArray.map((c: any) => ({
            id: c.id,
            name: c.name,
            shortName: c.shortName,
          })))
        })
      })
    })
  }

  /**
   * Make order item shipment (sipariş için kargo firması belirle/değiştir)
   * @param orderLineId - GetShipmentPackages'dan dönen lines.orderLineId
   * @param shipmentCompanyId - Kargo şirketi ID
   * @param campaignNumber - Kampanya numarası (opsiyonel)
   * @param trackingNumber - Takip numarası (opsiyonel)
   */
  async makeOrderItemShipment(
    orderLineId: number,
    shipmentCompanyId: number,
    campaignNumber?: string,
    trackingNumber?: string
  ): Promise<any> {
    const wsdlUrl = 'https://api.n11.com/ws/OrderService.wsdl'

    return new Promise((resolve, reject) => {
      soap.createClient(wsdlUrl, (err, client) => {
        if (err) {
          console.error('SOAP client error:', err)
          return reject(err)
        }

        // IMPORTANT: Don't send campaignNumber to generate new code
        // N11 will create a new campaign code when changing carrier
        const shipmentInfo: any = {
          shipmentCompany: {
            id: shipmentCompanyId,
          },
          trackingNumber: trackingNumber || '000000000', // N11 requires tracking number
          shipmentMethod: 1, // 1: Kargo
        }

        // Only include campaignNumber if explicitly provided and not empty
        if (campaignNumber && campaignNumber.trim() !== '') {
          shipmentInfo.campaignNumber = campaignNumber
        }

        const args = {
          auth: {
            appKey: this.apiKey,
            appSecret: this.apiSecret,
          },
          orderItemList: {
            orderItem: {
              id: orderLineId,
              shipmentInfo: shipmentInfo,
            },
          },
        }

        console.log('MakeOrderItemShipment args:', JSON.stringify(args, null, 2))

        client.MakeOrderItemShipment(args, (err: any, result: any) => {
          if (err) {
            console.error('MakeOrderItemShipment error:', err)
            return reject(err)
          }

          console.log('MakeOrderItemShipment result:', JSON.stringify(result, null, 2))

          // Check result status
          if (result.result?.status !== 'success') {
            console.error('MakeOrderItemShipment failed:', result.result)

            // Parse N11 error messages
            let errorMessage = result.result?.errorMessage || 'Failed to make order item shipment'

            // Translate common N11 errors to Turkish
            if (result.result?.errorCode === 'SELLER_API.payOnPlatformItem') {
              errorMessage = 'Bu sipariş için kargo firması değiştirilemez (kargo ücreti müşteri tarafından ödendi)'
            } else if (result.result?.errorCode === 'SELLER_API.nullParam') {
              errorMessage = 'Eksik parametre: ' + errorMessage
            }

            return reject(new Error(errorMessage))
          }

          resolve(result)
        })
      })
    })
  }

  /**
   * Get order detail to retrieve orderLineId
   * Bu servisi kullanarak REST API'den gelen paket ID'sine karşılık orderLineId bulabiliriz
   */
  async getOrderDetail(orderId: number): Promise<any> {
    const wsdlUrl = 'https://api.n11.com/ws/OrderService.wsdl'

    return new Promise((resolve, reject) => {
      soap.createClient(wsdlUrl, (err, client) => {
        if (err) {
          console.error('SOAP client error:', err)
          return reject(err)
        }

        const args = {
          auth: {
            appKey: this.apiKey,
            appSecret: this.apiSecret,
          },
          orderRequest: {
            id: orderId,
          },
        }

        client.OrderDetail(args, (err: any, result: any) => {
          if (err) {
            console.error('OrderDetail error:', err)
            return reject(err)
          }

          if (result.result?.status !== 'success') {
            console.error('OrderDetail failed:', result.result)
            return reject(new Error(result.result?.errorMessage || 'Failed to get order detail'))
          }

          // LOG: Check if orderNumber exists in response
          const orderData = result.orderDetail || result
          console.log(`🔍 N11 SOAP OrderDetail Response - ID: ${orderData.id}, orderNumber: ${orderData.orderNumber || 'MISSING'}`)

          // FIX: Return orderData (with orderNumber) instead of result
          resolve(orderData)
        })
      })
    })
  }

  /**
   * Update order item status (sipariş durumu güncelle)
   * N11 uses OrderItemAccept to approve orders (status 1 -> 2/3)
   * @param orderItemId - Order item ID (SKU)
   * @param status - Status code (1-11) - currently only accepts "3" (Hazırlanıyor)
   */
  async updateOrderItemStatus(orderItemId: number, status: string): Promise<void> {
    const wsdlUrl = 'https://api.n11.com/ws/OrderService.wsdl'

    return new Promise((resolve, reject) => {
      soap.createClient(wsdlUrl, (err, client) => {
        if (err) {
          console.error('SOAP client error:', err)
          return reject(err)
        }

        // N11 only supports OrderItemAccept to move from "Yeni" to "Hazırlanıyor"
        // Status 3 = Hazırlanıyor (Processing/Preparing)
        if (status !== '3') {
          return reject(new Error(`N11 sadece "Hazırlanıyor" (status 3) durumuna geçişi destekler. İstenen status: ${status}`))
        }

        const args = {
          auth: {
            appKey: this.apiKey,
            appSecret: this.apiSecret,
          },
          orderItemList: {
            orderItem: {
              id: orderItemId,
            },
          },
        }

        console.log('OrderItemAccept args:', JSON.stringify(args, null, 2))

        // Use OrderItemAccept to approve the order
        if (!client.OrderItemAccept) {
          return reject(new Error('N11 WSDL\'de OrderItemAccept fonksiyonu bulunamadı'))
        }

        client.OrderItemAccept(args, (err: any, result: any) => {
          if (err) {
            console.error('OrderItemAccept error:', err)
            return reject(err)
          }

          console.log('OrderItemAccept result:', JSON.stringify(result, null, 2))

          if (result.result?.status !== 'success') {
            console.error('OrderItemAccept failed:', result.result)

            // Parse N11 error messages
            let errorMessage = result.result?.errorMessage || 'Failed to accept order item'

            // Translate common N11 errors to Turkish
            if (result.result?.errorCode === 'SELLER_API.alreadyAccepted') {
              errorMessage = 'Bu sipariş zaten onaylanmış durumda'
            } else if (result.result?.errorCode === 'SELLER_API.notFound') {
              errorMessage = 'Sipariş bulunamadı veya zaten işlenmiş'
            }

            return reject(new Error(errorMessage))
          }

          resolve()
        })
      })
    })
  }
}

/**
 * Get singleton instance
 */
export function getN11SoapClient(apiKey?: string, apiSecret?: string): N11SoapClient {
  return new N11SoapClient(apiKey, apiSecret)
}
