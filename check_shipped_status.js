const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  // Trendyol'dan API durumlarını al
  console.log('🔄 Trendyol API\'den gerçek durumları alınıyor...\n');

  const trendyolResponse = await fetch('http://localhost:3000/api/orders/trendyol');
  const trendyolData = await trendyolResponse.json();

  if (!trendyolData.success) {
    console.error('❌ Trendyol sync hatası:', trendyolData.error);
    return;
  }

  console.log('🔄 N11 API\'den gerçek durumları alınıyor...\n');

  const n11Response = await fetch('http://localhost:3000/api/orders/n11');
  const n11Data = await n11Response.json();

  if (!n11Data.success) {
    console.error('❌ N11 sync hatası:', n11Data.error);
    return;
  }

  // Şimdi kargoda olanları tekrar kontrol et
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

  console.log('📦 KARGODA OLAN SİPARİŞLER (SYNC SONRASI):');
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
