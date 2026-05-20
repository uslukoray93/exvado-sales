const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  console.log('🔄 N11 FULL SYNC başlatılıyor (son 4 ay)...\n');

  const response = await fetch('http://localhost:3000/api/orders/n11?syncAll=true');
  const data = await response.json();

  if (!data.success) {
    console.error('❌ N11 full sync hatası:', data.error);
    await prisma.$disconnect();
    return;
  }

  console.log(`✅ N11 Full Sync tamamlandı: ${data.data.length} sipariş senkronize edildi\n`);

  // Database'den N11 SHIPPED siparişlerini al
  const shippedOrders = await prisma.order.findMany({
    where: {
      platform: 'N11',
      status: 'SHIPPED'
    },
    select: {
      orderNumber: true,
      customerName: true,
      trackingNumber: true,
      orderDate: true,
      status: true
    },
    orderBy: { orderDate: 'desc' }
  });

  console.log('📦 N11 KARGODA OLAN SİPARİŞLER (Full Sync Sonrası):');
  console.log('='.repeat(60));

  shippedOrders.forEach(order => {
    console.log(`\n${order.orderNumber}`);
    console.log(`  Müşteri: ${order.customerName}`);
    console.log(`  Takip No: ${order.trackingNumber || 'Yok'}`);
    console.log(`  Sipariş Tarihi: ${order.orderDate.toISOString().split('T')[0]}`);
  });

  console.log(`\n📊 TOPLAM: ${shippedOrders.length} sipariş kargoda`);

  await prisma.$disconnect();
})();
