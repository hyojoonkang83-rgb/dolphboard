#!/bin/bash
export PATH="/Users/joon/npm-global/bin:$PATH"
cd "$(dirname "$0")"

# 클라이언트 빌드 (dist 없거나 --build 플래그 시)
if [ ! -d "apps/client/dist" ] || [ "$1" = "--build" ]; then
  echo "클라이언트 빌드 중..."
  pnpm --filter @dolphboard/client build
fi

# PM2로 서버 시작 (이미 실행 중이면 재시작)
if pm2 list | grep -q "dolphboard"; then
  pm2 restart dolphboard
else
  pm2 start ecosystem.config.cjs
  # 부팅 시 자동 시작 등록 (최초 1회)
  pm2 save
fi

echo ""
echo "✓ Dolphboard: http://localhost:3000"
echo ""
echo "로그 확인: pm2 logs dolphboard"
echo "중지:      pm2 stop dolphboard"
