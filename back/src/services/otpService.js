const crypto = require('crypto');
const db = require('../models');

const OTP_LENGTH = Math.min(Math.max(Number.parseInt(process.env.OTP_LENGTH || '6', 10) || 6, 4), 8);
const OTP_TTL_MINUTES = Math.max(Number.parseInt(process.env.OTP_EXPIRES_MINUTES || '10', 10) || 10, 1);
const OTP_MAX_ATTEMPTS = Math.max(Number.parseInt(process.env.OTP_MAX_ATTEMPTS || '5', 10) || 5, 1);
const OTP_SECRET = process.env.OTP_SECRET || process.env.JWT_SECRET || 'changeme';

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function normalizeCode(value) {
  return String(value || '').replace(/\s+/g, '').trim();
}

function generateOtpCode() {
  const max = 10 ** OTP_LENGTH;
  return String(crypto.randomInt(0, max)).padStart(OTP_LENGTH, '0');
}

function hashOtpCode(code) {
  return crypto.createHash('sha256').update(`${OTP_SECRET}:${normalizeCode(code)}`).digest('hex');
}

function safeCompare(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

async function issueLoginChallenge(user) {
  await db.OtpChallenge.destroy({
    where: {
      userId: user.id,
      purpose: 'login',
      consumedAt: null,
    },
  });

  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

  const challenge = await db.OtpChallenge.create({
    userId: user.id,
    email: user.email,
    purpose: 'login',
    codeHash: hashOtpCode(code),
    attempts: 0,
    expiresAt,
  });

  return { challenge, code, expiresAt };
}

async function verifyLoginChallenge(challengeId, code) {
  const challenge = await db.OtpChallenge.findByPk(challengeId);
  if (!challenge) {
    throw httpError(404, 'El codigo OTP no existe o ya expiro.');
  }

  if (challenge.purpose !== 'login') {
    throw httpError(400, 'El codigo OTP no corresponde al acceso.');
  }

  if (challenge.consumedAt) {
    throw httpError(410, 'Este codigo OTP ya fue usado.');
  }

  const expiresAt = new Date(challenge.expiresAt);
  if (Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() < Date.now()) {
    await challenge.destroy().catch(() => {});
    throw httpError(410, 'El codigo OTP expiro. Vuelve a iniciar sesion.');
  }

  if (challenge.attempts >= OTP_MAX_ATTEMPTS) {
    await challenge.destroy().catch(() => {});
    throw httpError(429, 'Demasiados intentos. Pide un nuevo codigo.');
  }

  if (!safeCompare(hashOtpCode(code), challenge.codeHash)) {
    challenge.attempts += 1;
    if (challenge.attempts >= OTP_MAX_ATTEMPTS) {
      await challenge.destroy().catch(() => {});
      throw httpError(429, 'Demasiados intentos. Pide un nuevo codigo.');
    }
    await challenge.save();
    throw httpError(401, 'Codigo OTP incorrecto.');
  }

  const user = await db.User.findByPk(challenge.userId);
  if (!user) {
    await challenge.destroy().catch(() => {});
    throw httpError(404, 'Usuario no encontrado.');
  }

  if (user.isBanned) {
    await challenge.destroy().catch(() => {});
    throw httpError(403, 'Tu cuenta ha sido suspendida.');
  }

  await challenge.destroy().catch(() => {});
  return { user };
}

module.exports = {
  issueLoginChallenge,
  verifyLoginChallenge,
  httpError,
};
