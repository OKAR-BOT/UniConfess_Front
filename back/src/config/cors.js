const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://uni-confess-front-4doj.vercel.app',
];

function parseOrigins(value) {
  return String(value || '')
    .split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean);
}

function getAllowedOrigins() {
  const configuredOrigins = [
    ...parseOrigins(process.env.CORS_ORIGINS),
    ...parseOrigins(process.env.CORS_ORIGIN),
  ];

  return Array.from(new Set([
    ...DEFAULT_ALLOWED_ORIGINS,
    ...configuredOrigins,
  ]));
}

function corsOrigin(origin, callback) {
  if (!origin || getAllowedOrigins().includes(String(origin).replace(/\/+$/, ''))) {
    callback(null, true);
    return;
  }

  callback(new Error(`Origin not allowed by CORS: ${origin}`));
}

module.exports = {
  corsOrigin,
  getAllowedOrigins,
};
