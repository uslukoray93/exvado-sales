const axios = require('axios');
const xml2js = require('xml2js');

const apiKey = 'ae57daa8-82b1-4101-bed1-b8f553cb358f';
const apiSecret = 'YD4Vb4mSAA8IB9Ot';

const builder = new xml2js.Builder({
  xmldec: { version: '1.0', encoding: 'UTF-8' },
});

const parser = new xml2js.Parser({
  explicitArray: false,
  ignoreAttrs: false,
  mergeAttrs: true,
});

// Test: Get order detail for 386282162
async function testOrderDetail() {
  const orderId = '386282162'; // N11-206788515331

  const requestBody = {
    'soapenv:Envelope': {
      $: {
        'xmlns:soapenv': 'http://schemas.xmlsoap.org/soap/envelope/',
        'xmlns:sch': 'http://www.n11.com/ws/schemas',
      },
      'soapenv:Header': {},
      'soapenv:Body': {
        'sch:OrderDetailRequest': {
          auth: {
            appKey: apiKey,
            appSecret: apiSecret,
          },
          orderRequest: {
            id: orderId,
          },
        },
      },
    },
  };

  const xmlRequest = builder.buildObject(requestBody);

  console.log('📤 Sipariş Detayı Çekiliyor: N11-206788515331 (ID: 386282162)');
  console.log('');

  try {
    const response = await axios.post(
      'https://api.n11.com/ws/OrderService.wsdl',
      xmlRequest,
      {
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'User-Agent': 'ExvadoSales/1.0',
        },
        timeout: 30000,
      }
    );

    console.log('✅ Başarılı');
    console.log('');

    // Parse
    const parsed = await parser.parseStringPromise(response.data);
    const orderDetail = parsed['SOAP-ENV:Envelope']['SOAP-ENV:Body']['ns3:OrderDetailResponse']?.orderDetail;

    if (orderDetail) {
      console.log('📦 SİPARİŞ DETAYI:');
      console.log('==================');
      console.log(`Sipariş No: ${orderDetail.orderNumber}`);
      console.log(`Sipariş ID: ${orderDetail.id}`);
      console.log(`Tarih: ${orderDetail.createDate}`);
      console.log(`Status Kodu: ${orderDetail.status}`);
      console.log(`Payment Type: ${orderDetail.paymentType}`);
      console.log('');
      console.log('👤 MÜŞTERİ BİLGİLERİ:');
      console.log('==================');
      console.log(`Alıcı Ad: ${orderDetail.buyer?.fullName}`);
      console.log(`Fatura Ad: ${orderDetail.billingAddress?.fullName}`);
      console.log(`Kargo Ad: ${orderDetail.shippingAddress?.fullName}`);
      console.log(`Telefon: ${orderDetail.buyer?.email}`);
      console.log('');
      console.log('📍 KARGO ADRESİ:');
      console.log('==================');
      console.log(`${orderDetail.shippingAddress?.fullName}`);
      console.log(`${orderDetail.shippingAddress?.address}`);
      console.log(`${orderDetail.shippingAddress?.district} / ${orderDetail.shippingAddress?.city}`);
    } else {
      console.log('❌ Sipariş detayı bulunamadı');
    }
  } catch (error) {
    console.error('❌ Hata:', error.message);
    if (error.response) {
      console.error('Yanıt:', error.response.data);
    }
  }
}

testOrderDetail();
