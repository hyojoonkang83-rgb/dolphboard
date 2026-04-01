import { WebSocketServer, WebSocket } from 'ws';
import { parse as parseCookie } from 'cookie';
import { generateId } from '../utils/id.js';
import { verifyToken } from '../auth/jwt.js';
import { roomManager } from './RoomManager.js';

export function setupWebSocket(port: number) {
  const wss = new WebSocketServer({ port });

  wss.on('connection', async (ws: WebSocket, req) => {
    // Auth: verify JWT from cookie
    const cookieHeader = req.headers.cookie ?? '';
    const cookies = parseCookie(cookieHeader);
    const token = cookies['auth_token'];
    const payload = token ? verifyToken(token) : null;

    if (!payload) {
      ws.close(1008, 'Unauthorized');
      return;
    }

    const match = req.url?.match(/^\/rooms\/([^/?]+)/);
    if (!match) {
      ws.close(1008, 'Invalid room URL');
      return;
    }

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

    console.log(`[WS] Session ${sessionId} (${payload.name}) connected to board ${boardId}`);
  });

  console.log(`✓ WebSocket server running at ws://localhost:${port}`);
  return wss;
}
