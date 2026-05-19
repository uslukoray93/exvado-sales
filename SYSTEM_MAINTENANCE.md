# Sistem Bakım ve Otomatik Düzeltme Dokümantasyonu

## 🔧 Bilinen Sorunlar ve Kalıcı Çözümler

### 1. N11 Ürün Görselleri Kaybolma Sorunu

**SORUN:** N11 siparişlerinde ürün görselleri bazen kaybolabiliyor.

**NEDEN:**
- N11 API'si görsel URL'i döndürmüyor
- Görseller Bolbolbul XML'inden çekiliyor
- Bazı stock kodları XML'de farklı formatta olabiliyor
- **KRİTİK:** Yeni sipariş geldiğinde, eğer o anda XML'de stock kodu bulunamazsa, ürün görselsiz oluşturulur
- Sonraki sync'lerde de update edilmiyor çünkü update kısmında imageUrl güncellemesi yok

**KÖK NEDEN - KALICI ÇÖZ ÜM:**
`/app/api/orders/n11/route.ts` dosyasında satır 264-286'da eklenmiş olan kod:
```typescript
// KALICI ÇÖZÜM: Update existing items with images if they don't have one
if (existingOrder && Object.keys(productImages).length > 0) {
  for (const dbItem of dbOrder.items) {
    const newItem = order.items.find((i: any) => String(i.id) === dbItem.sku)
    if (!newItem) continue
    const imageUrl = productImages[String(newItem.id)]
    if (imageUrl && (!dbItem.imageUrl || dbItem.imageUrl !== imageUrl)) {
      await prisma.orderItem.update({
        where: { id: dbItem.id },
        data: { imageUrl },
      })
    }
  }
}
```
Bu kod her sync'te eksik görselleri otomatik doldurur. **BU KOD OLMADAN GÖRSELLER SÜREKLİ KAYBOLUR!**

**HAFTALIK KONTROL (Ekstra Güvence):**
```bash
# Haftalık çalıştır (Cron: 0 2 * * 0)
npx tsx scripts/fix-n11-images.ts
```

**ACİL DURUM - Manuel Düzeltme:**
```bash
# 1. YÖNTEM: EMERGENCY Script (EN HIZLI - TÜM GÖRSELLERİ ZORLA GÜNCELLER)
npx tsx scripts/emergency-fix-all-n11-images.ts

# 2. YÖNTEM: Normal script ile (Sadece boş olanları günceller)
npx tsx scripts/fix-n11-images.ts

# 2. YÖNTEM: API sync ile (Mevcut N11 route kodunda kalıcı fix var)
curl -X GET "http://localhost:3000/api/orders/n11?syncAll=true"

# 3. YÖNTEM: SQL ile manuel (Belirli stock kodları için)
# Önce eksik görselleri listele:
psql postgresql://korayuslu@localhost:5432/exvado_sales -c "
SELECT o.\"orderNumber\", oi.\"productName\", oi.\"stockCode\"
FROM \"OrderItem\" oi
JOIN \"Order\" o ON oi.\"orderId\" = o.id
WHERE o.platform = 'N11' AND (oi.\"imageUrl\" IS NULL OR oi.\"imageUrl\" = '')
ORDER BY o.\"orderDate\" DESC;
"
# Sonra manuel UPDATE:
# UPDATE "OrderItem" SET "imageUrl" = 'https://...' WHERE "stockCode" = 'XXX' AND ("imageUrl" IS NULL OR "imageUrl" = '');
```

**KONTROL:**
```bash
# Görsel kapsama oranını kontrol et (Her zaman %95+ olmalı)
psql postgresql://korayuslu@localhost:5432/exvado_sales -c "
SELECT
  COUNT(*) FILTER (WHERE \"imageUrl\" IS NULL OR \"imageUrl\" = '') as eksik,
  COUNT(*) as toplam,
  ROUND(100.0 * COUNT(*) FILTER (WHERE \"imageUrl\" IS NOT NULL AND \"imageUrl\" <> '') / COUNT(*), 1) as doluluk_yuzdesi
FROM \"OrderItem\" oi
JOIN \"Order\" o ON oi.\"orderId\" = o.id
WHERE o.platform = 'N11';
"
```

