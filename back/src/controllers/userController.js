const db = require('../models');
const bcrypt = require('bcryptjs');

const getAllUsers = async (req, res) => {
  try {
    const users = await db.User.findAll({
      attributes: { exclude: ['passwordHash'] },
    });
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener usuarios', error: err.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { displayName, handle, email, password, career } = req.body;
    const existingEmail = await db.User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(409).json({ message: 'Ya existe una cuenta con ese correo.' });
    }
    const existingHandle = await db.User.findOne({ where: { handle } });
    if (existingHandle) {
      return res.status(409).json({ message: 'Ese nombre de usuario ya esta en uso.' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await db.User.create({
      displayName, handle, email, passwordHash, career,
    });
    const { passwordHash: _, ...publicUser } = user.toJSON();
    res.status(201).json(publicUser);
  } catch (err) {
    res.status(500).json({ message: 'Error al crear usuario', error: err.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await db.User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Credenciales invalidas' });
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: 'Credenciales invalidas' });
    }
    if (user.isBanned) {
      return res.status(403).json({ message: 'Tu cuenta ha sido suspendida.' });
    }
    const { passwordHash: _, ...publicUser } = user.toJSON();
    res.status(200).json({ message: 'Login exitoso', user: publicUser });
  } catch (err) {
    res.status(500).json({ message: 'Error al iniciar sesion', error: err.message });
  }
};

const postConfession = async (req, res) => {
  try {
    const user = await db.User.findByPk(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    const { typePost, content, displayName, handle, career, category } = req.body;
    const confession = await db.Confession.create({
      userId: user.id,
      displayName: displayName || user.displayName,
      handle: handle || user.handle,
      career: career || user.career,
      body: content || req.body.body,
      category: category || typePost || 'General',
    });
    res.status(201).json(confession);
  } catch (err) {
    res.status(500).json({ message: 'Error al publicar', error: err.message });
  }
};

const getAllConfessions = async (req, res) => {
  try {
    const confessions = await db.Confession.findAll({
      order: [['createdAt', 'DESC']],
    });
    res.status(200).json(confessions);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener confesiones', error: err.message });
  }
};

module.exports = { getAllUsers, createUser, postConfession, getAllConfessions, loginUser };
