const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  const shippedOrders = await prisma.order.findMany({
    where: { status: 'SHIPPED' },
    select: {
      orderNumber: true,
      platform: true,
      customerName: true,
      status: true
    },
    orderBy: { orderNumber: 'asc' }
  });

  console.log('📦 KARGODA OLAN SİPARİŞLER:');
  console.log('='.repeat(60));

  const trendyol = shippedOrders.filter(o => o.platform === 'TRENDYOL');
  const n11 = shippedOrders.filter(o => o.platform === 'N11');

  console.log(`\nTRENDYOL (${trendyol.length}):`);
  trendyol.forEach(o => console.log(`  - ${o.orderNumber} | ${o.customerName}`));

  console.log(`\nN11 (${n11.length}):`);
  n11.forEach(o => console.log(`  - ${o.orderNumber} | ${o.customerName}`));

  console.log(`\n📊 TOPLAM: ${shippedOrders.length} (${trendyol.length} Trendyol + ${n11.length} N11)`);

  await prisma.$disconnect();
})();
