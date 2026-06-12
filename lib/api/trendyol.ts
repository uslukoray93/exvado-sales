/**
 * Trendyol API Client
 * Official API Documentation: https://developers.trendyol.com/
 */

import axios, { AxiosInstance } from 'axios'

export interface TrendyolOrder {
  orderId: string
  orderNumber: string
  orderDate: number
  status: string
  customerName: string
  customerPhone: string
  customerAddress: string
  lines: Array<{
    productName: string
    merchantSku?: string
    barcode: string
    quantity: number
    price: number
  }>
  totalPrice: number
  cargoTrackingNumber?: string
}

export interface TrendyolOrdersResponse {
  content: TrendyolOrder[]
  page: number
  size: number
  totalElements: number
}

export interface TrendyolQuestion {
  id: number
  customerId: number
  customerName: string
  creationDate: number
  text: string
  imageUrl?: string
  productId: string
  productName: string
  answered: boolean
  answer?: {
    text: string
    answerDate: number
  }
}

export interface TrendyolQuestionsResponse {
  content: TrendyolQuestion[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

class TrendyolAPIClient {
  private client: AxiosInstance
  private apiKey: string
  private apiSecret: string
  private supplierId: string

  constructor() {
    this.apiKey = process.env.TRENDYOL_API_KEY || ''
    this.apiSecret = process.env.TRENDYOL_API_SECRET || ''
    this.supplierId = process.env.TRENDYOL_SUPPLIER_ID || ''

    // Trendyol'da sipariş çekme için eski API kullanılıyor
    this.client = axios.create({
      baseURL: 'https://api.trendyol.com/sapigw/suppliers',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': `${this.supplierId} - ExvadoSales`,
      },
      auth: {
        username: this.apiKey,
        password: this.apiSecret,
      },
    })
  }

  /**
   * Fetch orders from Trendyol
   * @param options - Query options (page, size, date range, status)
   */
  async getOrders(options?: {
    page?: number
    size?: number
    startDate?: number // timestamp
    endDate?: number // timestamp
    status?: string
  }): Promise<TrendyolOrdersResponse> {
    try {
      const params: any = {
        page: options?.page || 0,
        size: options?.size || 50,
      }

      if (options?.startDate) params.startDate = options.startDate
      if (options?.endDate) params.endDate = options.endDate
      if (options?.status) params.status = options.status

      const response = await this.client.get(`/${this.supplierId}/orders`, {
        params,
      })

      return response.data
    } catch (error: any) {
      console.error('Trendyol API Error:', error.response?.data || error.message)
      throw new Error(`Trendyol API Error: ${error.response?.data?.message || error.message}`)
    }
  }

  /**
   * Get product image by barcode from Trendyol Product API
   */
  async getProductImage(barcode: string): Promise<string | null> {
    try {
      // Trendyol Product API: Get product by barcode
      const response = await this.client.get(`/${this.supplierId}/products`, {
        params: {
          barcode: barcode,
          approved: true // Only get approved products
        }
      })

      if (response.data && response.data.content && response.data.content.length > 0) {
        const product = response.data.content[0]
        // Get first image from images array
        if (product.images && product.images.length > 0) {
          return product.images[0].url
        }
      }

      return null
    } catch (error: any) {
      console.error(`Failed to get Trendyol product image for barcode ${barcode}:`, error.message)
      return null
    }
  }

  /**
   * Get order details by order number (to find shipmentPackageId)
   */
  async getOrderByNumber(orderNumber: string): Promise<any> {
    try {
      // Trendyol'dan orderNumber ile sipariş çek
      const response = await this.client.get(`/${this.supplierId}/orders`, {
        params: {
          orderNumber: orderNumber
        }
      })

      console.log('Trendyol getOrderByNumber response:', JSON.stringify(response.data, null, 2))

      if (response.data.content && response.data.content.length > 0) {
        return response.data.content[0]
      }

      throw new Error(`Order not found: ${orderNumber}`)
    } catch (error: any) {
      console.error('Trendyol getOrderByNumber Error:', error.response?.data || error.message)
      throw new Error(`Trendyol API Error: ${error.response?.data?.message || error.message}`)
    }
  }

  /**
   * Update package status (Picking or Invoiced)
   * @param packageId - Trendyol package ID
   * @param status - "Picking" or "Invoiced"
   * @param lines - Order line items with lineId and quantity
   */
  async updatePackageStatus(
    packageId: string,
    status: 'Picking' | 'Invoiced',
    lines: Array<{ lineId: number; quantity: number }>
  ): Promise<void> {
    try {
      const payload: any = {
        status,
        lines
      }

      // Invoiced durumu için invoiceNumber gerekebilir (opsiyonel)
      if (status === 'Invoiced') {
        payload.params = {
          // invoiceNumber ileride eklenebilir
        }
      }

      console.log('📤 Trendyol updatePackageStatus isteği:')
      console.log('Package ID:', packageId)
      console.log('Yeni Status:', status)
      console.log('Lines:', lines)
      console.log('Payload:', JSON.stringify(payload, null, 2))

      // Integration API için yeni client oluştur (eski API değil!)
      // Base URL: https://apigw.trendyol.com/integration/order/sellers
      const authString = Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString('base64')

      const integrationClient = axios.create({
        baseURL: 'https://apigw.trendyol.com/integration/order/sellers',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': `${this.supplierId} - ExvadoSales`,
          'Authorization': `Basic ${authString}`,
          'storeFrontCode': 'TR',
        },
      })

      const response = await integrationClient.put(
        `/${this.supplierId}/shipment-packages/${packageId}`,
        payload
      )

      console.log('✅ Trendyol updatePackageStatus başarılı!')
      console.log('Response:', JSON.stringify(response.data, null, 2))
    } catch (error: any) {
      // Detaylı hata logları
      console.error('❌ Trendyol updatePackageStatus Error:')
      console.error('Error Message:', error.message)
      if (error.response) {
        console.error('Response Status:', error.response.status)
        console.error('Response Data:', JSON.stringify(error.response.data, null, 2))
        console.error('Response Headers:', error.response.headers)
      }
      if (error.config) {
        console.error('Request Method:', error.config.method?.toUpperCase())
        console.error('Request URL:', error.config.baseURL + error.config.url)
        console.error('Request Headers:', JSON.stringify(error.config.headers, null, 2))
        console.error('Request Data:', error.config.data)
      }

      throw new Error(`Trendyol API Error: ${error.response?.data?.message || error.message}`)
    }
  }

