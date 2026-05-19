const axios = require('axios');

const apiKey = 'ae57daa8-82b1-4101-bed1-b8f553cb358f';
const apiSecret = 'YD4Vb4mSAA8IB9Ot';

async function getOrdersREST() {
  console.log('🚀 N11 REST API ile sipariş çekiyorum...');
  console.log('   Status: Created (Yeni siparişler)');
  console.log('');

  try {
    const response = await axios.get(
      'https://api.n11.com/rest/delivery/v1/shipmentPackages',
      {
        headers: {
          'appkey': apiKey,
          'appsecret': apiSecret,
        },
        params: {
          status: 'Created',
          page: 0,
          size: 20,
          orderByDirection: 'DESC',
        },
        timeout: 30000,
      }
    );

    console.log('✅ Başarılı!');
    console.log('');
    console.log(`📊 Toplam: ${response.data.totalElements} sipariş`);
    console.log(`   Sayfalar: ${response.data.totalPages}`);
    console.log(`   Bu sayfada: ${response.data.content.length} sipariş`);
    console.log('');

    if (response.data.content.length > 0) {
      console.log('📦 "Created" durumundaki siparişler:');
      console.log('');
      response.data.content.forEach((order, i) => {
        console.log(`${i + 1}. Sipariş No: ${order.orderNumber}`);
        console.log(`   Paket ID: ${order.id}`);
        console.log(`   Müşteri: ${order.customerfullName || order.shippingAddress.fullName}`);
        console.log(`   Status: ${order.shipmentPackageStatus}`);
        console.log(`   Tarih: ${new Date(order.lastModifiedDate).toLocaleString('tr-TR')}`);
        console.log(`   Ürün sayısı: ${order.lines?.length || 0}`);
        if (order.lines && order.lines.length > 0) {
          console.log(`   Ürün: ${order.lines[0].productName}`);
        }
        console.log('');
      });
    } else {
      console.log('⚠️  "Created" durumunda sipariş yok.');
      console.log('');
      console.log('Tüm status türlerini kontrol edeyim...');
      console.log('');

      // Tüm status'leri dene
      const statuses = ['Created', 'Picking', 'Shipped', 'Cancelled', 'Delivered', 'UnPacked', 'UnSupplied'];

      for (const status of statuses) {
        try {
          const res = await axios.get(
            'https://api.n11.com/rest/delivery/v1/shipmentPackages',
            {
              headers: {
                'appkey': apiKey,
                'appsecret': apiSecret,
              },
              params: {
                status: status,
                page: 0,
                size: 1,
              },
              timeout: 30000,
            }
          );
          console.log(`${status}: ${res.data.totalElements} sipariş`);
        } catch (err) {
          console.log(`${status}: Hata - ${err.message}`);
        }
      }
    }
  } catch (error) {
    console.error('❌ Hata:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

getOrdersREST();
