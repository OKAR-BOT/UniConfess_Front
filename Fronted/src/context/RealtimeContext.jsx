import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const RealtimeContext = createContext(null);

function normalizeEmail(email) {
  return String(email || '')
    .trim()
    .toLowerCase();
}

function getSocketBaseUrl() {
  const raw = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';
  return raw.replace(/\/api\/?$/, '');
}

function getTabId() {
  return (
    (typeof window !== 'undefined' && window.crypto && typeof window.crypto.randomUUID === 'function'
      ? window.crypto.randomUUID()
      : null) || `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  );
}

function normalizeNotification(payload = {}) {
  return {
    id: payload.id || payload.challengeId || payload.resourceId || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: payload.type || 'info',
    title: payload.title || 'Notificacion',
    message: payload.message || '',
    code: payload.code || '',
    challengeId: payload.challengeId || '',
    resourceId: payload.resourceId || '',
    target: payload.target || '',
    link: payload.link || '',
    originUserId: payload.originUserId || '',
    originClientId: payload.originClientId || '',
    createdAt: payload.createdAt || new Date().toISOString(),
  };
}

async function waitForSocketReady(socket, timeoutMs = 1500) {
  if (!socket) return false;
  if (socket.connected) return true;
  return new Promise((resolve) => {
    const timer = window.setTimeout(() => resolve(false), timeoutMs);
    socket.once('connect', () => {
      window.clearTimeout(timer);
      resolve(true);
    });
  });
}

async function emitWithAck(socket, event, payload) {
  if (!socket) return { ok: false, reason: 'socket-unavailable' };
  const ready = await waitForSocketReady(socket);
  if (!ready) {
    return { ok: false, reason: 'socket-not-ready' };
  }
  return new Promise((resolve) => {
    socket.emit(event, payload, (ack) => {
      resolve(ack || { ok: true });
    });
  });
}

export function RealtimeProvider({ children }) {
  const socketRef = useRef(null);
  const tabIdRef = useRef(getTabId());
  const channelRef = useRef(null);
  const timersRef = useRef(new Map());
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const storeNotification = useCallback((payload = {}) => {
    const notification = normalizeNotification(payload);
    setNotifications((prev) => {
      const index = prev.findIndex((item) => item.id === notification.id);
      if (index >= 0) {
        const next = [...prev];
        next[index] = { ...next[index], ...notification, id: next[index].id };
        return next;
      }
      return [notification, ...prev].slice(0, 5);
    });

    const ttl = notification.code ? 15000 : 8000;
    const existingTimer = timersRef.current.get(notification.id);
    if (existingTimer) {
      window.clearTimeout(existingTimer);
    }
    const timer = window.setTimeout(() => {
      setNotifications((prev) => prev.filter((item) => item.id !== notification.id));
      timersRef.current.delete(notification.id);
    }, ttl);
    timersRef.current.set(notification.id, timer);

    return notification;
  }, []);

  const handleNotification = useCallback((payload = {}) => {
    const notification = storeNotification(payload);
    if (payload?.type === 'role_changed') {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('role_changed', { detail: payload }));
      }
    }
    return notification;
  }, [storeNotification]);

  const announceConfession = useCallback((confession) => {
    if (!confession || !channelRef.current) return;
    channelRef.current.postMessage({
      type: 'notification',
      sourceTabId: tabIdRef.current,
      notification: {
        type: 'confession',
        title: 'Nueva confesion',
        message: `${confession.displayName} publico en ${confession.category}.`,
        resourceId: confession.id,
        target: confession.handle,
        link: `/feed?focus=${confession.id}`,
        originClientId: tabIdRef.current,
        createdAt: confession.createdAt || new Date().toISOString(),
      },
    });
  }, []);

  useEffect(() => {
    const socket = io(getSocketBaseUrl(), {
      withCredentials: true,
    });
    const timers = timersRef.current;

    socketRef.current = socket;
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('connect_error', () => setConnected(false));
    socket.on('notification', (payload) => {
      if (payload?.type === 'confession' && payload?.originClientId && String(payload.originClientId) === tabIdRef.current) {
        return;
      }
      handleNotification(payload);
    });

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel('uconfess-notifications');
      channelRef.current = channel;
      channel.onmessage = (event) => {
        const data = event.data || {};
        if (data.sourceTabId === tabIdRef.current) return;
        if (data.type !== 'notification' || !data.notification) return;
        handleNotification(data.notification);
      };
    }

    return () => {
      socket.disconnect();
      if (channelRef.current) {
        channelRef.current.close();
        channelRef.current = null;
      }
      timers.forEach((timer) => window.clearTimeout(timer));
      timers.clear();
      socketRef.current = null;
    };
  }, [handleNotification]);

  const dismissNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const joinEmailRoom = useCallback(async (email) => {
    const normalized = normalizeEmail(email);
    if (!normalized) return { ok: false, reason: 'invalid-email' };
    return emitWithAck(socketRef.current, 'room:join', { email: normalized });
  }, []);

  const leaveEmailRoom = useCallback(async (email) => {
    const normalized = normalizeEmail(email);
    if (!normalized) return { ok: false, reason: 'invalid-email' };
    return emitWithAck(socketRef.current, 'room:leave', { email: normalized });
  }, []);

  const joinUserRoom = useCallback(async (userId) => {
    if (!userId) return { ok: false, reason: 'invalid-user' };
    return emitWithAck(socketRef.current, 'room:join', { userId: String(userId) });
  }, []);

  const leaveUserRoom = useCallback(async (userId) => {
    if (!userId) return { ok: false, reason: 'invalid-user' };
    return emitWithAck(socketRef.current, 'room:leave', { userId: String(userId) });
  }, []);

  const value = useMemo(() => ({
    connected,
    notifications,
    dismissNotification,
    joinEmailRoom,
    leaveEmailRoom,
    joinUserRoom,
    leaveUserRoom,
    tabId: tabIdRef.current,
    announceConfession,
  }), [connected, notifications, dismissNotification, joinEmailRoom, leaveEmailRoom, joinUserRoom, leaveUserRoom, announceConfession]);

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}

export function useRealtime() {
  const ctx = useContext(RealtimeContext);
  if (!ctx) {
    throw new Error('useRealtime debe usarse dentro de RealtimeProvider');
  }
  return ctx;
}
