/**
 * N11 API Client
 * Official API Documentation: https://www.n11.com/apidoc/
 * N11 uses SOAP/XML-based API
 */

import axios, { AxiosInstance } from 'axios'
import * as xml2js from 'xml2js'

export interface N11Order {
  id: number
  orderNumber: string
  status: string
  createDate: string
  buyer: {
    fullName: string
    taxNumber?: string
    taxOffice?: string
    phone: string
  }
  billingAddress: {
    fullName: string
    address: string
    city: string
    district: string
    postalCode?: string
  }
  shippingAddress: {
    fullName: string
    address: string
    city: string
    district: string
    postalCode?: string
  }
  items: Array<{
    id: number
    productName: string
    productSellerCode?: string
    quantity: number
    price: number
    discount?: number
    totalPrice: number
    attributes?: Array<{
      name: string
      value: string
    }>
  }>
  totalAmount: number
  shipmentInfo?: {
    shipmentCompany?: string
    trackingNumber?: string
    shipmentMethod?: string
  }
}

export interface N11OrdersResponse {
  orders: N11Order[]
  totalCount: number
  currentPage: number
  pageSize: number
}

class N11APIClient {
  private client: AxiosInstance
  private apiKey: string
  private apiSecret: string
  private parser: xml2js.Parser
  private builder: xml2js.Builder

  constructor() {
    this.apiKey = process.env.N11_API_KEY || ''
    this.apiSecret = process.env.N11_API_SECRET || ''

    console.log('🔑 N11 API Keys loaded:', {
      apiKey: this.apiKey ? `${this.apiKey.substring(0, 10)}...` : 'MISSING',
      apiSecret: this.apiSecret ? `${this.apiSecret.substring(0, 4)}...` : 'MISSING'
    })

    this.client = axios.create({
      baseURL: 'https://api.n11.com/ws',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'User-Agent': 'ExvadoSales/1.0',
      },
      timeout: 30000,
    })

    // XML parser and builder
    this.parser = new xml2js.Parser({
      explicitArray: false,
      ignoreAttrs: false,
      mergeAttrs: true,
    })