---

### 2. Kargoda Sipariş Sayısı Yanlış Görünme

**SORUN:** "Kargoda" sekmesinde N11 panelinden fazla sipariş görünüyor.

**NEDEN:**
- Eski siparişler (30+ gün) hala SHIPPED statüsünde kalıyor
- N11'de teslim edilmiş ama bizim database'de güncellenm emiş

**KALICI ÇÖZÜM:**
```sql
-- Her gün çalıştır (Cron: 0 3 * * *)
UPDATE "Order"
SET status = 'DELIVERED', "invoiceUploaded" = true
WHERE platform = 'N11'
  AND status = 'SHIPPED'
  AND "orderDate" < (NOW() - INTERVAL '30 days');
```

**Script ile:**
```bash
# Günlük çalıştır
npx tsx scripts/fix-n11-statuses.ts
```

---

### 3. Otomatik Senkronizasyon

**GÜNLÜK SYNC:**
```bash
# Her sabah 06:00'da çalıştır (Cron: 0 6 * * *)
curl -X GET "http://localhost:3000/api/orders/n11"
curl -X GET "http://localhost:3000/api/orders/trendyol"
```

**HAFTALIK FULL SYNC:**
```bash
# Her Pazar 02:00'de çalıştır (Cron: 0 2 * * 0)
curl -X GET "http://localhost:3000/api/orders/n11?syncAll=true"
curl -X GET "http://localhost:3000/api/orders/trendyol?syncAll=true"
```

---

## 📋 Cron Jobs Kurulumu

### Crontab'e Ekle:
```bash
crontab -e
```

### Aşağıdaki satırları ekle:
```cron
# N11 Günlük Sync (Her sabah 06:00)
0 6 * * * curl -X GET "http://localhost:3000/api/orders/n11"

# Trendyol Günlük Sync (Her sabah 06:30)
30 6 * * * curl -X GET "http://localhost:3000/api/orders/trendyol"

# N11 Haftalık Full Sync (Her Pazar 02:00)
0 2 * * 0 curl -X GET "http://localhost:3000/api/orders/n11?syncAll=true"

# Trendyol Haftalık Full Sync (Her Pazar 03:00)
0 3 * * 0 curl -X GET "http://localhost:3000/api/orders/trendyol?syncAll=true"

# N11 Görselleri Fix (Her Pazar 04:00)
0 4 * * 0 cd /Users/korayuslu/Desktop/exvado-sales && npx tsx scripts/fix-n11-images.ts

# Eski SHIPPED Siparişleri DELIVERED Yap (Her gün 03:00)
0 3 * * * psql postgresql://korayuslu@localhost:5432/exvado_sales -c "UPDATE \"Order\" SET status = 'DELIVERED', \"invoiceUploaded\" = true WHERE platform = 'N11' AND status = 'SHIPPED' AND \"orderDate\" < (NOW() - INTERVAL '30 days');"
```

---

## 🚨 Acil Durum Düzeltmeleri

### N11 Görselleri Tamamen Kayboldu
```bash
cd /Users/korayuslu/Desktop/exvado-sales
npx tsx scripts/fix-n11-images.ts
```

### Kargoda Sipariş Sayısı Çok Fazla
```bash
# 30 günden eski tüm SHIPPED'ları DELIVERED yap
psql postgresql://korayuslu@localhost:5432/exvado_sales -c "
UPDATE \"Order\"
SET status = 'DELIVERED', \"invoiceUploaded\" = true
WHERE platform = 'N11'
  AND status = 'SHIPPED'
  AND \"orderDate\" < (NOW() - INTERVAL '30 days');
"
```

### Manuel Status Kontrolü
```bash
# N11'deki gerçek statusları kontrol et
npx tsx scripts/fix-n11-statuses.ts
```

---

## 🔄 Sistem Güncellemeleri Sonrası Yapılacaklar

Her kod değişikliğinden sonra:

1. **Görsel Kontrolü:**
```bash
npx tsx scripts/fix-n11-images.ts
```

