const db = require('../models');

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

const createConfession = async (req, res) => {
  try {
    const { userId, displayName, handle, career, body, category } = req.body;
    if (!userId) {
      return res.status(400).json({ message: 'userId es requerido' });
    }
    const user = await db.User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    if (user.isBanned) {
      return res.status(403).json({ message: 'Tu cuenta ha sido suspendida.' });
    }
    const confession = await db.Confession.create({
      userId,
      displayName: displayName || user.displayName,
      handle: handle || user.handle,
      career: career || user.career || '',
      body,
      category: category || 'General',
    });
    res.status(201).json(confession);
  } catch (err) {
    res.status(500).json({ message: 'Error al publicar', error: err.message });
  }
};

module.exports = { getAllConfessions, createConfession };
