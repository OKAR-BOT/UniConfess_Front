const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../models');

const secret = process.env.JWT_SECRET || 'changeme';
const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    secret,
    { expiresIn }
  );
}

const register = async (req, res) => {
  try {
    const { displayName, handle, email, password, career } = req.body;

    if (!displayName || !handle || !email || !password || !career) {
      return res.status(400).json({ message: 'Todos los campos son requeridos.' });
    }
    if (displayName.length < 2 || displayName.length > 60) {
      return res.status(400).json({ message: 'El nombre debe tener entre 2 y 60 caracteres.' });
    }
    if (!/^[a-z0-9_]{3,20}$/i.test(handle)) {
      return res.status(400).json({ message: 'Usuario: 3-20 caracteres, solo letras, numeros y _.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Correo no valido.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'La contrasena debe tener al menos 6 caracteres.' });
    }

    const normEmail = email.toLowerCase().trim();
    const normHandle = handle.toLowerCase().replace(/^@+/, '').trim();

    const existingEmail = await db.User.findOne({ where: { email: normEmail } });
    if (existingEmail) {
      return res.status(409).json({ message: 'Ya existe una cuenta con ese correo.' });
    }
    const existingHandle = await db.User.findOne({ where: { handle: normHandle } });
    if (existingHandle) {
      return res.status(409).json({ message: 'Ese nombre de usuario ya esta en uso.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await db.User.create({
      displayName: displayName.trim(),
      handle: normHandle,
      email: normEmail,
      passwordHash,
      career,
    });

    const token = generateToken(user);
    const { passwordHash: _, ...publicUser } = user.toJSON();

    res.status(201).json({ token, user: publicUser });
  } catch (err) {
    res.status(500).json({ message: 'Error al registrar', error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Correo y contrasena requeridos.' });
    }

    const user = await db.User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      return res.status(401).json({ message: 'Credenciales incorrectas.' });
    }
    if (user.isBanned) {
      return res.status(403).json({ message: 'Tu cuenta ha sido suspendida.' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: 'Credenciales incorrectas.' });
    }

    const token = generateToken(user);
    const { passwordHash: _, ...publicUser } = user.toJSON();

    res.status(200).json({ token, user: publicUser });
  } catch (err) {
    res.status(500).json({ message: 'Error al iniciar sesion', error: err.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await db.User.findByPk(req.userId, {
      attributes: { exclude: ['passwordHash'] },
    });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener perfil', error: err.message });
  }
};

module.exports = { register, login, getMe };
