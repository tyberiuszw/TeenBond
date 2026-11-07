import type { RealtimeChannel } from '@supabase/supabase-js';
import { UserSession } from '@/types/auth';
import { BoardElement, CursorState } from '@/types/board';
import { createClient, isSupabaseConfigured } from './client';

export interface BoardRoomConnection {
  roomId: string;
  cursorsChannel: RealtimeChannel | MockRealtimeChannel;
  elementsChannel: RealtimeChannel | MockRealtimeChannel;
  broadcastCursor: (x: number, y: number, laserTrail?: Array<{ x: number; y: number; timestamp: number }>) => void;
  broadcastElementLock: (elementId: string, locked: boolean) => void;
  broadcastElementUpdate: (element: BoardElement) => void;
  leaveRoom: () => void;
}

export interface MockRealtimeChannel {
  topic: string;
  on: (type: string, filter: Record<string, unknown>, callback: (payload: any) => void) => MockRealtimeChannel;
  subscribe: (callback?: (status: string) => void) => MockRealtimeChannel;
  send: (payload: Record<string, unknown>) => Promise<'ok'>;
  track: (state: Record<string, unknown>) => Promise<'ok'>;
  unsubscribe: () => Promise<'ok'>;
}

function createMockChannel(topic: string): MockRealtimeChannel {
  const listeners: Array<{ event: string; callback: (payload: any) => void }> = [];

  const channel: MockRealtimeChannel = {
    topic,
    on: (_type, filter, callback) => {
      const ev = String(filter?.event || '*');
      listeners.push({ event: ev, callback });
      return channel;
    },
    subscribe: (cb) => {
      if (cb) cb('SUBSCRIBED');
      return channel;
    },
    send: async (payload) => {
      const ev = String(payload?.event || '');
      listeners
        .filter((l) => l.event === ev || l.event === '*')
        .forEach((l) => l.callback(payload));
      return 'ok';
    },
    track: async () => 'ok',
    unsubscribe: async () => 'ok',
  };

  return channel;
}

/**
 * Interface Contract (M4 / M5):
 * Joins a TeenBoard collaborative room via Supabase Realtime Broadcast & Presence.
 * Falls back gracefully to an in-memory mock channel when in Demo Mode or offline.
 */
export function joinBoardRoom(
  roomId: string,
  user: UserSession,
  handlers?: {
    onCursorUpdate?: (cursor: CursorState) => void;
    onElementLock?: (payload: { elementId: string; userId: string; locked: boolean; timestamp: number }) => void;
    onElementUpdate?: (element: BoardElement) => void;
  }
): BoardRoomConnection {
  const safeRoomId = (roomId || 'default-room').trim();

  if (user.isDemo || !isSupabaseConfigured()) {
    const cursorsChannel = createMockChannel(`realtime:cursors:${safeRoomId}`);
    const elementsChannel = createMockChannel(`realtime:elements:${safeRoomId}`);

    if (handlers?.onCursorUpdate) {
      cursorsChannel.on('broadcast', { event: 'cursor' }, (msg) => {
        if (msg?.payload) handlers.onCursorUpdate!(msg.payload as CursorState);
      });
    }
    if (handlers?.onElementLock) {
      elementsChannel.on('broadcast', { event: 'object_lock' }, (msg) => {
        if (msg?.payload) handlers.onElementLock!(msg.payload);
      });
    }
    if (handlers?.onElementUpdate) {
      elementsChannel.on('broadcast', { event: 'element_update' }, (msg) => {
        if (msg?.payload) handlers.onElementUpdate!(msg.payload as BoardElement);
      });
    }

    cursorsChannel.subscribe();
    elementsChannel.subscribe();

    return {
      roomId: safeRoomId,
      cursorsChannel,
      elementsChannel,
      broadcastCursor: (x, y, laserTrail) => {
        cursorsChannel.send({
          type: 'broadcast',
          event: 'cursor',
          payload: {
            userId: user.id,
            name: user.name,
            color: user.chameleonColor,
            x,
            y,
            laserTrail,
            lastSeen: Date.now(),
          } satisfies CursorState,
        });
      },
      broadcastElementLock: (elementId, locked) => {
        elementsChannel.send({
          type: 'broadcast',
          event: 'object_lock',
          payload: {
            elementId,
            userId: user.id,
            locked,
            timestamp: Date.now(),
          },
        });
      },
      broadcastElementUpdate: (element) => {
        elementsChannel.send({
          type: 'broadcast',
          event: 'element_update',
          payload: element,
        });
      },
      leaveRoom: () => {
        cursorsChannel.unsubscribe();
        elementsChannel.unsubscribe();
      },
    };
  }

  const supabase = createClient();
  const cursorsChannel = supabase.channel(`teenboard:cursors:${safeRoomId}`, {
    config: {
      presence: { key: user.id },
      broadcast: { self: false },
    },
  });

  const elementsChannel = supabase.channel(`teenboard:elements:${safeRoomId}`, {
    config: {
      broadcast: { self: false },
    },
  });

  cursorsChannel
    .on('broadcast', { event: 'cursor' }, ({ payload }) => {
      if (payload && handlers?.onCursorUpdate) {
        handlers.onCursorUpdate(payload as CursorState);
      }
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await cursorsChannel.track({
          userId: user.id,
          name: user.name,
          color: user.chameleonColor,
          onlineAt: new Date().toISOString(),
        });
      }
    });

  elementsChannel
    .on('broadcast', { event: 'object_lock' }, ({ payload }) => {
      if (payload && handlers?.onElementLock) {
        handlers.onElementLock(payload);
      }
    })
    .on('broadcast', { event: 'element_update' }, ({ payload }) => {
      if (payload && handlers?.onElementUpdate) {
        handlers.onElementUpdate(payload as BoardElement);
      }
    })
    .subscribe();

  let lastCursorSentAt = 0;

  return {
    roomId: safeRoomId,
    cursorsChannel,
    elementsChannel,
    broadcastCursor: (x, y, laserTrail) => {
      const now = Date.now();
      if (now - lastCursorSentAt < 30) return; // 30ms throttle (~33fps network updates)
      lastCursorSentAt = now;

      cursorsChannel.send({
        type: 'broadcast',
        event: 'cursor',
        payload: {
          userId: user.id,
          name: user.name,
          color: user.chameleonColor,
          x,
          y,
          laserTrail,
          lastSeen: now,
        } satisfies CursorState,
      });
    },
    broadcastElementLock: (elementId, locked) => {
      elementsChannel.send({
        type: 'broadcast',
        event: 'object_lock',
        payload: {
          elementId,
          userId: user.id,
          locked,
          timestamp: Date.now(),
        },
      });
    },
    broadcastElementUpdate: (element) => {
      elementsChannel.send({
        type: 'broadcast',
        event: 'element_update',
        payload: element,
      });
    },
    leaveRoom: () => {
      cursorsChannel.unsubscribe();
      elementsChannel.unsubscribe();
    },
  };
}
