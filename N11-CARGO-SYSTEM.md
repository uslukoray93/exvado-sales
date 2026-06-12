# N11 Kargo Sistemi - Entegrasyon Dokümantasyonu

## 🎯 Özellikler

✅ **N11 ile tam entegrasyon**
- N11'de kargo firması değiştir → Otomatik barkod güncellenir
- Barkod (kampanya kodu) otomatik çekilir ve gösterilir
- Kargo fişi yazdırırken N11 logosu kullanılır
- N11 ve panel tam senkronize çalışır

## 🏗️ Sistem Mimarisi

### REST API (Yeni - 2024)
- ✅ Sipariş listeleme
- ✅ Durum sorgulama
- ✅ Paket bölme
- ✅ Sipariş onaylama

### SOAP API (Eski - Hala Aktif)
- ✅ **Kargo firması değiştirme** (`MakeOrderItemShipment`)
- ✅ Kargo firmalarını listeleme (`GetShipmentCompanies`)

**Not:** N11'in REST API'si yeni olduğu için kargo değiştirme henüz REST'e taşınmamış. SOAP kullanmak zorundasınız.

## 📁 Dosya Yapısı

```
lib/api/
├── n11-rest.ts           # REST API client (sipariş listeleme)
└── n11-soap.ts           # SOAP API client (kargo değiştirme) ⭐ YENİ

app/api/
├── n11/
│   ├── shipment-companies/route.ts  # Kargo firmalarını listele ⭐ YENİ
│   └── change-carrier/route.ts      # Kargo firması değiştir ⭐ YENİ
├── cron/sync-n11/route.ts           # Otomatik senkronizasyon
└── orders/n11-rest/route.ts         # Manuel senkronizasyon

components/
└── cargo-label.tsx       # Kargo fişi (Trendyol + N11 logolu) ⭐ GÜNCELLENDİ

app/orders/page.tsx       # Siparişler sayfası (N11 kargo değiştirme) ⭐ GÜNCELLENDİ
```

## 🔧 Kurulum

### 1. Paket Yükleme
```bash
npm install soap
```

### 2. Environment Variables
`.env.local` dosyasına ekleyin:
```env
N11_API_KEY="ae57daa8-82b1-4101-bed1-b8f553cb358f"
N11_API_SECRET="YD4Vb4mSAA8IB9Ot"
```

## 🚀 Kullanım

### Kargo Firması Değiştirme (N11)

1. **Frontend'de:**
   - Sipariş listesinde "Kargo Firması Değiştir" butonuna tıkla
   - Yeni kargo firmasını seç
   - Kaydet

2. **Backend'de:**
```typescript
// app/orders/page.tsx (satır 794-847)
if (order.platform.toLowerCase() === 'n11') {
  // N11 SOAP API ile kargo değiştir
  const n11Response = await fetch('/api/n11/change-carrier', {
    method: 'POST',
    body: JSON.stringify({
      platformOrderId: order.platformOrderId,
      shipmentCompanyId: 344, // Yurtiçi Kargo
    })
  })
}
```

3. **N11 Tarafında Olan:**
   - Kargo firması N11'de güncellenir
   - Yeni barkod (kampanya kodu) otomatik oluşturulur
   - Takip numarası sisteme yüklenir

### Kargo Fişi Yazdırma

```typescript
// components/cargo-label.tsx
<CargoLabel
  platform="N11"          // N11 logosu ve mesajı gösterir
  trackingNumber="..."    // Barkod olarak basılır
  cargoCompany="yurtici-kargo"
  orderNumber="N11-204571955334"
  customerName="..."
  customerAddress="..."
  customerPhone="..."
/>
```

**Çıktı:**
- ⚠️ "Kargo şirketinin dikkatine, bu bir **n11.com** göndеrisidir."
- N11 logosu (sol üst)
- Bolbolbul logosu (orta)
- Kargo firması logosu (sağ üst)
- Barkod (kampanya kodu)

## 📊 N11 Kargo Firmaları ID'leri

| Kargo Firması | ID | Slug |
|--------------|-----|------|
| Aras Kargo | 345 | `aras-kargo` |
| Sürat Kargo | 341 | `surat-kargo` |
| Yurtiçi Kargo | 344 | `yurtici-kargo` |
| DHL/MNG | 342 | `dhl-ecommerce` |
| PTT Kargo | 381 | `ptt-kargo` |
| Kolay Gelsin | 47050 | `kolay-gelsin` |
| UPS Kargo | 343 | `ups-kargo` |
| Horoz Lojistik | 441 | `horoz-kargo` |
| Ceva Lojistik | 401 | `ceva-lojistik` |

Tam liste için: `GET /api/n11/shipment-companies`

## 🔄 Otomatik Senkronizasyon

**Cron Job:** `/api/cron/sync-n11`
- **Çalışma sıklığı:** 5-10 dakikada bir (önerilir)
- **Süre:** Son 30 gün
- **Statusler:** Created, Picking, Shipped, Cancelled, Delivered
- **Auto-cleanup:** 15+ gün önce kargoda → Teslim edildi

```bash
# Cron ayarı (örnek)
*/5 * * * * curl http://localhost:3000/api/cron/sync-n11
```

