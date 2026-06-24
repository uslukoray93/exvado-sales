#!/bin/bash

# Exvado Sales - Safe Dev Server Starter
# Bu script birden fazla server process'inin çalışmasını önler

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PID_FILE="$PROJECT_DIR/.dev-server.pid"

echo "🚀 Exvado Sales Dev Server Başlatılıyor..."

# 1. Eğer PID dosyası varsa, process hala çalışıyor mu kontrol et
if [ -f "$PID_FILE" ]; then
  OLD_PID=$(cat "$PID_FILE")
  if ps -p "$OLD_PID" > /dev/null 2>&1; then
    echo "❌ HATA: Server zaten çalışıyor (PID: $OLD_PID)"
    echo "   Durdurmak için: npm run kill-servers"
    exit 1
  else
    echo "⚠️  Eski PID dosyası temizleniyor..."
    rm -f "$PID_FILE"
  fi
fi

# 2. Tüm çalışan Next.js process'lerini öldür
echo "🔍 Çalışan server process'leri kontrol ediliyor..."
RUNNING_SERVERS=$(ps aux | grep -E "next dev|next-server" | grep -v grep | awk '{print $2}')

if [ ! -z "$RUNNING_SERVERS" ]; then
  echo "⚠️  Çalışan server process'leri bulundu, temizleniyor..."
  echo "$RUNNING_SERVERS" | xargs kill -9 2>/dev/null || true
  sleep 2
fi

# 3. .next cache'ini temizle
if [ -d "$PROJECT_DIR/.next" ]; then
  echo "🧹 Cache temizleniyor (.next klasörü)..."
  rm -rf "$PROJECT_DIR/.next"
fi

# 4. Turbopack cache'ini temizle
if [ -d "$PROJECT_DIR/node_modules/.cache" ]; then
  echo "🧹 Node modules cache temizleniyor..."
  rm -rf "$PROJECT_DIR/node_modules/.cache"
fi

# 5. Port kontrolü - 3000 portunu temizle
PORT_PID=$(lsof -ti:3000 2>/dev/null)
if [ ! -z "$PORT_PID" ]; then
  echo "🔧 Port 3000 temizleniyor (PID: $PORT_PID)..."
  kill -9 $PORT_PID 2>/dev/null || true
  sleep 1
fi

echo "✅ Temizlik tamamlandı!"
echo "🚀 Next.js dev server başlatılıyor..."
echo ""

# 6. Next.js dev server'ı başlat ve PID'yi kaydet
cd "$PROJECT_DIR"
next dev &
SERVER_PID=$!

# PID'yi dosyaya kaydet
echo $SERVER_PID > "$PID_FILE"

echo "✅ Server başlatıldı (PID: $SERVER_PID)"
echo "📝 PID dosyası: $PID_FILE"
echo ""
echo "Durdurmak için: npm run kill-servers veya Ctrl+C"
echo ""

# Server process'ini bekle
wait $SERVER_PID

# Server kapandıysa PID dosyasını temizle
rm -f "$PID_FILE"
