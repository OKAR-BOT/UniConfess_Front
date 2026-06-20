const db = require('../models');
const bcrypt = require('bcryptjs');

const getAllUsers = async (req, res) => {
  try {
    const users = await db.User.findAll({
      attributes: { exclude: ['passwordHash'] },
      order: [['createdAt', 'DESC']],
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

const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!['user', 'premium', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Rol invalido.' });
    }
    const user = await db.User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }
    user.role = role;
    await user.save();
    const { passwordHash: _, ...publicUser } = user.toJSON();
    res.status(200).json(publicUser);
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar rol', error: err.message });
  }
};

const toggleUserBan = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await db.User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }
    user.isBanned = !user.isBanned;
    await user.save();
    const { passwordHash: _, ...publicUser } = user.toJSON();
    res.status(200).json(publicUser);
  } catch (err) {
    res.status(500).json({ message: 'Error al cambiar estado de baneo', error: err.message });
  }
};

const setUserPremium = async (req, res) => {
  try {
    const { id } = req.params;
    const { membershipExpiresAt } = req.body;
    const user = await db.User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }
    user.role = 'premium';
    user.membershipExpiresAt = membershipExpiresAt || new Date(Date.now() + 365 * 86400000).toISOString();
    await user.save();
    const { passwordHash: _, ...publicUser } = user.toJSON();
    res.status(200).json(publicUser);
  } catch (err) {
    res.status(500).json({ message: 'Error al asignar premium', error: err.message });
  }
};

const getProfileByHandle = async (req, res) => {
  try {
    const { handle } = req.params;
    const user = await db.User.findOne({
      where: { handle: handle.toLowerCase() },
      attributes: { exclude: ['passwordHash'] },
    });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }
    const confCount = await db.Confession.count({ where: { userId: user.id } });
    const commentCount = await db.Comment.count({ where: { userId: user.id } });
    const likeCount = await db.Interaction.count({ where: { userId: user.id, type: 'like' } });
    res.status(200).json({
      ...user.toJSON(),
      stats: { confessions: confCount, comments: commentCount, likesGiven: likeCount },
    });
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener perfil', error: err.message });
  }
};

const getUserConfessions = async (req, res) => {
  try {
    const { handle } = req.params;
    const user = await db.User.findOne({ where: { handle: handle.toLowerCase() } });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }
    const confessions = await db.Confession.findAll({
      where: { userId: user.id },
      order: [['createdAt', 'DESC']],
    });
    res.status(200).json(confessions);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener confesiones', error: err.message });
  }
};

module.exports = {
  getAllUsers, createUser, loginUser,
  postConfession, getAllConfessions,
  updateUserRole, toggleUserBan, setUserPremium,
  getProfileByHandle, getUserConfessions,
};
