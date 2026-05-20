const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  console.log('🔄 N11 API\'den tüm siparişler çekiliyor...\n');

  const response = await fetch('http://localhost:3000/api/orders/n11');
  const data = await response.json();

  if (!data.success) {
    console.error('❌ N11 sync hatası:', data.error);
    await prisma.$disconnect();
    return;
  }

  // Database'de SHIPPED olan 5 siparişin N11 API'deki durumları
  const dbShippedOrderNumbers = [
    'N11-206613781333',
    'N11-206966281330',
    'N11-207826561338',
    'N11-204377721338',
    'N11-207922821338'
  ];

  console.log('📦 DATABASE\'DE SHIPPED OLAN SİPARİŞLERİN N11 API\'DEKİ DURUMLARI:');
  console.log('='.repeat(70));

  for (const orderNum of dbShippedOrderNumbers) {
    const apiOrder = data.data.find(o => o.orderNumber === orderNum);

    if (apiOrder) {
      console.log(`\n${orderNum}`);
      console.log(`  N11 API Status: ${apiOrder.status}`);
      console.log(`  Müşteri: ${apiOrder.customerName}`);
    } else {
      console.log(`\n${orderNum}`);
      console.log(`  ❌ N11 API response'da bulunamadı (eski tarihli olabilir)`);
    }
  }

  // API'den gelen tüm siparişlerin status dağılımı
  console.log('\n\n📊 N11 API RESPONSE - STATUS DAĞILIMI:');
  console.log('='.repeat(70));

  const statusCounts = {};
  data.data.forEach(order => {
    statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
  });

  Object.entries(statusCounts).forEach(([status, count]) => {
    console.log(`  ${status}: ${count} sipariş`);
  });

  console.log(`\nToplam: ${data.data.length} sipariş`);

  await prisma.$disconnect();
})();
