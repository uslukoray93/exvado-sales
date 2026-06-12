/**
 * Ticimax SOAP API Client (Manual SOAP via HTTP)
 * Documentation: https://www.ticimax.com/web-servis-api/
 * WSDL: https://www.bolbolbul.com/Servis/SiparisServis.svc?wsdl
 */

import axios from 'axios'
import { parseStringPromise } from 'xml2js'

export interface TicimaxSiparis {
  ID: number
  SiparisNo: string
  SiparisTarihi: string
  UyeID: number
  UyeAdi: string
  UyeSoyadi: string
  UyeTelefon: string
  AdresBaslik: string
  Adres: string
  SiparisDurumID: number
  SiparisDurum: string
  ToplamTutar: number // KDV hariç toplam
  ToplamKdv: number // KDV tutarı (doğru alan)
  SiparisToplamTutari: number // KDV dahil toplam (en doğru alan)
  UrunTutariKdv: number // DEPRECATED - Bu alan API'de yok, kullanmıyoruz
  KargoTutar: number
  KargoTakipNo?: string
  KargoFirmaAdi?: string
  OdemeTipi?: number // 0=Kredi Kartı, 1=Havale, etc.
  OdemeTipiAdi?: string
  OdemeDurumu?: number // 0=Onay bekliyor, 1=Onaylandı, etc.
  Bakiye?: number // Kalan borç (> 0 ise ödeme bekliyor)
  Urunler?: TicimaxSiparisUrun[] // Products are included when UrunGetir=true
}

export interface TicimaxSiparisUrun {
  ID: number
  SiparisID: number
  UrunID: number
  UrunAdi: string
  StokKodu: string
  Barkod?: string
  Adet: number
  BirimFiyat: number // KDV hariç birim fiyat
  ToplamTutar: number // KDV hariç toplam (BirimFiyat × Adet)
  KdvTutari: number // Ürün KDV tutarı
  ResimURL?: string
}

export interface TicimaxSelectSiparisResponse {
  SelectSiparisResult: {
    SiparisListesi?: {
      Siparis: TicimaxSiparis | TicimaxSiparis[]
    }
  }
}

export interface TicimaxSelectSiparisUrunResponse {
  SelectSiparisUrunResult: {
    SiparisUrunListesi?: {
      SiparisUrun: TicimaxSiparisUrun | TicimaxSiparisUrun[]
    }
  }
}

export interface TicimaxSiparisOdeme {
  ID: number
  SiparisID: number
  OdemeTipi: number // 0=Kredi Kartı, 1=Havale, 2=Kapıda Ödeme Nakit, ...
  OdemeDurumu: number // 0=Onay bekliyor, 1=Onaylandı, 2=Hatalı, 3=İade edilmiş, 4=İptal edilmiş
  Tutar: number
  Tarih: string
}

export interface TicimaxSelectSiparisOdemeResponse {
  SelectSiparisOdemeResult: {
    SiparisOdemeListesi?: {
      SiparisOdeme: TicimaxSiparisOdeme | TicimaxSiparisOdeme[]
    }
  }
}

class TicimaxSOAPClient {
  private wsAuthCode: string
  private serviceUrl: string

  constructor() {
    this.wsAuthCode = process.env.TICIMAX_WS_AUTH_CODE || ''
    this.serviceUrl = 'https://www.bolbolbul.com/Servis/SiparisServis.svc'
  }

