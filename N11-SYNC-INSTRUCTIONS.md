# N11 Otomatik Senkronizasyon

## Özet

N11 entegrasyonu REST API'ye geçirildi ve otomatik senkronizasyon eklendi.

## Özellikler

✅ **REST API** - Modern N11 REST API kullanılıyor (SOAP yerine)
✅ **Otomatik Sync** - Her 5-10 dakikada bir otomatik güncelleme
✅ **Status Takibi** - Sipariş durumları otomatik güncelleniyor
✅ **Son 3 Ay** - Sadece son 3 aylık siparişler çekiliyor

## Status Mapping

| N11 Status | Bizim Status | Sekme |
|------------|--------------|-------|
| Created    | PENDING      | Yeni |
| Picking    | PROCESSING   | Hazırlanıyor |
| Shipped    | SHIPPED      | Kargoda |
| Delivered  | DELIVERED    | Teslim Edildi |
| Cancelled  | CANCELLED    | İptal Edilenler |

## API Endpoints

### Manuel Sync (Gerektiğinde)
```bash
# Son 3 aylık siparişleri çek
curl http://localhost:3000/api/orders/n11-rest?page=0&pageSize=100

# Tüm siparişleri sync et
curl http://localhost:3000/api/orders/n11-rest?syncAll=true
```

### Otomatik Sync (Cron Job)
```bash
# Her 5 dakikada bir çağrılmalı
curl http://localhost:3000/api/cron/sync-n11
```

## Cron Kurulumu

### Seçenek 1: MacOS/Linux Crontab

```bash
# Crontab düzenle
crontab -e

# Her 5 dakikada bir çalıştır
*/5 * * * * curl -s http://localhost:3000/api/cron/sync-n11 > /dev/null 2>&1
```

### Seçenek 2: Vercel Cron (Production)

`vercel.json` dosyasına ekle:

```json
{
  "crons": [
    {
      "path": "/api/cron/sync-n11",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

### Seçenek 3: External Cron Service

- [cron-job.org](https://cron-job.org)
- [EasyCron](https://www.easycron.com)
- Her 5 dakikada: `https://yourdomain.com/api/cron/sync-n11`

## Nasıl Çalışır?

1. **İlk Sync**: Manuel olarak `/api/orders/n11-rest` çağrılır
2. **Otomatik Güncellemeler**: Cron job son 7 günün siparişlerini kontrol eder
3. **Status Değişiklikleri**:
   - Sipariş iptal edildi mi? → CANCELLED
   - Hazırlanmaya başlandı mı? → PROCESSING
   - Kargoya verildi mi? → SHIPPED
4. **Yeni Siparişler**: Otomatik olarak sisteme eklenir

## Örnekler

### Yeni Sipariş Geldi
- N11'de: Created
- Bizde: "Yeni" sekmesinde görünür
- Status: PENDING

### Sipariş Onaylandı (Geciken Kargo)
- N11'de: Picking
- Bizde: "Hazırlanıyor" sekmesinde görünür
- Status: PROCESSING

### Sipariş İptal Edildi
- N11'de: Cancelled
- Cron çalışınca otomatik güncellenir
- "İptal Edilenler" sekmesine taşınır
- Status: CANCELLED

## Sorun Giderme

### Siparişler güncellenmiyor
```bash
# Manuel sync çalıştır
curl http://localhost:3000/api/cron/sync-n11

# Logları kontrol et
tail -100 /tmp/exvado-dev.log | grep -i "n11\|cron"
```

### Cron çalışıyor mu kontrol
```bash
# Mac/Linux
crontab -l

# Log dosyasını kontrol et
tail -f /tmp/n11-cron.log
```

## Performans

- **Tek Sync**: ~400-500ms
- **7 Günlük Kontrol**: ~2-3 saniye
- **API Rate Limit**: 1000 istek/dakika (N11 limiti)

## Notlar

- ⚠️ 2024 Kasım öncesi siparişler N11 REST API'den gelmez
- ✅ Sadece son 3 aylık siparişler çekiliyor
- ✅ SOAP API artık kullanılmıyor
- ✅ Paket ID kullanılıyor (bir sipariş birden fazla paket olabilir)
