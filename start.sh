#!/bin/bash
export PATH="/Users/joon/npm-global/bin:$PATH"
cd "$(dirname "$0")"

echo "Whiteboard 시작 중..."
pm2 start ecosystem.config.cjs
echo ""
echo "✓ API 서버:    http://localhost:3000"
echo "✓ 클라이언트:  http://localhost:5173"
