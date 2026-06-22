const crypto = require('crypto');
const { Server } = require('socket.io');

let io = null;

function normalizeEmail(email) {
  return String(email || '')
    .trim()
    .toLowerCase();
}

function emailRoom(email) {
  return `email:${normalizeEmail(email)}`;
}

function userRoom(userId) {
  return `user:${String(userId || '').trim()}`;
}

function challengeRoom(challengeId) {
  return `challenge:${String(challengeId || '').trim()}`;
}

function normalizeNotification(payload = {}) {
  return {
    id: payload.id || payload.challengeId || payload.resourceId || crypto.randomUUID(),
    type: payload.type || 'info',
    title: payload.title || 'Notificacion',
    message: payload.message || '',
    code: payload.code || null,
    challengeId: payload.challengeId || null,
    resourceId: payload.resourceId || null,
    target: payload.target || null,
    link: payload.link || null,
    originUserId: payload.originUserId || null,
    originClientId: payload.originClientId || null,
    createdAt: payload.createdAt || new Date().toISOString(),
  };
}

function emitToRoom(room, payload) {
  if (!io || !room) return;
  io.to(room).emit('notification', normalizeNotification(payload));
}

function notifyEmail(email, payload) {
  emitToRoom(emailRoom(email), payload);
}

function notifyUser(userId, payload) {
  emitToRoom(userRoom(userId), payload);
}

function notifyChallenge(challengeId, payload) {
  emitToRoom(challengeRoom(challengeId), payload);
}

function notifyAll(payload) {
  if (!io) return;
  io.emit('notification', normalizeNotification(payload));
}

function initRealtime(server) {
  if (io) return io;

  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    socket.on('room:join', (payload = {}, ack) => {
      const rooms = [];
      if (payload.email) rooms.push(emailRoom(payload.email));
      if (payload.userId) rooms.push(userRoom(payload.userId));
      if (payload.challengeId) rooms.push(challengeRoom(payload.challengeId));
      rooms.forEach((room) => socket.join(room));
      if (typeof ack === 'function') {
        ack({ ok: true, rooms });
      }
    });

    socket.on('room:leave', (payload = {}, ack) => {
      const rooms = [];
      if (payload.email) rooms.push(emailRoom(payload.email));
      if (payload.userId) rooms.push(userRoom(payload.userId));
      if (payload.challengeId) rooms.push(challengeRoom(payload.challengeId));
      rooms.forEach((room) => socket.leave(room));
      if (typeof ack === 'function') {
        ack({ ok: true, rooms });
      }
    });

    socket.on('notification:ping', (payload, ack) => {
      if (typeof ack === 'function') {
        ack({ ok: true, payload });
      }
    });
  });

  return io;
}

module.exports = {
  initRealtime,
  notifyAll,
  notifyEmail,
  notifyUser,
  notifyChallenge,
  emailRoom,
  userRoom,
  challengeRoom,
};
