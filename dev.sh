#!/bin/bash
export PATH="/Users/joon/npm-global/bin:$PATH"
cd "$(dirname "$0")"

echo "Starting Whiteboard (local dev)..."
echo "  API:    http://localhost:3000"
echo "  Client: http://localhost:5173"
echo ""

# Run server and client in parallel
pnpm --filter @whiteboard/server dev &
SERVER_PID=$!

pnpm --filter @whiteboard/client dev &
CLIENT_PID=$!

# Cleanup on exit
trap "kill $SERVER_PID $CLIENT_PID 2>/dev/null" EXIT INT TERM

wait
