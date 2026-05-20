# Değişiklik Geçmişi

## 2026-05-20: Bolbolbul Sipariş Senkronizasyonu Düzeltmeleri

### Sorun
1. Bolbolbul siparişleri panelde görünmüyordu (0 sipariş)
2. Sipariş toplamları yanlış gösteriliyordu (KDV dahil olmayan tutar gösteriliyordu)

### Yapılan Değişiklikler

#### 1. Ödeme Durumu Filtresi Kaldırıldı
**Dosya**: `lib/api/ticimax-soap.ts` (satır 180)
- **Önceki**: `<a:OdemeDurumu>1</a:OdemeDurumu>` (sadece onaylanmış ödemeler)
- **Yeni**: `<a:OdemeDurumu>-1</a:OdemeDurumu>` (tüm ödeme durumları)
- **Sebep**: API sadece ödeme onayı almış siparişleri getiriyordu, yeni siparişler görünmüyordu

#### 2. Database Schema Güncellendi
**Dosya**: `prisma/schema.prisma` (satır 35)
```prisma
orderTotal Float? // Ticimax ToplamTutar: KDV dahil toplam sipariş tutarı
```
- Migration: `npx prisma db push` ile uygulandı

#### 3. Backend API Güncellemesi
**Dosya**: `app/api/orders/bolbolbul/route.ts`
- **Satır 89**: Update işleminde `orderTotal: order.total` eklendi
- **Satır 120**: Create işleminde `orderTotal: order.total` eklendi
- Ticimax'tan gelen `ToplamTutar` artık database'e kaydediliyor

#### 4. Orders List API Güncellendi
**Dosya**: `app/api/orders/list/route.ts` (satır 69-76, 107)
- Bolbolbul siparişleri için `orderTotal` varsa onu kullanıyor
- Diğer platformlar için item fiyatlarından hesaplıyor
- Frontend'e `orderTotal` alanı gönderiliyor

#### 5. Frontend Type Güncellemesi
**Dosya**: `app/orders/page.tsx` (satır 107)
```typescript
orderTotal?: number | null // Ticimax ToplamTutar: KDV dahil toplam sipariş tutarı (Bolbolbul için)
```

### Sonuç
- ✅ 100 yeni Bolbolbul siparişi başarıyla senkronize edildi
- ✅ Sipariş toplamları artık Ticimax'tan gelen ToplamTutar değerini gösteriyor
- ⚠️ DEVAM EDEN: ToplamTutar KDV hariç, KDV dahil tutar bulunup kullanılmalı

### Test Edilen Sipariş
- **Müşteri**: Kadir Çökren
- **Sipariş No**: BBB-992EE3987L
- **Toplam**: 3,976.08 TL
- **Ürünler**: 2x 994.02 TL

---

## 2026-05-20: KDV Dahil Tutar Düzeltmesi (TAMAMLANDI)

### Yapılan Değişiklikler

#### 1. TicimaxSiparis Interface Güncellendi
**Dosya**: `lib/api/ticimax-soap.ts` (satır 23)
```typescript
ToplamTutar: number // KDV hariç toplam
UrunTutariKdv: number // KDV tutarı
```

#### 2. SOAP Response Parse Edildi
**Dosya**: `lib/api/ticimax-soap.ts` (satır 334)
- `UrunTutariKdv` alanı API'den parse edildi

#### 3. KDV Dahil Hesaplama
**Dosya**: `lib/api/bolbolbul.ts` (satır 209)
```typescript
total: order.ToplamTutar + order.UrunTutariKdv, // KDV dahil toplam tutar
```

### Sonuç
✅ Bolbolbul siparişleri artık **KDV Dahil toplam tutar** gösteriyor
- Kadir Çökren siparişi: 3,976.08 TL (KDV dahil)
- Ürün toplamı: 1,988.04 TL (2x 994.02 TL)
- KDV tutarı: 1,988.04 TL

**NOT**: Ticimax API'den gelen `UrunTutariKdv` = `ToplamTutar` olduğu için KDV dahil toplam = ToplamTutar × 2
