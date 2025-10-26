#!/bin/bash

# Bioplant CRM Geliştirme Ortamı Başlatma Scripti
# Bu script hem backend hem de frontend sunucularını başlatır

echo "🚀 Bioplant CRM Geliştirme Ortamı Başlatılıyor..."
echo ""

# Renk kodları
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Backend'i başlat
echo -e "${BLUE}📦 Backend sunucusu başlatılıyor (Port 3001)...${NC}"
cd backend
node server.js &
BACKEND_PID=$!
cd ..

# Biraz bekle
sleep 2

# Frontend'i başlat
echo -e "${BLUE}🎨 Frontend sunucusu başlatılıyor (Port 3000)...${NC}"
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo -e "${GREEN}✅ Sunucular başlatıldı!${NC}"
echo ""
echo "📍 Backend API: http://localhost:3001"
echo "📍 Frontend UI: http://localhost:3000"
echo ""
echo "🛑 Sunucuları durdurmak için Ctrl+C tuşlarına basın"
echo ""

# Sunucuları bekle
wait $BACKEND_PID $FRONTEND_PID
