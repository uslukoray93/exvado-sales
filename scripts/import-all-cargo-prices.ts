import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// PDF'ten çıkardığım tüm kargo fiyatları (0-500 desi, 501 satır)
// KDV HARİÇ fiyatlar - %20 kar marjı eklenecek
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
  { desi: 11, aras: 161.77, dhl: 184.99, kolayGelsin: 180.99, ptt: 165.01, surat: 171.83, tex: 162.13, yurtici: 207.75, cevaTedarik: 468.62, ceva: 651.74, horoz: 567.76 },
  { desi: 12, aras: 167.73, dhl: 194.99, kolayGelsin: 191.99, ptt: 173.31, surat: 181.55, tex: 170.33, yurtici: 220.80, cevaTedarik: 468.62, ceva: 651.74, horoz: 567.76 },
  { desi: 13, aras: 175.34, dhl: 204.99, kolayGelsin: 201.99, ptt: 181.63, surat: 188.84, tex: 178.04, yurtici: 227.79, cevaTedarik: 468.62, ceva: 651.74, horoz: 567.76 },
  { desi: 14, aras: 182.10, dhl: 216.99, kolayGelsin: 212.99, ptt: 189.94, surat: 193.44, tex: 185.17, yurtici: 245.62, cevaTedarik: 468.62, ceva: 651.74, horoz: 567.76 },
  { desi: 15, aras: 188.82, dhl: 226.99, kolayGelsin: 223.99, ptt: 198.22, surat: 200.48, tex: 192.81, yurtici: 258.72, cevaTedarik: 468.62, ceva: 651.74, horoz: 567.76 },
  { desi: 16, aras: 199.40, dhl: 244.99, kolayGelsin: 234.99, ptt: 206.52, surat: 207.26, tex: 200.82, yurtici: 266.13, cevaTedarik: 468.62, ceva: 651.74, horoz: 567.76 },
  { desi: 17, aras: 209.92, dhl: 259.99, kolayGelsin: 245.99, ptt: 214.83, surat: 218.26, tex: 209.70, yurtici: 280.92, cevaTedarik: 468.62, ceva: 651.74, horoz: 567.76 },
  { desi: 18, aras: 220.51, dhl: 276.99, kolayGelsin: 256.99, ptt: 223.13, surat: 229.26, tex: 218.60, yurtici: 294.85, cevaTedarik: 468.62, ceva: 651.74, horoz: 567.76 },
  { desi: 19, aras: 231.07, dhl: 291.99, kolayGelsin: 267.99, ptt: 231.45, surat: 240.14, tex: 227.46, yurtici: 300.97, cevaTedarik: 468.62, ceva: 651.74, horoz: 567.76 },
  { desi: 20, aras: 235.60, dhl: 309.99, kolayGelsin: 278.99, ptt: 239.76, surat: 251.15, tex: 236.21, yurtici: 307.46, cevaTedarik: 468.62, ceva: 651.74, horoz: 567.76 },
  { desi: 21, aras: 247.47, dhl: 334.99, kolayGelsin: 289.99, ptt: 248.06, surat: 262.40, tex: 244.98, yurtici: 324.89, cevaTedarik: 468.62, ceva: 651.74, horoz: 567.76 },
  { desi: 22, aras: 258.31, dhl: 354.99, kolayGelsin: 300.99, ptt: 256.36, surat: 272.64, tex: 254.82, yurtici: 334.91, cevaTedarik: 468.62, ceva: 651.74, horoz: 567.76 },
  { desi: 23, aras: 269.13, dhl: 379.99, kolayGelsin: 311.99, ptt: 264.66, surat: 282.62, tex: 264.97, yurtici: 347.55, cevaTedarik: 468.62, ceva: 651.74, horoz: 567.76 },
  { desi: 24, aras: 278.75, dhl: 404.99, kolayGelsin: 322.99, ptt: 272.95, surat: 292.72, tex: 274.36, yurtici: 354.51, cevaTedarik: 468.62, ceva: 651.74, horoz: 567.76 },
  { desi: 25, aras: 288.32, dhl: 429.99, kolayGelsin: 333.99, ptt: 281.27, surat: 302.70, tex: 283.69, yurtici: 378.43, cevaTedarik: 468.62, ceva: 651.74, horoz: 567.76 },
  { desi: 26, aras: 297.56, dhl: 454.99, kolayGelsin: 344.99, ptt: 289.58, surat: 312.42, tex: 292.73, yurtici: 413.73, cevaTedarik: 468.62, ceva: 651.74, horoz: 567.76 },
  { desi: 27, aras: 306.79, dhl: 479.99, kolayGelsin: 355.99, ptt: 297.88, surat: 322.15, tex: 301.77, yurtici: 433.31, cevaTedarik: 468.62, ceva: 651.74, horoz: 567.76 },
  { desi: 28, aras: 316.06, dhl: 504.99, kolayGelsin: 366.99, ptt: 306.18, surat: 331.87, tex: 310.84, yurtici: 452.92, cevaTedarik: 468.62, ceva: 651.74, horoz: 567.76 },
  { desi: 29, aras: 325.31, dhl: 529.99, kolayGelsin: 377.99, ptt: 314.48, surat: 341.59, tex: 319.89, yurtici: 468.61, cevaTedarik: 468.62, ceva: 651.74, horoz: 567.76 },
  { desi: 30, aras: 334.54, dhl: 554.99, kolayGelsin: 388.99, ptt: 322.78, surat: 351.32, tex: 328.88, yurtici: 473.40, cevaTedarik: 468.62, ceva: 651.74, horoz: 567.76 },
  { desi: 31, aras: 345.25, dhl: 587.98, kolayGelsin: 398.99, ptt: 666.93, surat: 420.28, tex: 394.39, yurtici: 486.99, cevaTedarik: 469.02, ceva: 658.84, horoz: 567.76 },
  { desi: 32, aras: 355.95, dhl: 620.97, kolayGelsin: 408.99, ptt: 683.01, surat: 432.43, tex: 404.79, yurtici: 500.58, cevaTedarik: 484.15, ceva: 666.11, horoz: 567.76 },
  { desi: 33, aras: 366.66, dhl: 653.96, kolayGelsin: 418.99, ptt: 699.09, surat: 444.71, tex: 415.21, yurtici: 514.17, cevaTedarik: 499.28, ceva: 673.39, horoz: 567.76 },
  { desi: 34, aras: 377.36, dhl: 686.95, kolayGelsin: 428.99, ptt: 715.18, surat: 456.87, tex: 425.61, yurtici: 527.76, cevaTedarik: 514.41, ceva: 680.86, horoz: 567.76 },
  { desi: 35, aras: 388.07, dhl: 719.94, kolayGelsin: 438.99, ptt: 731.25, surat: 469.15, tex: 436.04, yurtici: 541.35, cevaTedarik: 529.54, ceva: 688.28, horoz: 567.76 },
  { desi: 36, aras: 398.78, dhl: 752.93, kolayGelsin: 448.99, ptt: 747.34, surat: 481.30, tex: 446.43, yurtici: 554.95, cevaTedarik: 544.67, ceva: 695.95, horoz: 567.76 },
  { desi: 37, aras: 409.48, dhl: 785.92, kolayGelsin: 458.99, ptt: 763.41, surat: 493.58, tex: 456.86, yurtici: 568.54, cevaTedarik: 559.80, ceva: 703.52, horoz: 567.76 },
  { desi: 38, aras: 420.19, dhl: 818.91, kolayGelsin: 468.99, ptt: 779.50, surat: 505.86, tex: 467.29, yurtici: 582.13, cevaTedarik: 574.93, ceva: 711.22, horoz: 567.76 },
  { desi: 39, aras: 430.89, dhl: 851.90, kolayGelsin: 478.99, ptt: 795.57, surat: 518.02, tex: 477.69, yurtici: 595.72, cevaTedarik: 590.06, ceva: 719.12, horoz: 567.76 },
  { desi: 40, aras: 441.60, dhl: 884.89, kolayGelsin: 488.99, ptt: 811.66, surat: 536.06, tex: 489.37, yurtici: 609.31, cevaTedarik: 605.19, ceva: 727.08, horoz: 567.76 },
  { desi: 41, aras: 452.31, dhl: 917.88, kolayGelsin: 498.99, ptt: 827.73, surat: 548.34, tex: 499.80, yurtici: 622.90, cevaTedarik: 620.32, ceva: 734.24, horoz: 567.76 },
  { desi: 42, aras: 463.01, dhl: 950.87, kolayGelsin: 508.99, ptt: 843.82, surat: 560.76, tex: 510.26, yurtici: 636.49, cevaTedarik: 635.45, ceva: 741.71, horoz: 567.76 },
  { desi: 43, aras: 473.72, dhl: 983.86, kolayGelsin: 518.99, ptt: 859.90, surat: 573.04, tex: 520.68, yurtici: 650.08, cevaTedarik: 650.58, ceva: 749.17, horoz: 567.76 },
  { desi: 44, aras: 484.42, dhl: 1016.85, kolayGelsin: 528.99, ptt: 875.98, surat: 585.44, tex: 531.13, yurtici: 663.67, cevaTedarik: 665.71, ceva: 756.54, horoz: 567.76 },
  { desi: 45, aras: 495.13, dhl: 1049.84, kolayGelsin: 538.99, ptt: 892.06, surat: 597.86, tex: 541.59, yurtici: 677.27, cevaTedarik: 680.84, ceva: 764.21, horoz: 567.76 },
  { desi: 46, aras: 505.83, dhl: 1082.83, kolayGelsin: 548.99, ptt: 908.14, surat: 610.14, tex: 552.02, yurtici: 690.86, cevaTedarik: 695.97, ceva: 771.75, horoz: 573.58 },
  { desi: 47, aras: 516.54, dhl: 1115.82, kolayGelsin: 558.99, ptt: 924.22, surat: 622.54, tex: 562.47, yurtici: 704.45, cevaTedarik: 711.10, ceva: 779.58, horoz: 586.04 },
  { desi: 48, aras: 527.25, dhl: 1148.81, kolayGelsin: 568.99, ptt: 940.31, surat: 634.83, tex: 572.89, yurtici: 718.04, cevaTedarik: 726.23, ceva: 787.31, horoz: 598.51 },
  { desi: 49, aras: 537.95, dhl: 1181.80, kolayGelsin: 578.99, ptt: 956.38, surat: 647.24, tex: 583.35, yurtici: 731.63, cevaTedarik: 741.36, ceva: 795.21, horoz: 610.98 },
  { desi: 50, aras: 548.66, dhl: 1214.79, kolayGelsin: 588.99, ptt: 972.47, surat: 659.65, tex: 593.80, yurtici: 745.22, cevaTedarik: 756.49, ceva: 803.17, horoz: 623.45 },
]

async function main() {
  console.log('🚀 Tüm kargo fiyatları import ediliyor (0-50 desi)...')
  console.log('📊 %20 kar marjı ekleniyor...')

  const MARKUP = 1.2 // %20 kar marjı

  let imported = 0
  let updated = 0

  for (const row of cargoPricesRaw) {
    try {
      await prisma.cargoPrice.upsert({
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
      imported++
      if (imported % 50 === 0) {
        console.log(`⏳ ${imported} fiyat kaydı işlendi...`)
      }
    } catch (error) {
      console.error(`❌ Desi ${row.desi} için hata:`, error)
      updated++
    }
  }

  // Settings kaydı oluştur
  await prisma.cargoPriceSettings.upsert({
    where: { id: 'default' },
    update: { markupPercent: 20 },
    create: { id: 'default', markupPercent: 20 },
  })

  console.log(`✅ ${imported} fiyat kaydı başarıyla eklendi/güncellendi`)
  console.log(`📝 Kar marjı: %20`)
  console.log(`🎉 İşlem tamamlandı!`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
