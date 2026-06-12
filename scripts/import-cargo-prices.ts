import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// PDF'ten çıkardığım kargo fiyatları (ilk 103 satır - tüm firmaların veri olduğu kısım)
const cargoPricesRaw = [
  { desi: 0, aras: 83.93, dhl: 92.99, kolayGelsin: 91.99, ptt: 77.54, surat: 89.71, tex: 77.54, yurtici: 112.77, cevaTedarik: 468.62, ceva: 651.74, horoz: 567.76 },
  { desi: 1, aras: 83.93, dhl: 92.99, kolayGelsin: 91.99, ptt: 77.54, surat: 89.71, tex: 77.54, yurtici: 112.77, cevaTedarik: 468.62, ceva: 651.74, horoz: 567.76 },
  { desi: 2, aras: 83.93, dhl: 92.99, kolayGelsin: 91.99, ptt: 77.54, surat: 89.71, tex: 77.54, yurtici: 112.77, cevaTedarik: 468.62, ceva: 651.74, horoz: 567.76 },
  { desi: 3, aras: 95.12, dhl: 103.99, kolayGelsin: 101.99, ptt: 96.00, surat: 99.96, tex: 93.63, yurtici: 120.56, cevaTedarik: 468.62, ceva: 651.74, horoz: 567.76 },
  { desi: 4, aras: 103.68, dhl: 116.99, kolayGelsin: 112.99, ptt: 96.00, surat: 109.30, tex: 101.46, yurtici: 123.15, cevaTedarik: 468.62, ceva: 651.74, horoz: 567.76 },
  { desi: 5, aras: 111.17, dhl: 129.99, kolayGelsin: 121.99, ptt: 100.55, surat: 114.94, tex: 107.98, yurtici: 142.91, cevaTedarik: 468.62, ceva: 651.74, horoz: 567.76 },
  { desi: 6, aras: 121.12, dhl: 141.99, kolayGelsin: 131.99, ptt: 106.83, surat: 126.28, tex: 118.30, yurtici: 149.82, cevaTedarik: 468.62, ceva: 651.74, horoz: 567.76 },
  { desi: 7, aras: 128.46, dhl: 149.99, kolayGelsin: 140.99, ptt: 113.15, surat: 134.85, tex: 125.66, yurtici: 169.44, cevaTedarik: 468.62, ceva: 651.74, horoz: 567.76 },
  { desi: 8, aras: 137.05, dhl: 159.99, kolayGelsin: 150.99, ptt: 125.73, surat: 143.29, tex: 134.21, yurtici: 175.96, cevaTedarik: 468.62, ceva: 651.74, horoz: 567.76 },
  { desi: 9, aras: 144.91, dhl: 169.99, kolayGelsin: 159.99, ptt: 138.34, surat: 151.87, tex: 142.42, yurtici: 186.86, cevaTedarik: 468.62, ceva: 651.74, horoz: 567.76 },
  { desi: 10, aras: 153.48, dhl: 176.99, kolayGelsin: 170.99, ptt: 157.26, surat: 160.43, tex: 153.47, yurtici: 195.12, cevaTedarik: 468.62, ceva: 651.74, horoz: 567.76 },
  // ... 500 satır daha olacak ama şimdilik örnek olarak 10 satır
]

async function main() {
  console.log('🚀 Kargo fiyatları import ediliyor...')
  console.log('📊 %20 kar marjı ekleniyor...')

  const MARKUP = 1.2 // %20 kar marjı

  let imported = 0
  let updated = 0

  for (const row of cargoPricesRaw) {
    const cargoPrice = await prisma.cargoPrice.upsert({
      where: { desi: row.desi },
      update: {
        aras: row.aras * MARKUP,
        dhl: row.dhl * MARKUP,
        kolayGelsin: row.kolayGelsin * MARKUP,
        ptt: row.ptt ? row.ptt * MARKUP : null,
        surat: row.surat * MARKUP,
        tex: row.tex ? row.tex * MARKUP : null,
        yurtici: row.yurtici * MARKUP,
        cevaTedarik: row.cevaTedarik * MARKUP,
        ceva: row.ceva * MARKUP,
        horoz: row.horoz * MARKUP,
      },
      create: {
        desi: row.desi,
        aras: row.aras * MARKUP,
        dhl: row.dhl * MARKUP,
        kolayGelsin: row.kolayGelsin * MARKUP,
        ptt: row.ptt ? row.ptt * MARKUP : null,
        surat: row.surat * MARKUP,
        tex: row.tex ? row.tex * MARKUP : null,
        yurtici: row.yurtici * MARKUP,
        cevaTedarik: row.cevaTedarik * MARKUP,
        ceva: row.ceva * MARKUP,
        horoz: row.horoz * MARKUP,
      },
    })

    if (cargoPrice) {
      imported++
    } else {
      updated++
    }
  }

  // Settings kaydı oluştur
  await prisma.cargoPriceSettings.upsert({
    where: { id: 'default' },
    update: { markupPercent: 20 },
    create: { id: 'default', markupPercent: 20 },
  })

  console.log(`✅ ${imported} fiyat kaydı eklendi`)
  console.log(`📝 Kar marjı: %20`)
  console.log(`🎉 İşlem tamamlandı!`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
