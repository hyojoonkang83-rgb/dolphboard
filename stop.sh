#!/bin/bash
export PATH="/Users/joon/npm-global/bin:$PATH"
cd "$(dirname "$0")"

pm2 stop wb-server wb-client
echo "✓ 서버 중지됨"
