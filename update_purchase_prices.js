const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Mevcut database'deki tüm order item'ların alış fiyatlarını
 * Bolbolbul XML'den çekip günceller
 */
(async () => {
  console.log('🔄 Alış fiyatı güncelleme başlatılıyor...\n');

  try {
    // 1. Alış fiyatı 0 veya null olan tüm order item'ları al
    const itemsToUpdate = await prisma.orderItem.findMany({
      where: {
        purchasePrice: { lte: 0 }, // 0 veya daha küçük (null dahil)
        stockCode: { not: null } // Stock code olmayanları atlıyoruz
      },
      select: {
        id: true,
        productName: true,
        stockCode: true,
        purchasePrice: true,
        Order: {
          select: {
            orderNumber: true,
            platform: true
          }
        }
      }
    });

    console.log(`📊 Toplam ${itemsToUpdate.length} ürün bulundu (alış fiyatı 0 veya null)\n`);

    if (itemsToUpdate.length === 0) {
      console.log('✅ Güncellenmesi gereken ürün yok!');
      await prisma.$disconnect();
      return;
    }

    // 2. Benzersiz stock code'ları topla
    const stockCodes = [...new Set(itemsToUpdate.map(item => item.stockCode).filter(Boolean))];
    console.log(`🔍 ${stockCodes.length} benzersiz stok kodu için Bolbolbul XML'den fiyat çekiliyor...\n`);

    // 3. Bolbolbul XML'den alış fiyatlarını çek
    const bolbolbulModule = await import('./lib/api/bolbolbul-xml.ts');
    const getBolbolbulXMLClient = bolbolbulModule.default.getBolbolbulXMLClient || bolbolbulModule.getBolbolbulXMLClient;
    const bolbolbulClient = getBolbolbulXMLClient();
    const priceMap = await bolbolbulClient.getPurchasePrices(stockCodes);

    console.log(`💰 ${priceMap.size} ürün için fiyat bulundu\n`);

    // 4. Her bir item'ı güncelle
    let updatedCount = 0;
    let notFoundCount = 0;

    for (const item of itemsToUpdate) {
      const purchasePrice = priceMap.get(item.stockCode);

      if (purchasePrice && purchasePrice > 0) {
        await prisma.orderItem.update({
          where: { id: item.id },
          data: { purchasePrice }
        });

        console.log(`✅ ${item.Order.orderNumber} - ${item.productName} (${item.stockCode}): ${purchasePrice} TL`);
        updatedCount++;
      } else {
        console.log(`⚠️  ${item.Order.orderNumber} - ${item.productName} (${item.stockCode}): Fiyat bulunamadı`);
        notFoundCount++;
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log(`\n📊 ÖZET:`);
    console.log(`  ✅ Güncellenen: ${updatedCount} ürün`);
    console.log(`  ⚠️  Bulunamayan: ${notFoundCount} ürün`);
    console.log(`  📦 Toplam: ${itemsToUpdate.length} ürün`);
    console.log(`\n✨ İşlem tamamlandı!\n`);

  } catch (error) {
    console.error('\n❌ Hata:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
})();
