const axios = require('axios');
const xml2js = require('xml2js');

const apiKey = 'ae57daa8-82b1-4101-bed1-b8f553cb358f';
const apiSecret = 'YD4Vb4mSAA8IB9Ot';

const builder = new xml2js.Builder({
  xmldec: { version: '1.0', encoding: 'UTF-8' },
});

// Test 1: Simple order list request
async function testOrderList() {
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
          pagingData: {
            currentPage: 0,
            pageSize: 5,
          },
        },
      },
    },
  };

  const xmlRequest = builder.buildObject(requestBody);

  console.log('📤 Sending XML Request:');
  console.log(xmlRequest);
  console.log('\n');

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

    console.log('✅ Response Status:', response.status);
    console.log('📥 Response Data:');
    console.log(response.data);
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testOrderList();
