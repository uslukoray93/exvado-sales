const axios = require('axios');

const apiKey = 'ae57daa8-82b1-4101-bed1-b8f553cb358f';
const apiSecret = 'YD4Vb4mSAA8IB9Ot';

async function checkAllStatuses() {
  console.log('🔍 Tüm N11 status türlerini kontrol ediyorum...');
  console.log('');

  // Son 7 günün siparişleri
  const now = Date.now();
  const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);

  const statuses = ['Created', 'Picking', 'Shipped', 'Cancelled', 'Delivered', 'UnPacked', 'UnSupplied'];

  for (const status of statuses) {
    try {
      const response = await axios.get(
        'https://api.n11.com/rest/delivery/v1/shipmentPackages',
        {
          headers: {
            'appkey': apiKey,
            'appsecret': apiSecret,
          },
          params: {
            status: status,
            startDate: sevenDaysAgo,
            endDate: now,
            page: 0,
            size: 5,
          },
          timeout: 30000,
        }
      );

      const count = response.data.totalElements || response.data.content?.length || 0;
      console.log(`${status.padEnd(12)} : ${count} sipariş`);

      if (response.data.content && response.data.content.length > 0) {
        response.data.content.forEach((order, i) => {
          console.log(`  ${i + 1}. ${order.orderNumber} | ${order.customerfullName || order.shippingAddress?.fullName}`);
        });
      }
      console.log('');
    } catch (err) {
      console.log(`${status.padEnd(12)} : Hata - ${err.message}`);
      console.log('');
    }
  }
}

checkAllStatuses();
