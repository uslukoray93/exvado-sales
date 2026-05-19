/**
 * N11 REST API Client
 *
 * N11 has migrated from SOAP to REST API as of 2024.
 * This client uses the new REST endpoints.
 *
 * Documentation: https://magazadestek.n11.com/satis-surecleri?id=1006
 */

import axios, { AxiosInstance } from 'axios'

export interface N11RestOrder {
  orderNumber: string
  id: string // Package ID
  customerfullName: string
  customerEmail: string
  customerId: string
  taxId?: string
  taxOffice?: string
  tcIdentityNumber?: string
  cargoSenderNumber?: string
  cargoTrackingNumber?: string
  cargoTrackingLink?: string
  shipmentCompanyId?: string
  cargoProviderName?: string
  shipmentMethod?: number
  lastModifiedDate: number // timestamp
  agreedDeliveryDate?: number // timestamp
  totalAmount: number
  totalDiscountAmount: number
  shipmentPackageStatus: string // Created, Picking, Shipped, Cancelled, Delivered, UnPacked, UnSupplied
  sellerId: string
  billingAddress: {
    address: string
    city: string
    district: string
    neighborhood?: string
    fullName: string
    gsm: string
    tcId?: string
    postalCode?: string
    taxId?: string
    taxHouse?: string
    invoiceType: number // 1: Individual, 2: Corporate
  }
  shippingAddress: {
    address: string
    city: string
    district: string
    neighborhood?: string
    fullName: string
    gsm: string
    tcId?: string
    postalCode?: string
  }
  lines: Array<{
    quantity: number
    productId: string
    productName: string
    stockCode: string
    variantAttributes?: any
    customTextOptionValues?: any
    price: number
    dueAmount: number
    installmentChargeWithVAT?: number
    sellerCouponDiscount?: number
    sellerDiscount?: number
    sellerInvoiceAmount: number
    totalSellerDiscountPrice?: number
    mallDiscount?: number
    totalMallDiscountPrice?: number
    orderLineId: string
    orderItemLineItemStatusName?: string
  }>
  packageHistories?: Array<{
    status: string
    date: number
  }>
}

export interface N11RestOrdersResponse {
  totalElements: number
  totalPages: number
  page: number
  size: number
  content: N11RestOrder[]
}

export class N11RestClient {
  private client: AxiosInstance
  private apiKey: string
  private apiSecret: string

  constructor(apiKey?: string, apiSecret?: string) {
    this.apiKey = apiKey || process.env.N11_API_KEY || ''
    this.apiSecret = apiSecret || process.env.N11_API_SECRET || ''

    console.log('🔑 N11 REST API Keys loaded:', {
      apiKey: this.apiKey ? `${this.apiKey.substring(0, 10)}...` : 'MISSING',
      apiSecret: this.apiSecret ? `${this.apiSecret.substring(0, 4)}...` : 'MISSING'
    })

    this.client = axios.create({
      baseURL: 'https://api.n11.com/rest',
      headers: {
        'appkey': this.apiKey,
        'appsecret': this.apiSecret,
      },
      timeout: 30000,
    })
  }

  /**
   * Get orders from N11 REST API
   * @param options Query options
   */
  async getOrders(options?: {
    page?: number
    size?: number
    status?: 'Created' | 'Picking' | 'Shipped' | 'Cancelled' | 'Delivered' | 'UnPacked' | 'UnSupplied'
    orderNumber?: string
    packageIds?: string
    startDate?: number // timestamp (milliseconds) GMT+3
    endDate?: number // timestamp (milliseconds) GMT+3
    orderByDirection?: 'ASC' | 'DESC'
    orderByField?: boolean
  }): Promise<N11RestOrdersResponse> {
    try {
      const params: any = {
        page: options?.page || 0,
        size: options?.size || 100,
      }

      if (options?.status) params.status = options.status
      if (options?.orderNumber) params.orderNumber = options.orderNumber
      if (options?.packageIds) params.packageIds = options.packageIds
      if (options?.startDate) params.startDate = options.startDate
      if (options?.endDate) params.endDate = options.endDate
      if (options?.orderByDirection) params.orderByDirection = options.orderByDirection
      if (options?.orderByField !== undefined) params.orderByField = options.orderByField

      console.log('📤 N11 REST API Request:', JSON.stringify(params, null, 2))

      const response = await this.client.get<N11RestOrdersResponse>(
        '/delivery/v1/shipmentPackages',
        { params }
      )

      console.log('📥 N11 REST API Response:', {
        totalElements: response.data.totalElements,
        totalPages: response.data.totalPages,
        page: response.data.page,
        ordersCount: response.data.content?.length || 0
      })

      return response.data
    } catch (error: any) {
      console.error('N11 REST API Error:', error.response?.data || error.message)
      throw error
    }
  }

  /**
   * Get order details by order number
   */
  async getOrderByNumber(orderNumber: string): Promise<N11RestOrder | null> {
    const response = await this.getOrders({
      orderNumber,
      size: 1
    })

    return response.content[0] || null
  }

  /**
   * Get order details by package ID
   */
  async getOrderByPackageId(packageId: string): Promise<N11RestOrder | null> {
    const response = await this.getOrders({
      packageIds: packageId,
      size: 1
    })

    return response.content[0] || null
  }

  /**
   * Update order status to "Picking" (approve/accept order)
   * @param lineIds - Array of order line IDs from GetShipmentPackages response
   */
  async updateOrderStatus(lineIds: number[]): Promise<{ success: boolean; results: any[] }> {
    try {
      console.log('📤 N11 REST UpdateOrder Request:', JSON.stringify({ lineIds, status: 'Picking' }, null, 2))

      const response = await this.client.put(
        '/order/v1/update',
        {
          lines: lineIds.map(lineId => ({ lineId })),
          status: 'Picking'
        }
      )

      console.log('📥 N11 REST UpdateOrder Response:', JSON.stringify(response.data, null, 2))

      // Check if all items were successful
      const results = response.data.content || []
      const allSuccess = results.every((r: any) => r.status === 'SUCCESS')

      return {
        success: allSuccess,
        results
      }
    } catch (error: any) {
      console.error('❌ N11 REST UpdateOrder Error:', error.response?.data || error.message)
      throw new Error(`N11 status update failed: ${error.response?.data?.message || error.message}`)
    }
  }
}

/**
 * Get singleton instance
 */
let n11RestClientInstance: N11RestClient | null = null

export function getN11RestClient(): N11RestClient {
  if (!n11RestClientInstance) {
    n11RestClientInstance = new N11RestClient()
  }
  return n11RestClientInstance
}
