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

// Test: Get today's orders
async function getTodayOrders() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  console.log('📅 Bugünün N11 siparişlerini çekiyorum...');
  console.log(`   Tarih aralığı: ${today.toISOString()} - ${tomorrow.toISOString()}`);
  console.log('');

  const requestBody = {
    'soapenv:Envelope': {
      $: {
        'xmlns:soapenv': 'http://schemas.xmlsoap.org/soap/envelope/',
        'xmlns:sch': 'http://www.n11.com/ws/schemas',
      },
      'soapenv:Header': {},
      'soapenv:Body': {
        'sch:OrderListRequest': {
          auth: {
            appKey: apiKey,
            appSecret: apiSecret,
          },
          searchData: {
            period: {
              startDate: today.toISOString(),
              endDate: tomorrow.toISOString(),
            },
          },
          pagingData: {
            currentPage: 0,
            pageSize: 50,
          },
        },
      },
    },
  };

  const xmlRequest = builder.buildObject(requestBody);

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

    const parsed = await parser.parseStringPromise(response.data);
    const orderListResponse = parsed['SOAP-ENV:Envelope']['SOAP-ENV:Body']['ns3:OrderListResponse'];

    if (orderListResponse?.result?.status === 'success') {
      const orders = orderListResponse.orderList?.order || [];
      const orderArray = Array.isArray(orders) ? orders : [orders];

      console.log(`✅ Bugün ${orderArray.length} sipariş bulundu:`);
      console.log('');

      orderArray.forEach((order, i) => {
        console.log(`${i + 1}. Sipariş:`);
        console.log(`   Sipariş No: ${order.orderNumber}`);
        console.log(`   ID: ${order.id}`);
        console.log(`   Status: ${order.status}`);
        console.log('');
      });

      if (orderArray.length === 0) {
        console.log('⚠️  Bugün hiç sipariş yok.');
        console.log('');
        console.log('Son 3 günün siparişlerini kontrol ediyorum...');

        // Son 3 gün
        const threeDaysAgo = new Date(today);
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

        const requestBody2 = {
          'soapenv:Envelope': {
            $: {
              'xmlns:soapenv': 'http://schemas.xmlsoap.org/soap/envelope/',
              'xmlns:sch': 'http://www.n11.com/ws/schemas',
            },
            'soapenv:Header': {},
            'soapenv:Body': {
              'sch:OrderListRequest': {
                auth: {
                  appKey: apiKey,
                  appSecret: apiSecret,
                },
                searchData: {
                  period: {
                    startDate: threeDaysAgo.toISOString(),
                    endDate: tomorrow.toISOString(),
                  },
                },
                pagingData: {
                  currentPage: 0,
                  pageSize: 10,
                },
              },
            },
          },
        };

        const xmlRequest2 = builder.buildObject(requestBody2);
        const response2 = await axios.post(
          'https://api.n11.com/ws/OrderService.wsdl',
          xmlRequest2,
          {
            headers: {
              'Content-Type': 'text/xml; charset=utf-8',
              'User-Agent': 'ExvadoSales/1.0',
            },
            timeout: 30000,
          }
        );

        const parsed2 = await parser.parseStringPromise(response2.data);
        const orderListResponse2 = parsed2['SOAP-ENV:Envelope']['SOAP-ENV:Body']['ns3:OrderListResponse'];
        const orders2 = orderListResponse2.orderList?.order || [];
        const orderArray2 = Array.isArray(orders2) ? orders2 : [orders2];

        console.log(`\n📦 Son 3 günde ${orderArray2.length} sipariş:`);
        orderArray2.forEach((order, i) => {
          console.log(`   ${i + 1}. ${order.orderNumber} | Status: ${order.status}`);
        });
      }
    } else {
      console.log('❌ Hata:', orderListResponse?.result?.errorMessage || 'Bilinmeyen hata');
    }
  } catch (error) {
    console.error('❌ API Hatası:', error.message);
    if (error.response) {
      console.error('Yanıt:', error.response.data);
    }
  }
}

getTodayOrders();
