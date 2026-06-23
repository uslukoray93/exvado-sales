#!/bin/bash

# Exvado Sales - Server Killer
# Tüm development server'ları güvenli şekilde durdurur

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PID_FILE="$PROJECT_DIR/.dev-server.pid"

echo "🛑 Dev server'lar durduruluyor..."

# 1. PID dosyasından server'ı durdur
if [ -f "$PID_FILE" ]; then
  PID=$(cat "$PID_FILE")
  if ps -p "$PID" > /dev/null 2>&1; then
    echo "🔧 Ana server durduruluyor (PID: $PID)..."
    kill -9 $PID 2>/dev/null || true
  fi
  rm -f "$PID_FILE"
  echo "✅ PID dosyası temizlendi"
fi

# 2. Tüm çalışan Next.js process'lerini bul ve öldür
NEXT_PIDS=$(ps aux | grep -E "next dev|next-server" | grep -v grep | awk '{print $2}')

if [ ! -z "$NEXT_PIDS" ]; then
  echo "🔍 Çalışan server process'leri bulundu:"
  echo "$NEXT_PIDS" | while read pid; do
    echo "  - PID: $pid"
  done

  echo "🔧 Tüm process'ler durduruluyor..."
  echo "$NEXT_PIDS" | xargs kill -9 2>/dev/null || true
  sleep 1
  echo "✅ Tüm server process'leri durduruldu"
else
  echo "ℹ️  Çalışan server process'i bulunamadı"
fi

# 3. Port 3000 ve 3001'i temizle
for PORT in 3000 3001; do
  PORT_PID=$(lsof -ti:$PORT 2>/dev/null)
  if [ ! -z "$PORT_PID" ]; then
    echo "🔧 Port $PORT temizleniyor (PID: $PORT_PID)..."
    kill -9 $PORT_PID 2>/dev/null || true
  fi
done

# 4. Zombie process kontrolü
ZOMBIE_COUNT=$(ps aux | grep -E "next|node" | grep -v grep | grep -E "Z|<defunct>" | wc -l)
if [ $ZOMBIE_COUNT -gt 0 ]; then
  echo "⚠️  $ZOMBIE_COUNT zombie process bulundu, temizleniyor..."
  ps aux | grep -E "next|node" | grep -v grep | grep -E "Z|<defunct>" | awk '{print $2}' | xargs kill -9 2>/dev/null || true
fi

echo ""
echo "✅ Tüm server process'leri temizlendi!"
echo "🚀 Yeni server başlatmak için: npm run dev"
