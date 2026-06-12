const axios = require('axios');

const apiKey = 'ae57daa8-82b1-4101-bed1-b8f553cb358f';
const apiSecret = 'YD4Vb4mSAA8IB9Ot';

async function checkOrder() {
  const orderNumber = '206788515331';

  console.log(`🔍 Sipariş ${orderNumber} kontrol ediliyor...`);
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
          orderNumber: orderNumber,
          page: 0,
          size: 10,
        },
        timeout: 30000,
      }
    );

    const count = response.data.totalElements || response.data.content?.length || 0;
    console.log(`✅ Toplam: ${count} paket`);
    console.log('');

    if (response.data.content && response.data.content.length > 0) {
      response.data.content.forEach((order, i) => {
        console.log(`Paket ${i + 1}:`);
        console.log(`  Paket ID: ${order.id}`);
        console.log(`  Status: ${order.shipmentPackageStatus}`);
        console.log(`  Müşteri: ${order.customerfullName || order.shippingAddress?.fullName}`);
        console.log(`  Son Güncelleme: ${new Date(order.lastModifiedDate).toLocaleString('tr-TR')}`);
        console.log('');
      });
    } else {
      console.log('⚠️  Sipariş bulunamadı veya silinmiş.');
    }
  } catch (err) {
    console.error('❌ Hata:', err.message);
    if (err.response) {
      console.error('Status:', err.response.status);
    }
  }
}

checkOrder();
