import { TLSocketRoom } from '@tldraw/sync-core';
import { boardRepo } from '../repositories/boardRepo.js';

const SAVE_DEBOUNCE_MS = 2000;

export class RoomManager {
  private rooms = new Map<string, TLSocketRoom>();
  private saveTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private pending = new Map<string, Promise<TLSocketRoom>>();

  async getOrCreate(boardId: string): Promise<TLSocketRoom> {
    const existing = this.rooms.get(boardId);
    if (existing) return existing;

    // Deduplicate concurrent requests for the same boardId
    const inFlight = this.pending.get(boardId);
    if (inFlight) return inFlight;

    const promise = this._create(boardId);
    this.pending.set(boardId, promise);
    try {
      const room = await promise;
      return room;
    } finally {
      this.pending.delete(boardId);
    }
  }

  private async _create(boardId: string): Promise<TLSocketRoom> {
    const raw = await boardRepo.getDocument(boardId);
    let initialSnapshot: Parameters<typeof TLSocketRoom.prototype.loadSnapshot>[0] | undefined;

    if (raw) {
      try {
        initialSnapshot = JSON.parse(raw);
      } catch {
        // corrupt data — start fresh
      }
    }

    const room: TLSocketRoom = new TLSocketRoom({
      initialSnapshot,
      onDataChange: () => this.scheduleSave(boardId, room),
      onSessionRemoved: (_room, { numSessionsRemaining }) => {
        if (numSessionsRemaining === 0) {
          this.persistRoom(boardId, room);
          this.rooms.delete(boardId);
          const timer = this.saveTimers.get(boardId);
          if (timer) {
            clearTimeout(timer);
            this.saveTimers.delete(boardId);
          }
        }
      },
    });

    this.rooms.set(boardId, room);
    return room;
  }

  private scheduleSave(boardId: string, room: TLSocketRoom) {
    const existing = this.saveTimers.get(boardId);
    if (existing) clearTimeout(existing);
    const timer = setTimeout(() => {
      this.persistRoom(boardId, room);
      this.saveTimers.delete(boardId);
    }, SAVE_DEBOUNCE_MS);
    this.saveTimers.set(boardId, timer);
  }

  private async persistRoom(boardId: string, room: TLSocketRoom) {
    try {
      const snapshot = room.getCurrentSnapshot();
      await boardRepo.saveDocument(boardId, JSON.stringify(snapshot));
    } catch (e) {
      console.error(`[RoomManager] Failed to persist board ${boardId}:`, e);
    }
  }
}

export const roomManager = new RoomManager();
