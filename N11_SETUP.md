# N11 API Kurulum Rehberi

## N11 API Bilgilerini Alma Adımları

### 1. N11 Satıcı Paneline Giriş
1. https://satici.n11.com/ adresine git
2. Satıcı hesabınla giriş yap

### 2. API Anahtarlarını Al
1. Sol menüden **Ayarlar** → **Geliştirici Ayarları** bölümüne git
2. **API Anahtarları** sekmesine tıkla
3. Burada 2 bilgi göreceksin:
   - **API Key (appKey)**
   - **API Secret (appSecret)**
4. Bu bilgileri kopyala

### 3. API Bilgilerini Projeye Ekle
`.env.local` dosyasını aç ve şu satırları güncelle:

```env
# N11 API Credentials
N11_API_KEY="buraya_api_key_yaz"
N11_API_SECRET="buraya_api_secret_yaz"
```

### 4. API'yi Test Et
Sunucu çalışır durumdayken şu URL'yi tarayıcıda aç:

```
http://localhost:3020/api/orders/n11?page=0&pageSize=10
```

Bu, son 30 günün ilk 10 siparişini çekecektir.

### 5. Tüm Siparişleri Çek (syncAll)
Tüm siparişleri son 1 yıldan çekmek için:

```
http://localhost:3020/api/orders/n11?syncAll=true
```

## N11 API Özellikleri

### Desteklenen Özellikler
- ✅ Sipariş listesini çekme (tarih aralığı ile)
- ✅ Sipariş detaylarını çekme
- ✅ Sipariş durumu güncelleme
- ✅ XML/SOAP tabanlı API
- ✅ Otomatik pagination
- ✅ Otomatik tarih aralığı bölünmesi (30 günlük parçalar)

### N11 Sipariş Durumları
| N11 Status | İç Durum |
|------------|----------|
| Yeni | PENDING |
| Onaylandı | APPROVED |
| Hazırlanıyor | PROCESSING |
| Kargoya Verildi | SHIPPED |
| Tamamlandı | DELIVERED |
| İptal | CANCELLED |

### API Limitleri
- **Tarih Aralığı**: Maksimum 30 gün per request
- **Sayfa Boyutu**: Maksimum 100 sipariş per sayfa
- **Zaman Aşımı**: 30 saniye

## Destek

Eğer API erişiminde sorun yaşarsan:

### N11 Destek İletişim
- **Telefon**: 0850 346 00 11
- **Email**: destek@n11.com
- **Dokümantasyon**: https://www.n11.com/apidoc/

### Sık Karşılaşılan Sorunlar

#### 1. "Authentication Failed" Hatası
- API Key ve API Secret'in doğru olduğundan emin ol
- `.env.local` dosyasında boşluk veya özel karakter olmadığından emin ol
- Sunucuyu yeniden başlat (`PORT=3020 npm run dev`)

#### 2. "No Orders Found" Durumu
- N11 panelinde gerçekten sipariş olduğundan emin ol
- Tarih aralığını kontrol et
- API anahtarının aktif olduğundan emin ol

#### 3. XML Parsing Hatası
- N11 API'sinin güncel olduğundan emin ol
- Console loglarını kontrol et
- Hata detaylarını N11 desteğe ilet

## Test Ortamı

N11'in test API ortamı yoktur. Tüm testler canlı ortamda yapılır.
Bu yüzden ilk testlerde `pageSize=10` gibi küçük değerler kullan.

## Örnek Kullanım

### Tek Sayfa Çekme
```bash
curl "http://localhost:3020/api/orders/n11?page=0&pageSize=50"
```

### Tüm Siparişleri Çekme
```bash
curl "http://localhost:3020/api/orders/n11?syncAll=true"
```

### Belirli Tarih Aralığı
```typescript
// API client'ta
await n11Client.getOrders({
  page: 0,
  pageSize: 100,
  startDate: '2026-01-01',
  endDate: '2026-01-31'
})
```

## Notlar

- N11 API'si SOAP/XML tabanlıdır (REST değil)
- Tüm tarihler `DD/MM/YYYY` formatında gönderilir
- Sipariş ID'leri numeriktir
- Cargo tracking bilgileri `shipmentInfo` içindedir
- Müşteri telefonu `buyer.phone` veya `buyer.gsm` alanındadır
