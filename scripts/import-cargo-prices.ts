import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Sürat Kargo fiyatları (KDV hariç)
const suratPrices = [
  { desi: 1, price: 89.71 },
  { desi: 2, price: 89.71 },
  { desi: 3, price: 89.96 },
  { desi: 4, price: 109.30 },
  { desi: 5, price: 114.94 },
  { desi: 6, price: 126.28 },
  { desi: 7, price: 134.85 },
  { desi: 8, price: 142.48 },
  { desi: 9, price: 151.87 },
  { desi: 10, price: 160.43 },
  { desi: 11, price: 171.83 },
  { desi: 12, price: 181.55 },
  { desi: 13, price: 188.84 },
  { desi: 14, price: 193.44 },
  { desi: 15, price: 199.69 },
  { desi: 16, price: 207.26 },
  { desi: 17, price: 218.26 },
  { desi: 18, price: 229.26 },
  { desi: 19, price: 240.14 },
  { desi: 20, price: 251.15 },
  { desi: 21, price: 262.40 },
  { desi: 22, price: 270.59 },
  { desi: 23, price: 282.62 },
  { desi: 24, price: 292.72 },
  { desi: 25, price: 302.70 },
  { desi: 26, price: 312.42 },
  { desi: 27, price: 322.15 },
  { desi: 28, price: 331.87 },
  { desi: 29, price: 341.59 },
  { desi: 30, price: 351.32 },
  { desi: 31, price: 420.28 },
  { desi: 32, price: 432.43 },
  { desi: 33, price: 444.71 },
  { desi: 34, price: 456.87 },
  { desi: 35, price: 469.15 },
  { desi: 36, price: 481.30 },
  { desi: 37, price: 493.58 },
  { desi: 38, price: 505.86 },
  { desi: 39, price: 518.02 },
  { desi: 40, price: 536.06 },
  { desi: 41, price: 548.34 },
  { desi: 42, price: 560.76 },
  { desi: 43, price: 573.04 },
  { desi: 44, price: 585.44 },
  { desi: 45, price: 597.86 },
  { desi: 46, price: 610.14 },
  { desi: 47, price: 622.54 },
  { desi: 48, price: 634.83 },
  { desi: 49, price: 647.24 },
  { desi: 50, price: 659.52 },
  { desi: 51, price: 671.93 },
  { desi: 52, price: 684.34 },
  { desi: 53, price: 696.62 },
  { desi: 54, price: 709.03 },
  { desi: 55, price: 721.44 },
  { desi: 56, price: 733.73 },
  { desi: 57, price: 746.14 },
  { desi: 58, price: 758.41 },
  { desi: 59, price: 770.83 },
  { desi: 60, price: 783.23 },
  { desi: 61, price: 795.52 },
  { desi: 62, price: 807.93 },
  { desi: 63, price: 820.21 },
  { desi: 64, price: 832.62 },
  { desi: 65, price: 845.03 },
  { desi: 66, price: 857.31 },
  { desi: 67, price: 869.72 },
  { desi: 68, price: 882.00 },
  { desi: 69, price: 894.42 },
  { desi: 70, price: 906.82 },
  { desi: 71, price: 919.10 },
  { desi: 72, price: 931.52 },
  { desi: 73, price: 943.80 },
  { desi: 74, price: 956.20 },
  { desi: 75, price: 968.62 },
  { desi: 76, price: 980.90 },
  { desi: 77, price: 993.31 },
  { desi: 78, price: 1005.59 },
  { desi: 79, price: 1018.00 },
  { desi: 80, price: 1030.41 },
  { desi: 81, price: 1042.69 },
  { desi: 82, price: 1055.11 },
  { desi: 83, price: 1067.39 },
  { desi: 84, price: 1079.79 },
  { desi: 85, price: 1092.20 },
  { desi: 86, price: 1104.49 },
  { desi: 87, price: 1116.89 },
  { desi: 88, price: 1129.18 },
  { desi: 89, price: 1141.59 },
  { desi: 90, price: 1154.00 },
  { desi: 91, price: 1166.28 },
  { desi: 92, price: 1178.69 },
  { desi: 93, price: 1190.98 },
  { desi: 94, price: 1203.38 },
  { desi: 95, price: 1215.80 },
  { desi: 96, price: 1228.08 },
  { desi: 97, price: 1240.48 },
  { desi: 98, price: 1252.76 },
  { desi: 99, price: 1265.18 },
  { desi: 100, price: 1277.58 },
  { desi: 101, price: 1289.77 },
  { desi: 102, price: 1303.95 },
  { desi: 103, price: 1317.13 },
]

async function main() {
  console.log('🚀 Sürat Kargo fiyatları veritabanına ekleniyor...')

  // Önce mevcut kayıtları temizle
  await prisma.cargoPrice.deleteMany({})
  console.log('✅ Eski kayıtlar temizlendi')

  // Yeni fiyatları ekle
  for (const item of suratPrices) {
    await prisma.cargoPrice.create({
      data: {
        desi: item.desi,
        surat: item.price,
        aras: 0,
        dhl: 0,
        kolayGelsin: 0,
        ptt: null,
        tex: null,
        yurtici: 0,
        cevaTedarik: 0,
        ceva: 0,
        horoz: 0,
      }
    })
    console.log(`✓ Desi ${item.desi}: ${item.price} ₺ (KDV Hariç) → ${(item.price * 1.20).toFixed(2)} ₺ (KDV Dahil)`)
  }

  console.log('\n✅ Tüm fiyatlar başarıyla eklendi!')
  console.log(`📦 Toplam ${suratPrices.length} desi fiyatı eklendi`)
}

main()
  .catch((e) => {
    console.error('❌ Hata:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