  /**
   * Make SOAP request
   */
  private async makeSoapRequest(action: string, body: string): Promise<any> {
    try {
      const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
  <soap:Body>
    ${body}
  </soap:Body>
</soap:Envelope>`

      const response = await axios.post(this.serviceUrl, soapEnvelope, {
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': `http://tempuri.org/ISiparisServis/${action}`,
        },
      })

      // Log raw response for debugging
      console.log('📥 Raw SOAP Response:', response.data.substring(0, 1000))

      // Parse XML response
      const parsed = await parseStringPromise(response.data, {
        explicitArray: false,
        ignoreAttrs: true,
      })

      console.log('📊 Parsed SOAP Response:', JSON.stringify(parsed, null, 2).substring(0, 2000))

      return parsed
    } catch (error: any) {
      console.error(`❌ SOAP request failed (${action}):`, error.message)
      if (error.response) {
        console.error('Response data:', error.response.data)
      }
      throw new Error(`Ticimax SOAP Error: ${error.message}`)
    }
  }

  /**
   * Select orders (Sipariş Listesi)
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   * @param status - Order status ID (optional)
   * @param offset - Pagination offset (BaslangicIndex)
   * @param limit - Number of records to fetch (KayitSayisi, max 100)
   */
  async selectSiparis(
    startDate?: string,
    endDate?: string,
    status?: number,
    offset: number = 0,
    limit: number = 100
  ): Promise<TicimaxSiparis[]> {
    try {
      // Prepare date range (default: last 30 days)
      const end = endDate ? new Date(endDate) : new Date()
      const start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000)

      console.log('📤 Ticimax SelectSiparis: Fetching ALL orders (no payment filter)...')

      // FIX: Fetch ALL orders without payment type filter
      // The old code was filtering out orders with Bakiye > 0 (pending payment)
      // This caused new orders to be invisible until payment was completed
      const allOrders = await this.fetchAllOrders(start, end, status, offset, limit)

      // Map to TicimaxSiparis interface
      return this.mapOrdersToInterface(allOrders)
    } catch (error: any) {
      console.error('Ticimax SelectSiparis Error:', error.message)
      throw new Error(`Ticimax SOAP Error: ${error.message}`)
    }
  }

  /**
   * Fetch ALL orders without payment type filter
   * @private
   */
  private async fetchAllOrders(
    start: Date,
    end: Date,
    status: number | undefined,
    offset: number,
    limit: number
  ): Promise<any[]> {
    // Log the date range for debugging
    console.log(`📅 Fetching orders from ${start.toISOString()} to ${end.toISOString()}`)

    const soapBody = `<tem:SelectSiparis xmlns:tem="http://tempuri.org/">
  <tem:UyeKodu>${this.wsAuthCode}</tem:UyeKodu>
  <tem:f>
    <a:EntegrasyonAktarildi xmlns:a="http://schemas.datacontract.org/2004/07/">-1</a:EntegrasyonAktarildi>
    <a:IptalEdilmisUrunler xmlns:a="http://schemas.datacontract.org/2004/07/">true</a:IptalEdilmisUrunler>
    <a:OdemeDurumu xmlns:a="http://schemas.datacontract.org/2004/07/">-1</a:OdemeDurumu>
    <a:SiparisDurumu xmlns:a="http://schemas.datacontract.org/2004/07/">-1</a:SiparisDurumu>
    <a:SiparisID xmlns:a="http://schemas.datacontract.org/2004/07/">-1</a:SiparisID>
    <a:SiparisTarihiBas xmlns:a="http://schemas.datacontract.org/2004/07/">${start.toISOString()}</a:SiparisTarihiBas>
    <a:SiparisTarihiSon xmlns:a="http://schemas.datacontract.org/2004/07/">${end.toISOString()}</a:SiparisTarihiSon>
    <a:TedarikciID xmlns:a="http://schemas.datacontract.org/2004/07/">-1</a:TedarikciID>
    <a:UyeID xmlns:a="http://schemas.datacontract.org/2004/07/">-1</a:UyeID>
    <a:UrunGetir xmlns:a="http://schemas.datacontract.org/2004/07/">true</a:UrunGetir>
  </tem:f>
  <tem:s>
    <a:BaslangicIndex xmlns:a="http://schemas.datacontract.org/2004/07/">${offset}</a:BaslangicIndex>
    <a:KayitSayisi xmlns:a="http://schemas.datacontract.org/2004/07/">${limit}</a:KayitSayisi>
    <a:SiralamaDegeri xmlns:a="http://schemas.datacontract.org/2004/07/">ID</a:SiralamaDegeri>
    <a:SiralamaYonu xmlns:a="http://schemas.datacontract.org/2004/07/">DESC</a:SiralamaYonu>
  </tem:s>
</tem:SelectSiparis>`

    const result = await this.makeSoapRequest('SelectSiparis', soapBody)

    console.log(`📥 Ticimax SelectSiparis response received (ALL orders, no payment filter)`)

    // Parse response (namespace prefix is 's:' not 'soap:', and data uses 'a:' prefix)
    const siparisResult =
      result?.['s:Envelope']?.['s:Body']?.SelectSiparisResponse?.SelectSiparisResult

    if (!siparisResult || !siparisResult['a:WebSiparis']) {
      console.log(`ℹ️ No orders found`)
      return []
    }

    // Handle single order or array of orders (data comes with 'a:' namespace prefix)
    const webSiparisData = siparisResult['a:WebSiparis']
    const orders = Array.isArray(webSiparisData) ? webSiparisData : [webSiparisData]

    console.log(`✅ Found ${orders.length} orders (all payment types)`)
    return orders
  }

  /**
   * Fetch orders by specific payment type
   * @private
   */
  private async fetchOrdersByPaymentType(
    start: Date,
    end: Date,
    status: number | undefined,
    paymentType: number,
    offset: number,
    limit: number
  ): Promise<any[]> {
    const soapBody = `<tem:SelectSiparis xmlns:tem="http://tempuri.org/">
  <tem:UyeKodu>${this.wsAuthCode}</tem:UyeKodu>
  <tem:f>
    <a:EntegrasyonAktarildi xmlns:a="http://schemas.datacontract.org/2004/07/">-1</a:EntegrasyonAktarildi>
    <a:IptalEdilmisUrunler xmlns:a="http://schemas.datacontract.org/2004/07/">true</a:IptalEdilmisUrunler>
    <a:OdemeDurumu xmlns:a="http://schemas.datacontract.org/2004/07/">-1</a:OdemeDurumu>
    <a:OdemeTipi xmlns:a="http://schemas.datacontract.org/2004/07/">${paymentType}</a:OdemeTipi>
    <a:SiparisDurumu xmlns:a="http://schemas.datacontract.org/2004/07/">${status || -1}</a:SiparisDurumu>
    <a:SiparisID xmlns:a="http://schemas.datacontract.org/2004/07/">-1</a:SiparisID>
    <a:SiparisTarihiBas xmlns:a="http://schemas.datacontract.org/2004/07/">${start.toISOString()}</a:SiparisTarihiBas>
    <a:SiparisTarihiSon xmlns:a="http://schemas.datacontract.org/2004/07/">${end.toISOString()}</a:SiparisTarihiSon>
    <a:TedarikciID xmlns:a="http://schemas.datacontract.org/2004/07/">-1</a:TedarikciID>
    <a:UyeID xmlns:a="http://schemas.datacontract.org/2004/07/">-1</a:UyeID>
    <a:UrunGetir xmlns:a="http://schemas.datacontract.org/2004/07/">true</a:UrunGetir>
  </tem:f>
  <tem:s>
    <a:BaslangicIndex xmlns:a="http://schemas.datacontract.org/2004/07/">${offset}</a:BaslangicIndex>
    <a:KayitSayisi xmlns:a="http://schemas.datacontract.org/2004/07/">${limit}</a:KayitSayisi>
    <a:SiralamaDegeri xmlns:a="http://schemas.datacontract.org/2004/07/">ID</a:SiralamaDegeri>
    <a:SiralamaYonu xmlns:a="http://schemas.datacontract.org/2004/07/">DESC</a:SiralamaYonu>
  </tem:s>
</tem:SelectSiparis>`

    const result = await this.makeSoapRequest('SelectSiparis', soapBody)

    console.log(`📥 Ticimax SelectSiparis response received (paymentType=${paymentType})`)

    // Parse response (namespace prefix is 's:' not 'soap:', and data uses 'a:' prefix)
    const siparisResult =
      result?.['s:Envelope']?.['s:Body']?.SelectSiparisResponse?.SelectSiparisResult

    if (!siparisResult || !siparisResult['a:WebSiparis']) {
      console.log(`ℹ️ No orders found for paymentType=${paymentType}`)
      return []
    }

    // Handle single order or array of orders (data comes with 'a:' namespace prefix)
    const webSiparisData = siparisResult['a:WebSiparis']
    const orders = Array.isArray(webSiparisData) ? webSiparisData : [webSiparisData]

    console.log(`✅ Found ${orders.length} orders with paymentType=${paymentType}`)
    return orders
  }

  /**
   * Map raw order data to TicimaxSiparis interface
   * @private
   */
  private mapOrdersToInterface(orders: any[]): TicimaxSiparis[] {
    console.log(`🔍 DEBUG mapOrdersToInterface: Mapping ${orders.length} orders`)

    return orders.map((order: any) => {
      const mappedOrderId = parseInt(order['a:ID']) || 0
      const mappedOrderNo = order['a:SiparisNo'] || ''

      // Parse products from 'a:Urunler' -> 'a:WebSiparisUrun'
      let products: TicimaxSiparisUrun[] = []

      if (order['a:Urunler']?.['a:WebSiparisUrun']) {
        const urunData = order['a:Urunler']['a:WebSiparisUrun']
        const urunler = Array.isArray(urunData) ? urunData : [urunData]

        products = urunler.map((urun: any) => ({
          ID: parseInt(urun['a:ID']) || 0,
          SiparisID: parseInt(urun['a:SiparisID']) || parseInt(order['a:ID']) || 0,
          UrunID: parseInt(urun['a:UrunID']) || 0,
          UrunAdi: urun['a:UrunAdi'] || '',
          StokKodu: urun['a:StokKodu'] || '',
          Barkod: urun['a:Barkod'] || undefined,
          Adet: parseInt(urun['a:Adet']) || 0,
          BirimFiyat: parseFloat(urun['a:Tutar']) / Math.max(parseInt(urun['a:Adet']), 1) || 0,
          ToplamTutar: parseFloat(urun['a:Tutar']) || 0,
          KdvTutari: parseFloat(urun['a:KdvTutari']) || 0,
          ResimURL: urun['a:ResimYolu'] || undefined,
        }))
      }

      // Payment type mapping
      const paymentTypeNames: Record<number, string> = {
        0: 'Kredi Kartı',
        1: 'Havale/EFT',
        2: 'Kapıda Ödeme Nakit',
        3: 'Kapıda Ödeme Kredi Kartı',
      }

      const odemeTipi = order._paymentType !== undefined ? order._paymentType : undefined
      const odemeTipiAdi = odemeTipi !== undefined ? paymentTypeNames[odemeTipi] : undefined

      const durumID = parseInt(order['a:Durum']) || 0
      const durumName = this.getDurumName(durumID)
      const odemeDurumu = order['a:OdemeDurumu'] !== undefined ? parseInt(order['a:OdemeDurumu']) : undefined

      return {
        ID: mappedOrderId,
        SiparisNo: mappedOrderNo,
        SiparisTarihi: order['a:SiparisTarihi'] || new Date().toISOString(),
        UyeID: parseInt(order['a:UyeID']) || 0,
        UyeAdi: order['a:UyeAdi'] || '',
        UyeSoyadi: order['a:UyeSoyadi'] || '',
        UyeTelefon: order['a:TeslimatAdresi']?.['a:AliciTelefon'] || '',
        AdresBaslik: order['a:TeslimatAdresi']?.['a:Il'] || '',
        Adres: order['a:TeslimatAdresi']?.['a:Adres'] || '',
        SiparisDurumID: durumID,
        SiparisDurum: durumName,
        ToplamTutar: parseFloat(order['a:ToplamTutar']) || 0,
        ToplamKdv: parseFloat(order['a:ToplamKdv']) || 0,
        SiparisToplamTutari: parseFloat(order['a:SiparisToplamTutari']) || 0,
        UrunTutariKdv: 0, // DEPRECATED - API'de yok, kullanmıyoruz
        KargoTutar: parseFloat(order['a:KargoTutari']) || 0,
        KargoTakipNo: order['a:KargoTakipNo'] || undefined,
        KargoFirmaAdi: order['a:KargoFirmaTanim'] || undefined,
        OdemeTipi: odemeTipi,
        OdemeTipiAdi: odemeTipiAdi,
        OdemeDurumu: odemeDurumu,
        Bakiye: parseFloat(order['a:Bakiye']) || 0,
        Urunler: products,
      }
    })
  }

  /**
   * Select order items (Sipariş Ürünleri)
   * @param orderId - Ticimax Order ID
   */
  async selectSiparisUrun(orderId: number, iptalEdilmisUrunler: boolean = false): Promise<TicimaxSiparisUrun[]> {
    try {
      const soapBody = `<tem:SelectSiparisUrun xmlns:tem="http://tempuri.org/">
  <tem:UyeKodu>${this.wsAuthCode}</tem:UyeKodu>
  <tem:SiparisID>${orderId}</tem:SiparisID>
  <tem:IptalEdilmisUrunler>${iptalEdilmisUrunler}</tem:IptalEdilmisUrunler>
</tem:SelectSiparisUrun>`

      console.log(`📤 Ticimax SelectSiparisUrun request for order ${orderId}`)

      const result = await this.makeSoapRequest('SelectSiparisUrun', soapBody)

      console.log('📥 Ticimax SelectSiparisUrun response received')

      // Parse response (use s: prefix like SelectSiparis)
      const urunListesi =
        result?.['s:Envelope']?.['s:Body']?.SelectSiparisUrunResponse?.SelectSiparisUrunResult

      // Check if result is empty
      if (!urunListesi || urunListesi === '') {
        console.log('ℹ️ No order items found')
        return []
      }

      // Products come with 'a:' prefix like in SelectSiparis
      const webSiparisUrun = urunListesi['a:WebSiparisUrun']

      if (!webSiparisUrun) {
        console.log('ℹ️ No order items in response')
        return []
      }

      // Handle single item or array of items
      const items = Array.isArray(webSiparisUrun) ? webSiparisUrun : [webSiparisUrun]

      console.log(`✅ Found ${items.length} order items`)

      // Map to interface (fields have 'a:' prefix)
      return items.map((item: any) => ({
        ID: parseInt(item['a:ID']) || 0,
        SiparisID: parseInt(item['a:SiparisID']) || 0,
        UrunID: parseInt(item['a:UrunID']) || 0,
        UrunAdi: item['a:UrunAdi'] || '',
        StokKodu: item['a:StokKodu'] || '',
        Barkod: item['a:Barkod'] || undefined,
        Adet: parseInt(item['a:Adet']) || 0,
        BirimFiyat: parseFloat(item['a:BirimFiyat']) || 0,
        ToplamTutar: parseFloat(item['a:ToplamTutar']) || 0,
        ResimURL: item['a:ResimURL'] || undefined,
      }))
    } catch (error: any) {
      console.error('❌ Ticimax SelectSiparisUrun error:', error.message)
      throw new Error(`Ticimax API Error: ${error.message}`)
    }
  }

  /**
   * Select order payments (Sipariş Ödemeleri)
   * @param orderId - Ticimax Order ID
   * @returns Array of payment records
   */
  async selectSiparisOdeme(orderId: number): Promise<TicimaxSiparisOdeme[]> {
    try {
      const soapBody = `<tem:SelectSiparisOdeme xmlns:tem="http://tempuri.org/">
  <tem:UyeKodu>${this.wsAuthCode}</tem:UyeKodu>
  <tem:SiparisID>${orderId}</tem:SiparisID>
</tem:SelectSiparisOdeme>`

      console.log(`📤 Ticimax SelectSiparisOdeme request for order ${orderId}`)

      const result = await this.makeSoapRequest('SelectSiparisOdeme', soapBody)

      console.log('📥 Ticimax SelectSiparisOdeme response received')

      // Parse response (use s: prefix like other methods)
      const odemeResult =
        result?.['s:Envelope']?.['s:Body']?.SelectSiparisOdemeResponse?.SelectSiparisOdemeResult

      // Check if result is empty
      if (!odemeResult || odemeResult === '') {
        console.log(`ℹ️ No payment records found for order ${orderId}`)
        return []
      }

      // Payments come with 'a:' prefix like in other methods
      const webSiparisOdeme = odemeResult['a:WebSiparisOdeme']

      if (!webSiparisOdeme) {
        console.log(`ℹ️ No payment records in response for order ${orderId}`)
        return []
      }

      // Handle single payment or array of payments
      const payments = Array.isArray(webSiparisOdeme) ? webSiparisOdeme : [webSiparisOdeme]

      console.log(`✅ Found ${payments.length} payment record(s) for order ${orderId}`)

      // Map to interface (fields have 'a:' prefix)
      return payments.map((payment: any) => ({
        ID: parseInt(payment['a:ID']) || 0,
        SiparisID: parseInt(payment['a:SiparisID']) || orderId,
        OdemeTipi: parseInt(payment['a:OdemeTipi']) || 0,
        OdemeDurumu: parseInt(payment['a:OdemeDurumu']) || 0,
        Tutar: parseFloat(payment['a:Tutar']) || 0,
        Tarih: payment['a:Tarih'] || '',
      }))
    } catch (error: any) {
      console.error(`❌ Ticimax SelectSiparisOdeme error for order ${orderId}:`, error.message)
      // Return empty array instead of throwing - order might not have payment record
      return []
    }
  }

  /**
   * Set order as shipped (Kargoya Verildi)
   * @param orderId - Ticimax Order ID
   * @param trackingNumber - Cargo tracking number
   * @param cargoCompany - Cargo company name
   */
  async setSiparisKargoyaVerildi(
    orderId: number,
    trackingNumber: string,
    cargoCompany?: string
  ): Promise<void> {
    try {
      const soapBody = `<tem:SetSiparisKargoyaVerildi xmlns:tem="http://tempuri.org/">
  <tem:UyeKodu>${this.wsAuthCode}</tem:UyeKodu>
  <tem:SiparisID>${orderId}</tem:SiparisID>
  <tem:KargoTakipNo>${trackingNumber}</tem:KargoTakipNo>
  <tem:KargoFirmaAdi>${cargoCompany || ''}</tem:KargoFirmaAdi>
</tem:SetSiparisKargoyaVerildi>`

      console.log(`📤 Ticimax SetSiparisKargoyaVerildi request for order ${orderId}`)

      await this.makeSoapRequest('SetSiparisKargoyaVerildi', soapBody)

      console.log(`✅ Order ${orderId} marked as shipped`)
    } catch (error: any) {
      console.error('❌ Ticimax SetSiparisKargoyaVerildi error:', error.message)
      throw new Error(`Ticimax API Error: ${error.message}`)
    }
  }

  /**
   * Save cargo tracking number
   * @param orderId - Ticimax Order ID
   * @param trackingNumber - Cargo tracking number
   */
  async saveKargoTakipNo(orderId: number, trackingNumber: string): Promise<void> {
    try {
      const soapBody = `<tem:SaveKargoTakipNo xmlns:tem="http://tempuri.org/">
  <tem:UyeKodu>${this.wsAuthCode}</tem:UyeKodu>
  <tem:SiparisID>${orderId}</tem:SiparisID>
  <tem:KargoTakipNo>${trackingNumber}</tem:KargoTakipNo>
</tem:SaveKargoTakipNo>`

      console.log(`📤 Ticimax SaveKargoTakipNo request for order ${orderId}`)

      await this.makeSoapRequest('SaveKargoTakipNo', soapBody)

      console.log(`✅ Tracking number saved for order ${orderId}`)
    } catch (error: any) {
      console.error('❌ Ticimax SaveKargoTakipNo error:', error.message)
      throw new Error(`Ticimax API Error: ${error.message}`)
    }
  }

  /**
   * Set order status
   * @param orderId - Ticimax Order ID
   * @param statusId - Status ID (1=Pending, 2=Processing, 3=Shipped, 4=Delivered, 5=Cancelled)
   * @param orderNumber - Order Number (optional, but recommended for reliability)
   */
  async setSiparisDurum(orderId: number, statusId: number, orderNumber?: string): Promise<void> {
    try {
      // Map statusId to Ticimax enum string (as per Ticimax support response)
      // CRITICAL: Durum field must be STRING, not integer!
      const durumMap: Record<number, string> = {
        0: 'OnSiparis',                    // Ön sipariş
        1: 'OnayBekliyor',                 // Onay bekliyor
        2: 'Onaylandi',                    // Onaylandı
        3: 'OdemeBekliyor',                // Ödeme bekliyor
        4: 'Paketleniyor',                 // Paketleniyor
        5: 'TedarikEdiliyor',              // Tedarik ediliyor
        6: 'KargoyaVerildi',               // Kargoya verildi
        7: 'TeslimEdildi',                 // Teslim edildi
        8: 'Iptal',                        // İptal edildi
        9: 'Iade',                         // İade edildi
        10: 'Silinmis',                    // Silinmiş
        11: 'IadeTalepAlindi',             // İade talebi alındı
        12: 'IadeUlastiOdemeYapilacak',    // İade ulaştı ödeme yapılacak
        13: 'IadeOdemeYapildi',            // İade ödemesi yapıldı
        14: 'TeslimOncesiIptal',           // Teslimat öncesi iptal talebi
        15: 'IptalTalebi',                 // İptal talebi
        16: 'KismiIadeTalebi',             // Kısmi iade talebi
        17: 'KismiIadeYapildi',            // Kısmi iade yapıldı
        18: 'TeslimEdilemedi',             // Teslim edilemedi
        19: 'MagazayaGonderildi',          // Mağazaya gönderildi
        20: 'MagazayaUlasti',              // Mağazaya ulaştı
        21: 'MagazadaTeslimBekliyor',      // Mağazada teslim bekliyor
        22: 'CuzdanaIade',                 // Cüzdana iade
      }

      const durumString = durumMap[statusId]
      if (!durumString) {
        throw new Error(`Invalid status ID: ${statusId}`)
      }

      // Build request as per Ticimax support example
      // CRITICAL FIX: Use xmlns:ns (not xmlns:a) and send STRING value (not integer)
      const soapBody = `<tem:SetSiparisDurum xmlns:tem="http://tempuri.org/">
  <tem:UyeKodu>${this.wsAuthCode}</tem:UyeKodu>
  <tem:request xmlns:ns="http://schemas.datacontract.org/2004/07/">
    <ns:Durum>${durumString}</ns:Durum>
    <ns:SiparisID>${orderId}</ns:SiparisID>
  </tem:request>
</tem:SetSiparisDurum>`

      console.log(`📤 Ticimax SetSiparisDurum request for order ${orderId} (${orderNumber || 'no number'}), status ${statusId} → "${durumString}"`)
      console.log(`📋 SOAP Body:\n${soapBody}`)

      await this.makeSoapRequest('SetSiparisDurum', soapBody)

      console.log(`✅ Order ${orderId} status updated to "${durumString}"`)
    } catch (error: any) {
      console.error('❌ Ticimax SetSiparisDurum error:', error.message)
      throw new Error(`Ticimax API Error: ${error.message}`)
    }
  }

  /**
   * Ticimax Durum ID'sini Türkçe durum adına çevirir
   * @param durumId - Ticimax Durum field değeri (0-17)
   * @returns Türkçe durum adı
   */
  getDurumName(durumId: number): string {
    const durumMap: Record<number, string> = {
      0: 'Ön sipariş',
      1: 'Onay bekliyor',
      2: 'Onaylandı',
      3: 'Ödeme bekliyor',
      4: 'Paketleniyor',
      5: 'Tedarik ediliyor',
      6: 'Kargoya verildi',
      7: 'Teslim edildi',
      8: 'İptal edildi',
      9: 'İade edildi',
      10: 'Silinmiş',
      11: 'İade talebi alındı',
      12: 'İade ulaştı ödeme yapılacak',
      13: 'İade ödemesi yapıldı',
      14: 'Teslimat öncesi iptal talebi',
      15: 'İptal talebi',
      16: 'Kısmi iade talebi',
      17: 'Kısmi iade yapıldı',
    }

    return durumMap[durumId] || `Bilinmeyen durum (${durumId})`
  }
}

// Singleton instance
let ticimaxClient: TicimaxSOAPClient | null = null

export function getTicimaxClient(): TicimaxSOAPClient {
  if (!ticimaxClient) {
    ticimaxClient = new TicimaxSOAPClient()
  }
  return ticimaxClient
}

export default getTicimaxClient