## 🧪 Test

### 1. Kargo Firmalarını Listele
```bash
curl http://localhost:3000/api/n11/shipment-companies
```

Yanıt:
```json
{
  "success": true,
  "data": [
    { "id": 345, "name": "Aras Kargo", "shortName": "ARAS" },
    { "id": 344, "name": "Yurtiçi Kargo", "shortName": "YK" },
    ...
  ]
}
```

### 2. Kargo Firması Değiştir
```bash
curl -X POST http://localhost:3000/api/n11/change-carrier \
  -H "Content-Type: application/json" \
  -d '{
    "platformOrderId": "112226737622213",
    "shipmentCompanyId": 344
  }'
```

Yanıt:
```json
{
  "success": true,
  "message": "Changed carrier for 1/1 order lines",
  "results": [...]
}
```

## ⚠️ Önemli Notlar

### 1. ⚠️ Kargo Değiştirme Kısıtlaması (ÇOK ÖNEMLİ!)

**N11 siparişlerinde kargo firması değişikliği sadece sipariş onaylanmadan önce (Created durumunda) API üzerinden yapılabilir.**

| Durum | API Değişikliği | Açıklama |
|-------|----------------|----------|
| Created (PENDING) | ✅ Çalışır | Sipariş henüz onaylanmadı, API ile değiştirilebilir |
| Picking (PROCESSING) | ❌ Çalışmaz | Sipariş onaylandı, N11 API'si izin vermiyor |
| Shipped / Delivered | ❌ Çalışmaz | Kargo zaten gönderilmiş |

**Hata:** `SELLER_API.payOnPlatformItem` - "kargo ödemesi siparişle birlikte alındı"

**Onaylanmış siparişlerde nasıl değiştirilir:**
1. N11 paneline git → Siparişi aç
2. "Kod Oluştur" butonuna tıkla
3. Dropdown'dan yeni kargo firmasını seç (örn: Aras → Sürat)
4. "Kod Oluştur" butonuna bas
5. ✅ Kargo firması değişir, kampanya kodu güncellenir
6. ✅ Sistem otomatik senkronize edilir (5-10 dk sonra)

**Sistemdeki Uyarı:** Onaylanmış N11 siparişlerinde "Kargo Firması Değiştir" butonuna basıldığında otomatik uyarı gösterilir.

### 2. REST vs SOAP
- **Sipariş listeleme**: REST API kullan (hızlı)
- **Kargo değiştirme**: SOAP API kullan (sadece Created durumunda)

### 3. Package ID vs Order ID
- **Package ID** (`platformOrderId`): Paket bazlı ID (112226737622213) - **REST API'de kullan**
- **Order Line ID** (`orderLineId`): Ürün bazlı ID - **SOAP API'de kullan**

### 3. Barkod (Kampanya Kodu)
- N11 siparişi onaylandığında (Created → Picking) otomatik oluşturulur
- `cargoTrackingNumber` alanında gelir
- Kargo firması değiştirildiğinde **YENİ barkod** oluşturulur

### 4. Takip Numarası
- `cargoSenderNumber`: Kargo takip numarası (opsiyonel)
- `cargoTrackingNumber`: Barkod/kampanya kodu (zorunlu)

## 🐛 Troubleshooting

### "SOAP client error: Error: ENOTFOUND api.n11.com"
➡️ İnternet bağlantısını kontrol et

### "Failed to change carrier: Invalid orderLineId"
➡️ REST API'den gelen `lines[].orderLineId` değerini kullan

### "Kargo firması alınamadı"
➡️ API key/secret doğru mu kontrol et

### "Kampanya kodu bulunamadı"
➡️ Sipariş henüz onaylanmamış olabilir (Created → Picking yapılmalı)

### "Bu sipariş için kargo firması değiştirilemez (kargo ücreti müşteri tarafından ödendi)"
**Hata Kodu:** `SELLER_API.payOnPlatformItem`

➡️ **Sebep:** Sipariş zaten onaylanmış (Picking durumunda) ve N11 API'si onaylanmış siparişlerde kargo değişikliğine izin vermiyor.

➡️ **Çözüm:**
1. N11 paneline git
2. Siparişi aç → "Kod Oluştur" butonuna tıkla
3. Yeni kargo firmasını seç → "Kod Oluştur"
4. Sistem 5-10 dk içinde otomatik senkronize edilir

➡️ **Not:** Bu N11'in API kısıtlamasıdır, bizim kodda bir sorun yok. Sadece Created durumundaki siparişlerde API ile kargo değiştirilebilir.

## 📚 Referanslar

- [N11 API Dokümantasyonu](/Users/korayuslu/Desktop/n11.md)
- [SOAP ShipmentCompanyService WSDL](https://api.n11.com/ws/ShipmentCompanyService.wsdl)
- [SOAP OrderService WSDL](https://api.n11.com/ws/OrderService.wsdl)
- [REST Sipariş API](https://api.n11.com/rest/delivery/v1/shipmentPackages)

---

**Son Güncelleme:** 14 Mayıs 2026
**Versiyon:** 1.0
**Durum:** ✅ Üretimde