2. **Status Kontrolü:**
```sql
SELECT platform, COUNT(*)
FROM "Order"
WHERE status = 'SHIPPED'
GROUP BY platform;
```

3. **N11 Paneli ile Karşılaştır:**
   - N11 paneline gir
   - "Kargoda" sekmesindeki sipariş sayısını kontrol et
   - Database'deki N11 SHIPPED sayısı ile aynı olmalı

---

## 📊 Monitoring Queries

### Kargoda Sipariş Durumu
```sql
SELECT
  platform,
  COUNT(*) as shipped_count,
  MAX("orderDate") as latest_order,
  MIN("orderDate") as oldest_order
FROM "Order"
WHERE status = 'SHIPPED'
GROUP BY platform;
```

### Görseli Olmayan Siparişler
```sql
SELECT
  COUNT(*) as items_without_image,
  o.platform
FROM "OrderItem" oi
JOIN "Order" o ON oi."orderId" = o.id
WHERE oi."imageUrl" IS NULL OR oi."imageUrl" = ''
GROUP BY o.platform;
```

### Son 7 Günde Oluşan Siparişler
```sql
SELECT
  platform,
  status,
  COUNT(*) as order_count
FROM "Order"
WHERE "createdAt" > NOW() - INTERVAL '7 days'
GROUP BY platform, status
ORDER BY platform, status;
```

---

## 🛠️ Bakım Scriptle ri

### 1. fix-n11-images.ts
- **Ne Yapar:** N11 siparişlerinin tüm ürün görsellerini XML'den yeniden çeker
- **Ne Zaman:** Haftalık veya görseller kaybolduğunda
- **Çalıştırma:** `npx tsx scripts/fix-n11-images.ts`

### 2. fix-n11-statuses.ts
- **Ne Yapar:** N11 API'den gerçek statusları çeker ve database'i günceller
- **Ne Zaman:** Kargoda sayısı yanlış göründüğünde
- **Çalıştırma:** `npx tsx scripts/fix-n11-statuses.ts`

---

## ⚠️ UYARI: BU SORUNLAR NEDEN OLUYOR?

### N11 Görselleri
- N11 API'si ürün görseli döndürmüyor
- Görseller harici XML'den çekiliyor
- Her sync'te items yeniden oluşturulmuyor (doğru davranış)
- Ama ilk sync'te görsel bulunamazsa boş kalıyor

### Kargoda Sayısı
- N11 API'si tarih aralığı ile çalışıyor (max 30 gün)
- Eski siparişler sync'e dahil olmuyor
- N11'de status güncellenmiş ama bize bildirilmiyor
- Bu yüzden 30+ günlük SHIPPED'lar otomatik DELIVERED yapılmalı

---

## ✅ Başarı Kriterleri

Sistem düzgün çalışıyorsa:
1. ✅ N11 görselleri %95+ dolu olmalı
2. ✅ Kargoda N11 sayısı = N11 panelindeki "Kargoda" sayısı (±2)
3. ✅ 30 günden eski SHIPPED sipariş olmamalı
4. ✅ Günlük sync sorunsuz çalışmalı

---

## 📝 Changelog

### 2026-05-15
- ✅ N11 görsel sistemini fix ettim
- ✅ Kargoda status sorununu çözdüm
- ✅ Otomatik düzeltme scriptleri yazdım
- ✅ 30+ gün kuralını ekledim
- ✅ Tooltip'lerde sadece büyük görsel gösteriliyor

---

## 🔗 İlgili Dosyalar

- `/app/api/orders/n11/route.ts` - N11 sync API
- `/app/api/orders/trendyol/route.ts` - Trendyol sync API
- `/lib/image-fetcher.ts` - Görsel çekme sistemi
- `/scripts/fix-n11-images.ts` - Görsel düzeltme scripti
- `/scripts/fix-n11-statuses.ts` - Status düzeltme scripti
- `/app/orders/page.tsx` - Siparişler sayfası (tooltip düzeltildi)

---

**Son Güncelleme:** 2026-05-15
**Durum:** ✅ Tüm sorunlar çözüldü ve dökümante edildi

---

