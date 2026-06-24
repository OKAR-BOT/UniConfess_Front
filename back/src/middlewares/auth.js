const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET || 'changeme';

function verifyToken(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token no proporcionado.' });
  }
  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, secret);
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (err) {
    const message = err.name === 'TokenExpiredError'
      ? 'Token expirado. Inicia sesion nuevamente.'
      : 'Token invalido.';
    return res.status(401).json({ message });
  }
}

function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next();
  }
  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, secret);
    req.userId = decoded.id;
    req.userRole = decoded.role;
  } catch (err) {
    // token invalido o expirado — simplemente continua sin auth
  }
  next();
}

module.exports = { verifyToken, optionalAuth };
