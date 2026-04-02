import type { Server } from 'node:http';
import { WebSocketServer, WebSocket } from 'ws';
import { parse as parseCookie } from 'cookie';
import { generateId } from '../utils/id.js';
import { verifyToken } from '../auth/jwt.js';
import { GUEST_USER_ID } from '../db/migrate.js';
import { roomManager } from './RoomManager.js';

// HTTP 서버에 붙어서 /rooms/* 경로 WebSocket 처리 (포트 공유)
export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (req, socket, head) => {
    if (!req.url?.startsWith('/rooms/')) return;
    wss.handleUpgrade(req, socket as never, head, (ws) => {
      wss.emit('connection', ws, req);
    });
  });

  wss.on('connection', async (ws: WebSocket, req) => {
    const match = req.url?.match(/^\/rooms\/([^/?]+)/);
    if (!match) {
      ws.close(1008, 'Invalid room URL');
      return;
    }

    // 인증: 토큰 없으면 게스트로 처리 (추후 인증 연동 시 복구)
    const cookieHeader = req.headers.cookie ?? '';
    const cookies = parseCookie(cookieHeader);
    const token = cookies['auth_token'];
    const payload = token ? verifyToken(token) : null;
    const userName = payload?.name ?? 'Guest';
    const userId = payload?.userId ?? GUEST_USER_ID;

    const boardId = decodeURIComponent(match[1]);
    const sessionId = generateId();

    const room = await roomManager.getOrCreate(boardId);

    room.handleSocketConnect({ sessionId, socket: ws });

    ws.on('message', (data) => {
      room.handleSocketMessage(sessionId, data.toString());
    });

    ws.on('close', () => {
      room.handleSocketClose(sessionId);
    });

    ws.on('error', (err) => {
      console.error(`[WS] Session ${sessionId} error:`, err.message);
      room.handleSocketError(sessionId);
    });

    console.log(`[WS] ${userName} (${userId}) connected to board ${boardId}`);
  });

  return wss;
}