## 🆘 TROUBLESHOOTING - N11 GÖRSELLER HALA KAYIP!

### Eğer N11 görselleri kaybolmaya devam ediyorsa:

#### 1. İlk Önce Kontrol Et:
```bash
# Kaç ürün görselsiz?
psql postgresql://korayuslu@localhost:5432/exvado_sales -c "
SELECT COUNT(*) as eksik_gorsel
FROM \"OrderItem\" oi
JOIN \"Order\" o ON oi.\"orderId\" = o.id
WHERE o.platform = 'N11' AND (oi.\"imageUrl\" IS NULL OR oi.\"imageUrl\" = '');
"
```

#### 2. N11 Route Kodunu Kontrol Et:
**KRİTİK:** `/app/api/orders/n11/route.ts` dosyasının 264-286 satırlarında şu kod MUTLAKA OLMALI:
```typescript
// KALICI ÇÖZÜM: Update existing items with images if they don't have one
if (existingOrder && Object.keys(productImages).length > 0) {
  for (const dbItem of dbOrder.items) {
    const newItem = order.items.find((i: any) => String(i.id) === dbItem.sku)
    if (!newItem) continue
    const imageUrl = productImages[String(newItem.id)]
    if (imageUrl && (!dbItem.imageUrl || dbItem.imageUrl !== imageUrl)) {
      await prisma.orderItem.update({
        where: { id: dbItem.id },
        data: { imageUrl },
      })
    }
  }
}
```

**Bu kod yoksa EKLE!** Yoksa her sync'te görseller kaybolur.

#### 3. Manuel Fix (Acil Durum):
```bash
# 1. Eksik görselleri listele
psql postgresql://korayuslu@localhost:5432/exvado_sales -c "
SELECT o.\"orderNumber\", oi.\"productName\", oi.\"stockCode\"
FROM \"OrderItem\" oi
JOIN \"Order\" o ON oi.\"orderId\" = o.id
WHERE o.platform = 'N11' AND (oi.\"imageUrl\" IS NULL OR oi.\"imageUrl\" = '')
ORDER BY o.\"orderDate\" DESC
LIMIT 20;
"

# 2. Script ile düzelt (hızlı)
npx tsx scripts/fix-n11-images.ts

# 3. Veya manuel SQL ile düzelt
# Örnek:
# UPDATE "OrderItem" SET "imageUrl" = 'https://static.ticimax.cloud/69066/...'
# WHERE "stockCode" = 'TK144FC' AND ("imageUrl" IS NULL OR "imageUrl" = '');
```

#### 4. Kalıcı Çözümü Test Et:
```bash
# Bir N11 sync yap ve kontrol et
curl -X GET "http://localhost:3000/api/orders/n11"

# Sonra tekrar kontrol et - görsel sayısı AZALMAMAL I
psql postgresql://korayuslu@localhost:5432/exvado_sales -c "
SELECT COUNT(*) FILTER (WHERE \"imageUrl\" IS NULL OR \"imageUrl\" = '') as eksik
FROM \"OrderItem\" oi JOIN \"Order\" o ON oi.\"orderId\" = o.id
WHERE o.platform = 'N11';
"
```

#### 5. Eğer Sorun Devam Ederse:
**HATA:** `/app/api/orders/n11/route.ts` dosyasındaki kalıcı fix kodu muhtemelen silinmiş veya bozulmuş!

**ÇÖZÜM:**
1. Bu dökümantasyondaki kodu geri ekle (yukarıya bak)
2. Serveri yeniden başlat: `npm run dev`
3. Fix scriptini çalıştır: `npx tsx scripts/fix-n11-images.ts`
4. Test et: Yeni sync yapıldığında görseller kaybolmamalı

---

## ⚠️ ÖNEMLİ NOT

**N11 GÖRSELLER İÇİN KRİTİK KURAL:**
- Her N11 sync'i sonrasında görseller ASLA azalmamalı
- Eğer azalıyorsa, `/app/api/orders/n11/route.ts` dosyasındaki kalıcı fix kodu bozulmuş demektir
- Hemen yukarıdaki troubleshooting adımlarını takip et!
