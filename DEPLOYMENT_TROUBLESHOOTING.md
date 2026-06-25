# Production Deployment Troubleshooting Guide

## Özet: Port 3000 ve Prisma Database Hatası

### Sorunun Belirtileri
- API'ler `false` dönüyor
- Database hatası: `Authentication failed against database server at 'localhost', the provided database credentials for 'postgres' are not valid`
- Port 3000 meşgul hatası: `EADDRINUSE: address already in use :::3000`
- Local'de çalışıyor ama production'da çalışmıyor

### Kök Neden
1. **PM2 ile çalışan eski uygulama**: Sunucuda PM2 ile başlatılmış eski bir Next.js instance port 3000'i tutuyordu
2. **Yanlış DATABASE_URL ile build**: Eski uygulama local'deki DATABASE_URL (exvado2024secure) ile build edilmişti, production şifresi (exvado123) farklıydı
3. **Prisma Client cache**: Prisma Client build zamanında DATABASE_URL'yi binary içine gömer, runtime'da environment variable değişikliği etkisiz kalır

## Adım Adım Çözüm

### 1. Port 3000'i Tutan Process'i Bul

```bash
# Port 3000'i kim kullanıyor?
lsof -i:3000 -P

# Socket detayları
ss -tlnp | grep 3000

# PM2 kontrolü
pm2 list

# Tüm node processleri
ps aux | grep node | grep -v grep
```

### 2. PM2 Uygulamalarını Temizle

```bash
# Tüm PM2 uygulamalarını durdur
pm2 delete all

# PM2 process listesini kontrol et
pm2 list
```

### 3. Sunucuda Fresh Build Yap

**ÖNEMLİ**: Local'den build gönderme! Sunucuda build yap çünkü:
- Prisma Client DATABASE_URL'yi build zamanında gömer
- Local ve production DATABASE_URL farklı olabilir

```bash
cd /root/exvado-sales

# .env dosyasını kontrol et - PRODUCTION DATABASE_URL olmalı
cat .env | grep DATABASE_URL
# Olmalı: DATABASE_URL="postgresql://exvado:exvado123@localhost:5432/exvado_sales"

# Temiz build
rm -rf node_modules .next
npm install
npx prisma generate
npm run build
```

### 4. PM2 ile Başlat

```bash
cd /root/exvado-sales

# PM2 ile başlat
pm2 start npm --name 'exvado-sales' -- start

# Logları kontrol et
pm2 logs exvado-sales --lines 50

# Status kontrolü
pm2 status
```

### 5. Otomatik Başlatma Ayarla

```bash
# Sunucu reboot sonrası otomatik başlaması için
pm2 startup
pm2 save
```

### 6. Test Et

```bash
# Sunucuda test
curl -s 'http://localhost:3000/api/orders/list?page=1&pageSize=2' | jq '.success, .total'

# Local'den test
curl -s 'http://94.138.216.96:3000/api/orders/list?page=1&pageSize=2' | jq '.success, .total'
```

## Önemli Kontrol Noktaları

### DATABASE_URL Kontrolü

```bash
# Sunucuda .env kontrolü
grep DATABASE_URL /root/exvado-sales/.env

# Doğru format:
DATABASE_URL="postgresql://exvado:exvado123@localhost:5432/exvado_sales"

# PostgreSQL bağlantı testi
PGPASSWORD=exvado123 psql -U exvado -h localhost -d exvado_sales -c "SELECT COUNT(*) FROM \"Order\";"
```

### Prisma Client Doğrulama

```bash
# Prisma Client test
cd /root/exvado-sales
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.order.count().then(c => {
  console.log('Sipariş sayısı:', c);
  process.exit(0);
}).catch(e => {
  console.error('Hata:', e.message);
  process.exit(1);
});
"
```

### Port Temizliği

```bash
# Port 3000'i temizle
lsof -ti:3000 | xargs -r kill -9

# Tüm node processlerini temizle (DİKKAT: Tüm node uygulamaları durur!)
killall -9 node npm
```

## Yaygın Hatalar ve Çözümleri

### Hata 1: "Authentication failed for postgres"

**Neden**: Prisma Client yanlış DATABASE_URL ile build edilmiş
**Çözüm**: Sunucuda doğru .env ile fresh build yap

### Hata 2: "EADDRINUSE: address already in use :::3000"

**Neden**: Port 3000 meşgul (genellikle PM2 veya eski node process)
**Çözüm**: `pm2 list` ile kontrol et, `pm2 delete all` ile temizle

### Hata 3: Local'den gönderilen build çalışmıyor

**Neden**: Local ve production DATABASE_URL farklı
**Çözüm**: ASLA local'den build gönderme, her zaman sunucuda build yap

### Hata 4: Reboot sonrası uygulama başlamıyor

**Neden**: PM2 startup ayarlanmamış
**Çözüm**: `pm2 startup && pm2 save`

## PM2 Komutları Özeti

```bash
# Uygulama başlat
pm2 start npm --name 'exvado-sales' -- start

# Uygulama durdur
pm2 stop exvado-sales

# Uygulama yeniden başlat
pm2 restart exvado-sales

# Uygulama sil
pm2 delete exvado-sales

# Tüm uygulamaları sil
pm2 delete all

# Logları görüntüle
pm2 logs exvado-sales

# Logları temizle
pm2 flush

# Status
pm2 status

# Monitor
pm2 monit

# Startup ayarla
pm2 startup
pm2 save

# Startup kaldır
pm2 unstartup
```

