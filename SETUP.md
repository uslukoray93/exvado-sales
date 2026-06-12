# Exvado Sales - Kurulum Rehberi

## 🚀 Çoklu Platform Sipariş Entegrasyonu

Bu proje Trendyol, N11 ve Bolbolbul platformlarından siparişleri otomatik olarak çeker ve yönetir.

---

## 📋 Gereksinimler

- Node.js 18+
- PostgreSQL 14+
- npm veya yarn

---

## ⚙️ Kurulum Adımları

### 1. Bağımlılıkları Yükle

```bash
npm install
```

### 2. PostgreSQL Veritabanı Oluştur

```sql
CREATE DATABASE exvado_sales;
```

### 3. Environment Variables Ayarla

`.env.local` dosyasını düzenle ve gerekli bilgileri gir:

```env
# PostgreSQL Database
DATABASE_URL="postgresql://username:password@localhost:5432/exvado_sales?schema=public"

# Trendyol API Credentials
TRENDYOL_API_KEY="your_trendyol_api_key"
TRENDYOL_API_SECRET="your_trendyol_api_secret"
TRENDYOL_SUPPLIER_ID="your_supplier_id"

# N11 API Credentials
N11_API_KEY="your_n11_api_key"
N11_API_SECRET="your_n11_api_secret"

# Bolbolbul API Credentials
BOLBOLBUL_API_KEY="your_bolbolbul_api_key"
BOLBOLBUL_API_SECRET="your_bolbolbul_api_secret"

# Cron Job Security
CRON_SECRET="your-secure-random-secret"
```

### 4. Prisma Migration Çalıştır

```bash
npx prisma migrate dev --name init
```

### 5. Prisma Client Oluştur

```bash
npx prisma generate
```

### 6. Geliştirme Sunucusunu Başlat

```bash
PORT=3020 npm run dev
```

Tarayıcıda `http://localhost:3020` adresini aç.

---

## 🔄 API Endpoints

### Sipariş Senkronizasyonu

#### Tüm Platformları Senkronize Et
```bash
GET /api/orders/sync
```

#### Platform Bazlı Senkronizasyon
```bash
GET /api/orders/trendyol
GET /api/orders/n11
GET /api/orders/bolbolbul
```

#### Siparişleri Listele
```bash
GET /api/orders/list
GET /api/orders/list?platform=trendyol
GET /api/orders/list?status=pending
GET /api/orders/list?search=ORD-2026-001
```

#### Sipariş Güncelle
```bash
PATCH /api/orders/list
Body: {
  "orderId": "xxx",
  "status": "shipped",
  "trackingNumber": "123456789"
}
```

---

## ⏰ Otomatik Senkronizasyon

### Frontend (Orders Sayfası)
Orders sayfası her **10 dakikada bir** otomatik olarak tüm platformları senkronize eder.

### Backend (Cron Job)
Vercel'e deploy edildiğinde, `/api/cron/sync-orders` endpoint'i her **10 dakikada bir** otomatik çalışır.

#### Manuel Cron Test
```bash
curl -X GET http://localhost:3020/api/cron/sync-orders \
  -H "Authorization: Bearer your-cron-secret"
```

---

## 🗄️ Database Yapısı

### Order Tablosu
- `id`: Unique identifier
- `orderNumber`: Sipariş numarası (TY-xxx, N11-xxx, BBB-xxx)
- `platform`: Platform (TRENDYOL, N11, HEPSIBURADA, BOLBOLBUL)
- `platformOrderId`: Platform'daki orijinal sipariş ID
- `customerName`: Müşteri adı
- `customerPhone`: Müşteri telefon
- `customerAddress`: Müşteri adresi
- `status`: Sipariş durumu
- `commissionRate`: Komisyon oranı (%)
- `shippingCost`: Kargo maliyeti
- `orderDate`: Sipariş tarihi
- `trackingNumber`: Kargo takip numarası
- `invoiceUrl`: Fatura URL'i

### OrderItem Tablosu
- `id`: Unique identifier
- `orderId`: Sipariş ID (foreign key)
- `productName`: Ürün adı
- `sku`: Ürün kodu
- `quantity`: Adet
- `purchasePrice`: Alış fiyatı
- `salePrice`: Satış fiyatı

---

## 🎯 Özellikler

✅ Çoklu platform entegrasyonu (Trendyol, N11, Bolbolbul)
✅ Otomatik sipariş senkronizasyonu
✅ Real-time sipariş yönetimi
✅ Kar hesaplama (satış - alış - komisyon - kargo)
✅ Platform bazlı iş akışları
✅ Responsive tasarım
✅ Dark mode devre dışı (light mode only)
✅ PostgreSQL veritabanı

---

## 📝 Notlar

1. **API Credentials**: Gerçek API key'lerinizi `.env.local` dosyasına girmeyi unutmayın.

2. **Database**: PostgreSQL kurulu ve çalışır durumda olmalı.

3. **N11 API**: N11 SOAP/XML API kullanır, `xml2js` kütüphanesi eklemeniz gerekebilir:
   ```bash
   npm install xml2js
   ```

4. **İlk Sync**: İlk kez çalıştırdığınızda Orders sayfasındaki "Yenile" butonuna basarak siparişleri çekin.

5. **Cron Job Security**: `CRON_SECRET` değerini mutlaka değiştirin ve güvenli tutun.

---

## 🐛 Sorun Giderme

### Database Connection Error
- PostgreSQL'in çalıştığından emin olun
- `DATABASE_URL` formatını kontrol edin
- Database'in oluşturulduğunu doğrulayın

### API Errors
- API credential'ların doğru olduğunu kontrol edin
- Platform API dokümantasyonlarını inceleyin
- Network bağlantısını kontrol edin

### Prisma Errors
```bash
npx prisma generate
npx prisma migrate reset
npx prisma migrate dev
```

---

## 📚 Daha Fazla Bilgi

- [Trendyol API Docs](https://developers.trendyol.com/)
- [N11 API Docs](https://www.n11.com/apidoc/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)

---

## 🎉 Hazırsınız!

Artık Exvado Sales'i kullanmaya başlayabilirsiniz. İyi çalışmalar!