    this.builder = new xml2js.Builder({
      xmldec: { version: '1.0', encoding: 'UTF-8' },
    })
  }

  /**
   * Generate authentication XML for N11 SOAP requests
   */
  private getAuthXML() {
    return {
      appKey: this.apiKey,
      appSecret: this.apiSecret,
    }
  }

  /**
   * Fetch orders from N11
   * @param options - Query options (page, pageSize, date range, status)
   */
  async getOrders(options?: {
    page?: number
    pageSize?: number
    startDate?: string // Format: DD/MM/YYYY or ISO string
    endDate?: string // Format: DD/MM/YYYY or ISO string
    status?: string // 'Yeni', 'Onaylandi', 'Hazirlaniyor', 'Kargoya Verildi', 'Tamamlandi', 'Iptal'
    productOrderNumber?: string
  }): Promise<N11OrdersResponse> {
    try {
      const page = options?.page || 0
      const pageSize = options?.pageSize || 100

      // Prepare request body
      const requestBody: any = {
        'soapenv:Envelope': {
          $: {
            'xmlns:soapenv': 'http://schemas.xmlsoap.org/soap/envelope/',
            'xmlns:sch': 'http://www.n11.com/ws/schemas',
          },
          'soapenv:Header': {},
          'soapenv:Body': {
            'sch:OrderListRequest': {
              auth: this.getAuthXML(),
              pagingData: {
                currentPage: page,
                pageSize: pageSize,
              },
            },
          },
        },
      }

      // Add search data if provided
      if (options?.startDate || options?.endDate || options?.status || options?.productOrderNumber) {
        const searchData: any = {}

        if (options.startDate || options.endDate) {
          searchData.period = {
            startDate: this.formatDate(options.startDate || new Date().toISOString()),
            endDate: this.formatDate(options.endDate || new Date().toISOString()),
          }
        }

        if (options.status) {
          searchData.status = options.status
        }

        if (options.productOrderNumber) {
          searchData.productOrderNumber = options.productOrderNumber
        }

        requestBody['soapenv:Envelope']['soapenv:Body']['sch:OrderListRequest'].searchData = searchData
      }

      const xmlRequest = this.builder.buildObject(requestBody)

      console.log('📤 N11 API Request:', {
        page,
        pageSize,
        startDate: options?.startDate,
        endDate: options?.endDate,
        status: options?.status,
      })

      const response = await this.client.post('/OrderService.wsdl', xmlRequest)

      // Parse XML response
      const parsedResponse = await this.parser.parseStringPromise(response.data)

      console.log('📥 N11 API Response received')

      return this.parseOrderListResponse(parsedResponse)
    } catch (error: any) {
      console.error('❌ N11 API Error:', error.response?.data || error.message)

      if (error.response?.data) {
        try {
          const errorData = await this.parser.parseStringPromise(error.response.data)
          console.error('N11 Error Details:', JSON.stringify(errorData, null, 2))
        } catch (e) {
          console.error('Raw Error Response:', error.response.data)
        }
      }

      throw new Error(`N11 API Error: ${error.message}`)
    }
  }

  /**
   * Get detailed order information by order number
   */
  async getOrderDetail(orderNumber: string): Promise<N11Order> {
    try {
      const requestBody = {
        'soapenv:Envelope': {
          $: {
            'xmlns:soapenv': 'http://schemas.xmlsoap.org/soap/envelope/',
            'xmlns:sch': 'http://www.n11.com/ws/schemas',
          },
          'soapenv:Header': {},
          'soapenv:Body': {
            'sch:OrderDetailRequest': {
              auth: this.getAuthXML(),
              orderRequest: {
                id: orderNumber,
              },
            },
          },
        },
      }

      const xmlRequest = this.builder.buildObject(requestBody)

      const response = await this.client.post('/OrderService.wsdl', xmlRequest)
      const parsedResponse = await this.parser.parseStringPromise(response.data)

      return this.parseOrderDetail(parsedResponse)
    } catch (error: any) {
      console.error('N11 API Error:', error.response?.data || error.message)
      throw new Error(`N11 API Error: ${error.message}`)
    }
  }

  /**
   * Parse order list response from N11
   */
  private parseOrderListResponse(parsedXML: any): N11OrdersResponse {
    try {
      const envelope = parsedXML['SOAP-ENV:Envelope'] || parsedXML['soap:Envelope'] || parsedXML['soapenv:Envelope']
      const body = envelope['SOAP-ENV:Body'] || envelope['soap:Body'] || envelope['soapenv:Body']
      const response = body?.['ns3:OrderListResponse'] || body?.[0]?.['ns2:OrderListResponse'] || body?.[0]?.['OrderListResponse'] || body?.['OrderListResponse']

      if (!response) {
        return {
          orders: [],
          totalCount: 0,
          currentPage: 0,
          pageSize: 0,
        }
      }

      const result = response?.result || response?.[0]?.result?.[0]

      if (result?.status !== 'success') {
        console.warn('N11 API returned non-success status:', result?.status)
        console.warn('Error message:', result?.errorMessage)
        return {
          orders: [],
          totalCount: 0,
          currentPage: 0,
          pageSize: 0,
        }
      }

      const orderList = response?.orderList?.order || response?.[0]?.orderList?.[0]?.order || []
      const pagingData = response?.pagingData || response?.[0]?.pagingData?.[0] || {}

      const orders: N11Order[] = Array.isArray(orderList)
        ? orderList.map((order: any) => this.parseOrder(order))
        : orderList ? [this.parseOrder(orderList)] : []

      return {
        orders: orders.filter(o => o !== null),
        totalCount: parseInt(String(pagingData.totalCount || pagingData.totalCount?.[0] || '0')),
        currentPage: parseInt(String(pagingData.currentPage || pagingData.currentPage?.[0] || '0')),
        pageSize: parseInt(String(pagingData.pageSize || pagingData.pageSize?.[0] || '0')),
      }
    } catch (error: any) {
      console.error('Error parsing N11 order list:', error)
      return {
        orders: [],
        totalCount: 0,
        currentPage: 0,
        pageSize: 0,
      }
    }
  }

  /**
   * Parse order detail response
   */
  private parseOrderDetail(parsedXML: any): N11Order {
    try {
      const envelope = parsedXML['SOAP-ENV:Envelope'] || parsedXML['soap:Envelope'] || parsedXML['soapenv:Envelope']
      const body = envelope['SOAP-ENV:Body'] || envelope['soap:Body'] || envelope['soapenv:Body']
      const response = body?.['ns3:OrderDetailResponse'] || body?.[0]?.['ns2:OrderDetailResponse'] || body?.[0]?.['OrderDetailResponse'] || body?.['OrderDetailResponse']

      const orderData = response?.orderDetail || response?.[0]?.orderDetail?.[0]

      return this.parseOrder(orderData)
    } catch (error: any) {
      console.error('Error parsing N11 order detail:', error)
      throw error
    }
  }

  /**
   * Parse a single order from N11 XML
   * Handles both OrderList (simple) and OrderDetail (full) formats
   */
  private parseOrder(orderXML: any): N11Order {
    try {
      // Helper to get value from XML (handles both array and direct value)
      const getValue = (val: any) => Array.isArray(val) ? val[0] : val

      const buyer = getValue(orderXML.buyer) || {}
      const billingAddress = getValue(orderXML.billingAddress) || {}
      const shippingAddress = getValue(orderXML.shippingAddress) || {}
      const rawItemList = getValue(orderXML.itemList)?.item

      // Normalize itemList to always be an array
      const itemList = rawItemList
        ? (Array.isArray(rawItemList) ? rawItemList : [rawItemList])
        : []

      const items = itemList.map((item: any) => {
        const itemShipmentInfo = getValue(item.shipmentInfo)
        return {
          id: parseInt(getValue(item.id) || '0'),
          productName: getValue(item.productName) || 'Ürün',
          productSellerCode: getValue(item.productSellerCode),
          quantity: parseInt(getValue(item.quantity) || '1'),
          price: parseFloat(getValue(item.price) || '0'),
          discount: parseFloat(getValue(item.discount) || '0'),
          totalPrice: parseFloat(getValue(item.totalPrice) || getValue(item.price) || '0'),
          attributes: getValue(item.attributes)?.attribute?.map((attr: any) => ({
            name: getValue(attr.name) || '',
            value: getValue(attr.value) || '',
          })) || [],
          shipmentInfo: itemShipmentInfo,
        }
      })

      const createDateStr = getValue(orderXML.createDate) || ''

      return {
        id: parseInt(getValue(orderXML.id) || '0'),
        orderNumber: getValue(orderXML.orderNumber) || '',
        status: getValue(orderXML.status) || '',
        createDate: createDateStr,
        buyer: {
          fullName: getValue(buyer.fullName) || 'Müşteri',
          taxNumber: getValue(buyer.taxNumber),
          taxOffice: getValue(buyer.taxOffice),
          phone: getValue(buyer.gsm) || getValue(buyer.phone) || '',
        },
        billingAddress: {
          fullName: getValue(billingAddress.fullName) || 'Müşteri',
          address: getValue(billingAddress.address) || '',
          city: getValue(billingAddress.city) || '',
          district: getValue(billingAddress.district) || '',
          postalCode: getValue(billingAddress.postalCode),
        },
        shippingAddress: {
          fullName: getValue(shippingAddress.fullName) || getValue(buyer.fullName) || 'Müşteri',
          address: getValue(shippingAddress.address) || '',
          city: getValue(shippingAddress.city) || '',
          district: getValue(shippingAddress.district) || '',
          postalCode: getValue(shippingAddress.postalCode),
        },
        items: items.length > 0 ? items : [{
          id: 0,
          productName: 'Detay Gerekli',
          quantity: 1,
          price: 0,
          totalPrice: 0
        }],
        totalAmount: parseFloat(getValue(orderXML.totalAmount) || getValue(orderXML.billingTemplate)?.dueAmount || '0'),
        shipmentInfo: {
          // Get shipmentInfo from first item (N11 stores it per item)
          shipmentCompany: items[0]?.shipmentInfo?.shipmentCompany?.name,
          trackingNumber: items[0]?.shipmentInfo?.trackingNumber,
          shipmentMethod: items[0]?.shipmentInfo?.shipmentMethod,
        },
      }
    } catch (error: any) {
      console.error('Error parsing individual N11 order:', error)
      throw error
    }
  }

  /**
   * Format date to DD/MM/YYYY format for N11 API
   */
  private formatDate(dateString: string): string {
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  /**
   * Parse N11 date format (DD/MM/YYYY HH:mm) to JavaScript Date
   */
  private parseN11Date(n11DateString: string): Date {
    if (!n11DateString) return new Date()

    try {
      // Format: "23/02/2021 15:16"
      const parts = n11DateString.split(' ')
      const datePart = parts[0] // "23/02/2021"
      const timePart = parts[1] || '00:00' // "15:16"

      const [day, month, year] = datePart.split('/')
      const [hour, minute] = timePart.split(':')

      // Month is 0-indexed in JavaScript Date
      const date = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hour || '0'),
        parseInt(minute || '0')
      )

      return isNaN(date.getTime()) ? new Date() : date
    } catch (error) {
      console.error('Error parsing N11 date:', n11DateString, error)
      return new Date()
    }
  }

  /**
   * Update order status on N11
   */
  async updateOrderStatus(orderId: string, status: string): Promise<void> {
    try {
      console.log(`🔄 N11 updateOrderStatus çağrısı:`)
      console.log(`  - Order Item ID (SKU): ${orderId}`)
      console.log(`  - Yeni Status Code: ${status}`)

      const requestBody = {
        'soapenv:Envelope': {
          $: {
            'xmlns:soapenv': 'http://schemas.xmlsoap.org/soap/envelope/',
            'xmlns:sch': 'http://www.n11.com/ws/schemas',
          },
          'soapenv:Header': {},
          'soapenv:Body': {
            'sch:OrderStatusUpdateRequest': {
              auth: this.getAuthXML(),
              orderItemList: {
                orderItem: {
                  id: orderId,
                  status: status,
                },
              },
            },
          },
        },
      }

      const xmlRequest = this.builder.buildObject(requestBody)
      console.log(`📤 N11 SOAP Request gönderiliyor...`)

      const response = await this.client.post('/OrderService.wsdl', xmlRequest)
      console.log(`📥 N11 SOAP Response:`, JSON.stringify(response.data, null, 2).substring(0, 500))

      console.log(`✅ N11 order ${orderId} status updated to ${status}`)
    } catch (error: any) {
      console.error('❌ N11 API Error Details:')
      console.error('  - Status Code:', error.response?.status)
      console.error('  - Response Data:', error.response?.data)
      console.error('  - Error Message:', error.message)
      throw new Error(`N11 API Error: ${error.message}`)
    }
  }

  /**
   * Upload invoice link to N11
   * N11 uses link-based invoice system (not file upload like Trendyol)
   *
   * Requirements:
   * - URL must be HTTPS
   * - URL must end with .pdf, .png, .jpeg, .jpg, or be extensionless
   * - URL max length: 2048 characters
   * - Cannot send same invoice twice within 30 seconds
   *
   * @param orderNumber - N11 order number (e.g., "N11-204571955334")
   * @param invoiceUrl - Public HTTPS URL of invoice file
   */
  async uploadInvoiceLink(orderNumber: string, invoiceUrl: string): Promise<void> {
    try {
      // Validate invoice URL
      if (!invoiceUrl.startsWith('https://')) {
        throw new Error('Fatura URL\'i HTTPS ile başlamalıdır')
      }

      if (invoiceUrl.length > 2048) {
        throw new Error('Fatura URL\'i 2048 karakterden uzun olamaz')
      }

      // Remove "N11-" prefix if present (N11 expects pure order number)
      const pureOrderNumber = orderNumber.replace(/^N11-/i, '')

      const requestBody = {
        'soapenv:Envelope': {
          $: {
            'xmlns:soapenv': 'http://schemas.xmlsoap.org/soap/envelope/',
            'xmlns:sch': 'http://www.n11.com/ws/schemas',
          },
          'soapenv:Header': {},
          'soapenv:Body': {
            'sch:SaveLinkSellerInvoiceRequest': {
              auth: this.getAuthXML(),
              url: invoiceUrl,
              orderNumber: pureOrderNumber,
            },
          },
        },
      }

      const xmlRequest = this.builder.buildObject(requestBody)

      console.log('📤 N11 uploadInvoiceLink request:')
      console.log('Order Number:', pureOrderNumber)
      console.log('Invoice URL:', invoiceUrl)

      const response = await this.client.post('/SellerInvoiceService.wsdl', xmlRequest)

      // Parse response
      const parsedResponse = await this.parser.parseStringPromise(response.data)
      const envelope = parsedResponse['SOAP-ENV:Envelope'] || parsedResponse['soap:Envelope'] || parsedResponse['soapenv:Envelope']
      const body = envelope['SOAP-ENV:Body'] || envelope['soap:Body'] || envelope['soapenv:Body']
      const invoiceResponse = body?.['ns3:SaveLinkSellerInvoiceResponse'] || body?.[0]?.['ns2:SaveLinkSellerInvoiceResponse']

      const result = invoiceResponse?.result || invoiceResponse?.[0]?.result?.[0]

      if (result?.status !== 'success') {
        console.error('❌ N11 fatura yükleme hatası:', result?.errorMessage || 'Bilinmeyen hata')
        throw new Error(result?.errorMessage || 'N11 fatura yükleme başarısız')
      }

      console.log('✅ Fatura linki N11\'e başarıyla yüklendi!')
      console.log('Returned URL:', invoiceResponse?.url)
      console.log('Returned Order Number:', invoiceResponse?.orderNumber)
    } catch (error: any) {
      console.error('❌ N11 uploadInvoiceLink Error:', error.message)

      // Parse SOAP fault if present
      if (error.response?.data) {
        try {
          const errorData = await this.parser.parseStringPromise(error.response.data)
          const envelope = errorData['SOAP-ENV:Envelope'] || errorData['soap:Envelope']
          const body = envelope['SOAP-ENV:Body'] || envelope['soap:Body']
          const fault = body?.['SOAP-ENV:Fault'] || body?.['soap:Fault']

          if (fault) {
            const faultString = fault.faultstring || fault[0]?.faultstring?.[0]
            console.error('SOAP Fault:', faultString)
            throw new Error(faultString || 'N11 SOAP hatası')
          }
        } catch (parseError) {
          // If parsing fails, throw original error
        }
      }

      throw new Error(`N11 API Error: ${error.message}`)
    }
  }
}

// Singleton instance
let n11Client: N11APIClient | null = null

export function getN11Client(): N11APIClient {
  if (!n11Client) {
    n11Client = new N11APIClient()
  }
  return n11Client
}

export default getN11Client