## Deployment Checklist

- [ ] Sunucuda doğru .env dosyası var mı?
- [ ] DATABASE_URL production şifresi içeriyor mu? (exvado123)
- [ ] Eski PM2 processleri temizlendi mi? (`pm2 delete all`)
- [ ] Sunucuda fresh build yapıldı mı? (`npm install && npx prisma generate && npm run build`)
- [ ] PM2 ile başlatıldı mı? (`pm2 start npm --name 'exvado-sales' -- start`)
- [ ] API'ler çalışıyor mu? (curl ile test)
- [ ] PM2 startup ayarlandı mı? (`pm2 startup && pm2 save`)

## Acil Durum: Herşey Bozulursa

```bash
# 1. Herşeyi temizle
pm2 delete all
killall -9 node npm
systemctl stop exvado  # Eğer systemd service varsa

# 2. Port kontrolü
lsof -i:3000  # Boş olmalı

# 3. Yeniden başla
cd /root/exvado-sales
rm -rf node_modules .next
npm install
npx prisma generate
npm run build
pm2 start npm --name 'exvado-sales' -- start
pm2 save

# 4. Test
curl -s 'http://localhost:3000/api/orders/list?page=1&pageSize=2' | jq '.success'
```

## Production vs Local Farkları

| Özellik | Local | Production |
|---------|-------|------------|
| DATABASE_URL | postgresql://exvado:**exvado2024secure**@localhost:5432/exvado_sales | postgresql://exvado:**exvado123**@localhost:5432/exvado_sales |
| NODE_ENV | development | production |
| Process Manager | `npm run dev` | PM2 |
| Port | 3000 | 3000 |
| Build | Hot reload | Pre-built |

## Notlar

- **ASLA local'den build gönderme**: Prisma Client DATABASE_URL'yi gömdüğü için her zaman sunucuda build yap
- **PM2 kullan**: Production'da `npm start` yerine PM2 kullan (otomatik restart, log yönetimi vb.)
- **Reboot güvenliği**: Her zaman `pm2 startup && pm2 save` ile otomatik başlatmayı ayarla
- **.env dosyası**: Local ve production .env farklı olabilir, her ikisini de ayrı yönet

## Otomatik Sipariş Senkronizasyonu (Auto-Sync)

### Cron Job ile Otomatik Sync

Sunucuda her 10 dakikada bir otomatik olarak siparişler senkronize edilir.

```bash
# Cron job kontrolü
crontab -l

# Çıktı:
*/10 * * * * /root/exvado-sales/scripts/sync-orders.sh >> /tmp/sync-orders.log 2>&1
```

### Sync Script

Dosya: `/root/exvado-sales/scripts/sync-orders.sh`

```bash
#!/bin/bash
# Otomatik sipariş senkronizasyonu

LOG_FILE="/tmp/sync-orders.log"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Sync başlıyor..." >> $LOG_FILE

# API'yi çağır
RESPONSE=$(curl -s -X POST http://localhost:3000/api/orders/sync)
SUCCESS=$(echo $RESPONSE | jq -r '.success // false')

if [ "$SUCCESS" = "true" ]; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ Sync başarılı" >> $LOG_FILE
else
  ERROR=$(echo $RESPONSE | jq -r '.error // "Bilinmeyen hata"')
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ Sync hatası: $ERROR" >> $LOG_FILE
fi
```

### Sync Log Kontrolü

```bash
# Son 20 satır
tail -20 /tmp/sync-orders.log

# Canlı izle
tail -f /tmp/sync-orders.log

# Log temizle
> /tmp/sync-orders.log
```

### Manuel Sync

```bash
# Script ile
/root/exvado-sales/scripts/sync-orders.sh

# API ile (GET)
curl http://localhost:3000/api/orders/sync

# API ile (POST)
curl -X POST http://localhost:3000/api/orders/sync
```

### Cron Job Yönetimi

```bash
# Cron job ekle (10 dakikada bir)
echo '*/10 * * * * /root/exvado-sales/scripts/sync-orders.sh >> /tmp/sync-orders.log 2>&1' | crontab -

# Cron job listele
crontab -l

# Cron job düzenle
crontab -e

# Cron job sil
crontab -r

# Cron servisi kontrol
systemctl status cron
```

### Sync Sıklığını Değiştirme

```bash
# Her 5 dakikada bir
*/5 * * * * /root/exvado-sales/scripts/sync-orders.sh >> /tmp/sync-orders.log 2>&1

# Her 15 dakikada bir
*/15 * * * * /root/exvado-sales/scripts/sync-orders.sh >> /tmp/sync-orders.log 2>&1

# Her saat başı
0 * * * * /root/exvado-sales/scripts/sync-orders.sh >> /tmp/sync-orders.log 2>&1

# Her gün saat 09:00'da
0 9 * * * /root/exvado-sales/scripts/sync-orders.sh >> /tmp/sync-orders.log 2>&1
```

## Son Güncelleme
Tarih: 2026-06-25
Durum: ✅ Çalışıyor
PM2 Process: exvado-sales (PID değişken)
URL: http://94.138.216.96:3000
Auto-Sync: ✅ Aktif (Her 10 dakikada bir)
Cron Job: ✅ Kurulu
