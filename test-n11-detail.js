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

// Test: Get order detail
async function testOrderDetail() {
  const orderId = '271934598'; // First order from list

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

  console.log('📤 Sending OrderDetail Request for order:', orderId);
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
    console.log('\n📥 Raw XML Response:');
    console.log(response.data);
    console.log('\n');

    // Parse and pretty print
    const parsed = await parser.parseStringPromise(response.data);
    console.log('📋 Parsed Response:');
    console.log(JSON.stringify(parsed, null, 2));
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testOrderDetail();