  /**
   * Get shipping label for order
   */
  async getShippingLabel(orderId: string): Promise<string> {
    try {
      const response = await this.client.get(
        `/${this.supplierId}/orders/${orderId}/shipment-label`
      )
      return response.data.url || response.data
    } catch (error: any) {
      console.error('Trendyol API Error:', error.response?.data || error.message)
      throw new Error(`Trendyol API Error: ${error.response?.data?.message || error.message}`)
    }
  }

  /**
   * Update cargo provider for shipment package
   * @param packageId - Package ID
   * @param cargoCompany - Cargo company name (e.g., "Aras Kargo", "Yurtiçi Kargo")
   */
  async updateCargoProvider(packageId: string, cargoCompany: string): Promise<void> {
    try {
      // Map cargo company names to Trendyol codes (Trendyol resmi kodları)
      const cargoProviderMap: { [key: string]: string } = {
        'yurtici-kargo': 'YKMP',
        'yurtiçi kargo': 'YKMP',
        'surat-kargo': 'SURATMP',
        'sürat kargo': 'SURATMP',
        'dhl-ecommerce': 'DHLECOMMP',
        'dhl ecommerce': 'DHLECOMMP',
        'dhl': 'DHLECOMMP',
        'ptt-kargo': 'PTTMP',
        'ptt kargo': 'PTTMP',
        'kolay-gelsin': 'KOLAYGELSINMP',
        'kolay gelsin': 'KOLAYGELSINMP',
        'horoz-kargo': 'HOROZMP',
        'horoz kargo': 'HOROZMP',
        'horoz lojistik': 'HOROZMP',
        'ceva-lojistik': 'CEVAMP',
        'ceva lojistik': 'CEVAMP',
        'ceva logistics': 'CEVAMP',
        'aras-kargo': 'ARASMP',
        'aras kargo': 'ARASMP',
        'trendyol-express': 'TEXMP',
        'trendyol express': 'TEXMP',
      }

      const cargoCode = cargoProviderMap[cargoCompany.toLowerCase()] || 'ARASMP'

      // Yeni Integration API endpoint kullan
      const integrationClient = axios.create({
        baseURL: 'https://apigw.trendyol.com/integration/order',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': `${this.supplierId} - ExvadoSales`,
        },
        auth: {
          username: this.apiKey,
          password: this.apiSecret,
        },
      })

      await integrationClient.put(
        `/sellers/${this.supplierId}/shipment-packages/${packageId}/cargo-providers`,
        {
          cargoProvider: cargoCode
        }
      )
    } catch (error: any) {
      console.error('Trendyol Update Cargo Provider Error:', error.response?.data || error.message)
      throw new Error(`Trendyol API Error: ${error.response?.data?.message || error.message}`)
    }
  }

  /**
   * Upload invoice file to Trendyol
   * @param shipmentPackageId - Shipment package ID
   * @param file - Invoice file (PDF, JPEG, or PNG, max 10MB)
   * @param invoiceNumber - Optional invoice number (required for micro-export)
   * @param invoiceDateTime - Optional invoice date as Unix timestamp
   */
  async uploadInvoice(
    shipmentPackageId: string,
    file: File | Buffer,
    invoiceNumber?: string,
    invoiceDateTime?: number
  ): Promise<void> {
    try {
      const FormData = require('form-data')
      const formData = new FormData()

      // Add required fields
      formData.append('shipmentPackageId', shipmentPackageId)
      formData.append('file', file)

      // Add optional fields
      if (invoiceNumber) {
        formData.append('invoiceNumber', invoiceNumber)
      }
      if (invoiceDateTime) {
        formData.append('invoiceDateTime', invoiceDateTime.toString())
      }

      console.log('📤 Trendyol uploadInvoice isteği:')
      console.log('Shipment Package ID:', shipmentPackageId)
      console.log('Invoice Number:', invoiceNumber || 'N/A')
      console.log('Invoice Date:', invoiceDateTime ? new Date(invoiceDateTime).toISOString() : 'N/A')

      // Integration API için client oluştur
      const integrationClient = axios.create({
        baseURL: 'https://apigw.trendyol.com/integration',
        headers: {
          ...formData.getHeaders(),
          'User-Agent': `${this.supplierId} - ExvadoSales`,
        },
        auth: {
          username: this.apiKey,
          password: this.apiSecret,
        },
      })

      const response = await integrationClient.post(
        `/sellers/${this.supplierId}/seller-invoice-file`,
        formData
      )

      console.log('✅ Fatura başarıyla yüklendi!')
      console.log('Response:', JSON.stringify(response.data, null, 2))
    } catch (error: any) {
      console.error('❌ Trendyol uploadInvoice Error:')
      console.error('Error Message:', error.message)
      if (error.response) {
        console.error('Response Status:', error.response.status)
        console.error('Response Data:', JSON.stringify(error.response.data, null, 2))
      }
      throw new Error(`Trendyol API Error: ${error.response?.data?.message || error.message}`)
    }
  }

  /**
   * Get customer questions from Trendyol
   * @param options - Query options (page, size, status filter, date range)
   */
  async getQuestions(options?: {
    page?: number
    size?: number
    status?: 'WAITING_FOR_ANSWER' | 'ANSWERED' | 'REPORTED' | 'REJECTED' | 'UNANSWERED'
    startDate?: number // timestamp in milliseconds
    endDate?: number // timestamp in milliseconds
  }): Promise<TrendyolQuestionsResponse> {
    try {
      // Integration API için client oluştur
      const integrationClient = axios.create({
        baseURL: 'https://apigw.trendyol.com/integration/qna',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': `${this.supplierId} - ExvadoSales`,
        },
        auth: {
          username: this.apiKey,
          password: this.apiSecret,
        },
      })

      const params: any = {
        supplierId: this.supplierId,
        page: options?.page || 0,
        size: options?.size || 50,
      }

      // Tarih aralığı (varsayılan: son 2 hafta)
      if (options?.startDate) {
        params.startDate = options.startDate
      } else {
        params.startDate = Date.now() - 14 * 24 * 60 * 60 * 1000 // 2 weeks ago
      }

      if (options?.endDate) {
        params.endDate = options.endDate
      } else {
        params.endDate = Date.now()
      }

      if (options?.status) {
        params.status = options.status
      }

      const response = await integrationClient.get(
        `/sellers/${this.supplierId}/questions/filter`,
        { params }
      )

      return response.data
    } catch (error: any) {
      console.error('Trendyol API Error:', error.response?.data || error.message)
      throw new Error(`Trendyol API Error: ${error.response?.data?.message || error.message}`)
    }
  }

  /**
   * Answer a customer question
   * @param questionId - Question ID
   * @param answerText - Answer text (10-2000 characters)
   */
  async answerQuestion(questionId: number, answerText: string): Promise<void> {
    try {
      // Validate answer text length
      if (answerText.length < 10 || answerText.length > 2000) {
        throw new Error('Cevap metni 10-2000 karakter arasında olmalıdır')
      }

      // Integration API için client oluştur
      const integrationClient = axios.create({
        baseURL: 'https://apigw.trendyol.com/integration/qna',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': `${this.supplierId} - ExvadoSales`,
        },
        auth: {
          username: this.apiKey,
          password: this.apiSecret,
        },
      })

      const response = await integrationClient.post(
        `/sellers/${this.supplierId}/questions/${questionId}/answers`,
        {
          text: answerText
        }
      )

      console.log('✅ Trendyol sorusu cevaplandı:', response.data)
    } catch (error: any) {
      console.error('Trendyol API Error:', error.response?.data || error.message)
      throw new Error(`Trendyol API Error: ${error.response?.data?.message || error.message}`)
    }
  }

  /**
   * Get return claims (iade talepleri) from Trendyol
   * @param options - Query options (page, size, date range, status, orderNumber, claimIds)
   */
  async getClaims(options?: {
    page?: number
    size?: number
    startDate?: number // Unix timestamp in milliseconds
    endDate?: number // Unix timestamp in milliseconds
    claimItemStatus?: string
    orderNumber?: string
    claimIds?: number[]
  }): Promise<any> {
    try {
      const integrationClient = axios.create({
        baseURL: 'https://apigw.trendyol.com/integration/order',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': `${this.supplierId} - ExvadoSales`,
        },
        auth: {
          username: this.apiKey,
          password: this.apiSecret,
        },
      })

      const params: any = {
        page: options?.page || 0,
        size: options?.size || 50,
      }

      if (options?.startDate) params.startDate = options.startDate
      if (options?.endDate) params.endDate = options.endDate
      if (options?.claimItemStatus) params.claimItemStatus = options.claimItemStatus
      if (options?.orderNumber) params.orderNumber = options.orderNumber
      if (options?.claimIds && options.claimIds.length > 0) params.claimIds = options.claimIds

      const response = await integrationClient.get(
        `/sellers/${this.supplierId}/claims`,
        { params }
      )

      return response.data
    } catch (error: any) {
      console.error('Trendyol getClaims Error:', error.response?.data || error.message)
      throw new Error(`Trendyol API Error: ${error.response?.data?.message || error.message}`)
    }
  }

  /**
   * Create a new return claim
   * @param data - Claim creation data
   */
  async createClaim(data: {
    orderNumber: string
    claimItems: Array<{
      barcode: string
      quantity: number
      reasonId?: number
      customerNote?: string
    }>
    customerId?: number
    excludeListing?: boolean
    forcePackageCreation?: boolean
    shipmentCompanyId?: number
  }): Promise<any> {
    try {
      const integrationClient = axios.create({
        baseURL: 'https://apigw.trendyol.com/integration/order',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': `${this.supplierId} - ExvadoSales`,
        },
        auth: {
          username: this.apiKey,
          password: this.apiSecret,
        },
      })

      // Set default reasonId (401 = "Vazgeçtim") if not provided
      const claimItems = data.claimItems.map(item => ({
        ...item,
        reasonId: item.reasonId || 401
      }))

      const payload = {
        ...data,
        claimItems
      }

      console.log('📤 Trendyol createClaim request:', JSON.stringify(payload, null, 2))

      const response = await integrationClient.post(
        `/sellers/${this.supplierId}/claims/create`,
        payload
      )

      console.log('✅ İade talebi oluşturuldu:', response.data)
      return response.data
    } catch (error: any) {
      console.error('Trendyol createClaim Error:', error.response?.data || error.message)
      throw new Error(`Trendyol API Error: ${error.response?.data?.message || error.message}`)
    }
  }

  /**
   * Approve claim line items
   * @param claimId - Claim ID
   * @param claimLineItemIdList - Array of claim line item IDs to approve
   */
  async approveClaimLineItems(claimId: string, claimLineItemIdList: string[]): Promise<void> {
    try {
      const integrationClient = axios.create({
        baseURL: 'https://apigw.trendyol.com/integration/order',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': `${this.supplierId} - ExvadoSales`,
        },
        auth: {
          username: this.apiKey,
          password: this.apiSecret,
        },
      })

      const payload = {
        claimLineItemIdList
      }

      console.log('📤 Trendyol approveClaimLineItems:', claimId, claimLineItemIdList)

      const response = await integrationClient.put(
        `/sellers/${this.supplierId}/claims/${claimId}/items/approve`,
        payload
      )

      console.log('✅ İade talebi onaylandı:', response.data)
    } catch (error: any) {
      console.error('Trendyol approveClaimLineItems Error:', error.response?.data || error.message)
      throw new Error(`Trendyol API Error: ${error.response?.data?.message || error.message}`)
    }
  }

  /**
   * Create claim issue (reject claim)
   * @param claimId - Claim ID
   * @param data - Rejection data
   */
  async createClaimIssue(
    claimId: string,
    data: {
      claimIssueReasonId: number
      claimItemIdList: string
      description: string
      files?: File[] | Buffer[]
    }
  ): Promise<void> {
    try {
      const FormData = require('form-data')
      const formData = new FormData()

      formData.append('claimIssueReasonId', data.claimIssueReasonId.toString())
      formData.append('claimItemIdList', data.claimItemIdList)
      formData.append('description', data.description)

      if (data.files && data.files.length > 0) {
        for (const file of data.files) {
          formData.append('files', file)
        }
      }

      const integrationClient = axios.create({
        baseURL: 'https://apigw.trendyol.com/integration/order',
        headers: {
          ...formData.getHeaders(),
          'User-Agent': `${this.supplierId} - ExvadoSales`,
        },
        auth: {
          username: this.apiKey,
          password: this.apiSecret,
        },
      })

      console.log('📤 Trendyol createClaimIssue:', claimId, data)

      const response = await integrationClient.post(
        `/sellers/${this.supplierId}/claims/${claimId}/issue`,
        formData
      )

      console.log('✅ İade talebi reddedildi:', response.data)
    } catch (error: any) {
      console.error('Trendyol createClaimIssue Error:', error.response?.data || error.message)
      throw new Error(`Trendyol API Error: ${error.response?.data?.message || error.message}`)
    }
  }

  /**
   * Get claim issue reasons (red sebepleri)
   */
  async getClaimIssueReasons(): Promise<Array<{ id: number; name: string }>> {
    try {
      const integrationClient = axios.create({
        baseURL: 'https://apigw.trendyol.com/integration/order',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': `${this.supplierId} - ExvadoSales`,
        },
        auth: {
          username: this.apiKey,
          password: this.apiSecret,
        },
      })

      const response = await integrationClient.get('/claim-issue-reasons')

      return response.data
    } catch (error: any) {
      console.error('Trendyol getClaimIssueReasons Error:', error.response?.data || error.message)
      throw new Error(`Trendyol API Error: ${error.response?.data?.message || error.message}`)
    }
  }

  /**
   * Get claim item audit history
   * @param claimItemsId - Claim item ID
   */
  async getClaimItemAudits(claimItemsId: string): Promise<any[]> {
    try {
      const integrationClient = axios.create({
        baseURL: 'https://apigw.trendyol.com/integration/order',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': `${this.supplierId} - ExvadoSales`,
        },
        auth: {
          username: this.apiKey,
          password: this.apiSecret,
        },
      })

      const response = await integrationClient.get(
        `/sellers/${this.supplierId}/claims/items/${claimItemsId}/audit`
      )

      return response.data
    } catch (error: any) {
      console.error('Trendyol getClaimItemAudits Error:', error.response?.data || error.message)
      throw new Error(`Trendyol API Error: ${error.response?.data?.message || error.message}`)
    }
  }
}

// Singleton instance
let trendyolClient: TrendyolAPIClient | null = null

export function getTrendyolClient(): TrendyolAPIClient {
  if (!trendyolClient) {
    trendyolClient = new TrendyolAPIClient()
  }
  return trendyolClient
}

export default getTrendyolClient
