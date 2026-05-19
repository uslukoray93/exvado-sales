/**
 * Bolbolbul API Client
 * API Documentation: Custom implementation based on Bolbolbul's API
 */

import axios, { AxiosInstance } from 'axios'

export interface BolbolbulOrder {
  orderId: string
  orderNumber: string
  orderDate: string
  status: string
  customer: {
    name: string
    phone: string
    address: string
  }
  products: Array<{
    productName: string
    sku: string
    quantity: number
    price: number
  }>
  total: number
  trackingNumber?: string
}

export interface BolbolbulOrdersResponse {
  data: BolbolbulOrder[]
  total: number
  page: number
  limit: number
}

class BolbolbulAPIClient {
  private client: AxiosInstance
  private apiKey: string
  private apiSecret: string

  constructor() {
    this.apiKey = process.env.BOLBOLBUL_API_KEY || ''
    this.apiSecret = process.env.BOLBOLBUL_API_SECRET || ''

    this.client = axios.create({
      baseURL: 'https://api.bolbolbul.com/v1', // Example base URL
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
        'X-API-Secret': this.apiSecret,
        'User-Agent': 'ExvadoSales',
      },
    })
  }

  /**
   * Fetch orders from Bolbolbul
   * @param options - Query options (page, limit, date range, status)
   */
  async getOrders(options?: {
    page?: number
    limit?: number
    startDate?: string // ISO date string
    endDate?: string // ISO date string
    status?: string
  }): Promise<BolbolbulOrdersResponse> {
    try {
      const params: any = {
        page: options?.page || 1,
        limit: options?.limit || 50,
      }

      if (options?.startDate) params.start_date = options.startDate
      if (options?.endDate) params.end_date = options.endDate
      if (options?.status) params.status = options.status

      const response = await this.client.get('/orders', { params })

      return response.data
    } catch (error: any) {
      console.error('Bolbolbul API Error:', error.response?.data || error.message)
      throw new Error(`Bolbolbul API Error: ${error.response?.data?.message || error.message}`)
    }
  }

  /**
   * Get order details by order ID
   */
  async getOrderDetails(orderId: string): Promise<BolbolbulOrder> {
    try {
      const response = await this.client.get(`/orders/${orderId}`)
      return response.data
    } catch (error: any) {
      console.error('Bolbolbul API Error:', error.response?.data || error.message)
      throw new Error(`Bolbolbul API Error: ${error.response?.data?.message || error.message}`)
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId: string, status: string): Promise<void> {
    try {
      await this.client.patch(`/orders/${orderId}`, {
        status,
      })
    } catch (error: any) {
      console.error('Bolbolbul API Error:', error.response?.data || error.message)
      throw new Error(`Bolbolbul API Error: ${error.response?.data?.message || error.message}`)
    }
  }

  /**
   * Mark order as shipped with tracking number
   */
  async markAsShipped(orderId: string, trackingNumber: string): Promise<void> {
    try {
      await this.client.post(`/orders/${orderId}/ship`, {
        trackingNumber,
      })
    } catch (error: any) {
      console.error('Bolbolbul API Error:', error.response?.data || error.message)
      throw new Error(`Bolbolbul API Error: ${error.response?.data?.message || error.message}`)
    }
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
