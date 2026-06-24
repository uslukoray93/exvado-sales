const axios = require('axios');

const apiKey = 'X4wSIiYQnfGXyDlumDtj';
const apiSecret = 'nLGfeR38MpMNGHTPfuWU';
const supplierId = '354335';
const orderNumber = '11313853581';

async function syncSpecificOrder() {
  try {
    console.log(`🔄 Trendyol API'den sipariş ${orderNumber} çekiliyor...`);

    const trendyolClient = axios.create({
      baseURL: 'https://api.trendyol.com/sapigw/suppliers',
      auth: { username: apiKey, password: apiSecret },
    });

    const response = await trendyolClient.get(`/${supplierId}/orders`, {
      params: { orderNumber: orderNumber }
    });

    if (!response.data.content || response.data.content.length === 0) {
      console.error('❌ Sipariş bulunamadı!');
      process.exit(1);
    }

    const order = response.data.content[0];
    console.log('✅ Sipariş bulundu!');
    console.log('   Status:', order.status);
    console.log('   Tarih:', new Date(order.orderDate).toLocaleString('tr-TR'));
    console.log('   Müşteri:', order.customerFirstName, order.customerLastName);

    // 2. Veritabanına sync et - Trendyol sync endpoint'ini tetikle
    console.log('\n🔄 Veritabanına sync ediliyor...');

    // Direkt local Prisma ile sync yapalım
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    // Status mapping
    const statusMap = {
      'Created': 'PENDING',
      'Picking': 'PROCESSING',
      'Invoiced': 'READY_TO_SHIP',
      'Shipped': 'SHIPPED',
      'Delivered': 'DELIVERED',
      'UnDelivered': 'SHIPPED',
      'Cancelled': 'CANCELLED',
    };

    let mappedStatus = statusMap[order.status] || 'PENDING';

    // AUTO-COMPLETE: 14+ günlük DELIVERED siparişleri otomatik COMPLETED yap
    // (İade/değişim süresi ve kargo gecikmelerini kapsamak için 14 gün)
    const orderDate = new Date(order.orderDate);
    const daysSinceOrder = Math.floor((Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24));

    console.log(`   Sipariş ${daysSinceOrder} gün önce verildi`);

    if (mappedStatus === 'DELIVERED' && daysSinceOrder >= 14) {
      console.log(`   📦 ${daysSinceOrder} gün önce teslim edildi, otomatik COMPLETED yapılıyor`);
      mappedStatus = 'COMPLETED';
    }

    const dbOrderNumber = `TY-${order.orderNumber}`;

    // Upsert order
    const dbOrder = await prisma.order.upsert({
      where: { orderNumber: dbOrderNumber },
      update: {
        status: mappedStatus,
        customerName: order.shipmentAddress?.fullName || `${order.customerFirstName || ''} ${order.customerLastName || ''}`.trim() || 'Unknown',
        customerPhone: order.shipmentAddress?.phone || 'Belirtilmemiş',
        customerAddress: order.shipmentAddress?.fullAddress || 'Unknown',
        trackingNumber: order.cargoTrackingNumber ? String(order.cargoTrackingNumber) : null,
        commissionRate: 17,
      },
      create: {
        orderNumber: dbOrderNumber,
        platform: 'TRENDYOL',
        platformOrderId: String(order.orderId || order.orderNumber),
        customerName: order.shipmentAddress?.fullName || `${order.customerFirstName || ''} ${order.customerLastName || ''}`.trim() || 'Unknown',
        customerPhone: order.shipmentAddress?.phone || 'Belirtilmemiş',
        customerAddress: order.shipmentAddress?.fullAddress || 'Unknown',
        status: mappedStatus,
        orderDate: new Date(order.orderDate),
        trackingNumber: order.cargoTrackingNumber ? String(order.cargoTrackingNumber) : null,
        commissionRate: 17,
        shippingCost: 0,
        items: {
          create: order.lines.map((line) => ({
            productName: line.productName,
            stockCode: line.merchantSku || null,
            sku: line.barcode,
            quantity: line.quantity,
            purchasePrice: 0,
            salePrice: line.price,
          })),
        },
      },
    });

    await prisma.$disconnect();

    console.log('\n✅ Sipariş başarıyla sync edildi!');
    console.log('   Veritabanı ID:', dbOrder.id);
    console.log('   Final Status:', dbOrder.status);

  } catch (error) {
    console.error('❌ HATA:', error.message);
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

syncSpecificOrder();
