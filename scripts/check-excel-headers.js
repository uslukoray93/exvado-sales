const XLSX = require('xlsx');
const fs = require('fs');

// Trendyol Excel dosyasını oku
const filePath = '/Users/korayuslu/Desktop/TY/trendyol-urun.xlsx';

if (!fs.existsSync(filePath)) {
  console.log('❌ Dosya bulunamadı:', filePath);
  process.exit(1);
}

const workbook = XLSX.readFile(filePath);
const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

// Manuel olarak cell'leri oku
const rows = {};
Object.keys(firstSheet).forEach(cellKey => {
  if (!cellKey.startsWith('!')) {
    const match = cellKey.match(/^([A-Z]+)(\d+)$/);
    if (match) {
      const col = match[1];
      const rowNum = parseInt(match[2]);
      const colNum = col.split('').reduce((acc, char) => acc * 26 + char.charCodeAt(0) - 64, 0) - 1;

      if (!rows[rowNum]) rows[rowNum] = [];
      rows[rowNum][colNum] = firstSheet[cellKey].v;
    }
  }
});

// İlk satır (başlıklar)
const headers = rows[1] || [];

console.log('\n📋 TRENDYOL EXCEL BAŞLIKLARI:');
console.log('='.repeat(80));
headers.forEach((header, index) => {
  if (header) {
    const headerStr = header.toString();
    const isStockRelated = headerStr.toUpperCase().includes('STOK') ||
                          headerStr.toUpperCase().includes('ADET');
    const marker = isStockRelated ? '🎯' : '  ';
    console.log(`${marker} [${index}] ${headerStr}`);
  }
});

console.log('\n🔍 STOK İLE İLGİLİ SÜTUNLAR:');
console.log('='.repeat(80));
const stockIndex = headers.findIndex(h => {
  if (!h) return false;
  const normalized = h.toString().toUpperCase().trim();
  return normalized === 'STOKADEDI' ||
         normalized === 'STOK ADEDI' ||
         normalized === 'ÜRÜN STOK ADEDI' ||
         normalized.includes('STOK ADEDI') ||
         (normalized.includes('STOK') && normalized.includes('ADET'));
});

console.log('Bulunan stok sütunu index:', stockIndex);
console.log('Sütun adı:', stockIndex !== -1 ? headers[stockIndex] : 'BULUNAMADI');

// İlk 3 ürünün stok değerlerini göster
console.log('\n📦 İLK 3 ÜRÜN VERİLERİ:');
console.log('='.repeat(80));
for (let i = 2; i <= 4; i++) {
  const row = rows[i] || [];
  console.log(`\nÜrün ${i - 1}:`);

  // Stok kodu
  const stockCodeIndex = headers.findIndex(h =>
    h && (h.toString().toLowerCase().includes('stokkodu') ||
         (h.toString().toLowerCase().includes('stok') && h.toString().toLowerCase().includes('kodu')))
  );
  console.log(`  Stok Kodu: ${row[stockCodeIndex] || 'N/A'}`);

  // Ürün adı
  const nameIndex = headers.findIndex(h =>
    h && (h.toString().toLowerCase().includes('ürün') && h.toString().toLowerCase().includes('ad'))
  );
  console.log(`  Ürün Adı: ${row[nameIndex] || 'N/A'}`);

  // Stok adedi
  if (stockIndex !== -1) {
    console.log(`  Stok Adedi [${stockIndex}]: ${row[stockIndex]}`);
  } else {
    console.log(`  Stok Adedi: SÜTUN BULUNAMADI`);
    // Tüm stok içeren sütunları göster
    headers.forEach((h, idx) => {
      if (h && (h.toString().toUpperCase().includes('STOK') || h.toString().toUpperCase().includes('ADET'))) {
        console.log(`    ${h} [${idx}]: ${row[idx]}`);
      }
    });
  }
}
