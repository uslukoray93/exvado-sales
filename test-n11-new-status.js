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

// Test: Get orders with "Yeni" status (waiting for approval)
async function getNewOrders() {
  console.log('🔍 Status=Yeni olan siparişleri çekiyorum...');
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
            status: 'Yeni',
          },
          pagingData: {
            currentPage: 0,
            pageSize: 20,
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
      const totalCount = orderListResponse.pagingData?.totalCount || 0;
      const orders = orderListResponse.orderList?.order || [];
      const orderArray = Array.isArray(orders) ? orders : (orders ? [orders] : []);

      console.log(`✅ "Yeni" durumunda ${totalCount} sipariş bulundu:`);
      console.log('');

      if (orderArray.length > 0) {
        orderArray.forEach((order, i) => {
          console.log(`${i + 1}. 📦 Sipariş No: ${order.orderNumber} (ID: ${order.id})`);
          console.log(`   Status: ${order.status}`);
        });
      } else {
        console.log('⚠️  Hiç "Yeni" sipariş yok.');
      }

      // Onaylandı durumundakileri de kontrol et
      console.log('\n\n🔍 Status=Onaylandı olan siparişleri kontrol ediyorum...');

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
                status: 'Onaylandı',
              },
              pagingData: {
                currentPage: 0,
                pageSize: 20,
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
      const totalCount2 = orderListResponse2.pagingData?.totalCount || 0;
      const orders2 = orderListResponse2.orderList?.order || [];
      const orderArray2 = Array.isArray(orders2) ? orders2 : (orders2 ? [orders2] : []);

      console.log(`\n✅ "Onaylandı" durumunda ${totalCount2} sipariş bulundu:`);
      if (orderArray2.length > 0) {
        orderArray2.forEach((order, i) => {
          console.log(`${i + 1}. 📦 Sipariş No: ${order.orderNumber} (ID: ${order.id})`);
          console.log(`   Status: ${order.status}`);
        });
      }

    } else {
      console.log('❌ Hata:', orderListResponse?.result?.errorMessage || 'Bilinmeyen hata');
    }
  } catch (error) {
    console.error('❌ API Hatası:', error.message);
    if (error.response) {
      console.error('Yanıt:', error.response.data.substring(0, 500));
    }
  }
}

getNewOrders();
