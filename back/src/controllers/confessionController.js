const db = require('../models');
const { notifyAll } = require('../realtime/socket');

const getAllConfessions = async (req, res) => {
  try {
    let blockedIds = [];
    if (req.userId) {
      const blocksGiven = await db.Block.findAll({
        where: { blockerId: req.userId },
        attributes: ['blockedId'],
      });
      const blocksReceived = await db.Block.findAll({
        where: { blockedId: req.userId },
        attributes: ['blockerId'],
      });
      blockedIds = [
        ...blocksGiven.map(b => b.blockedId),
        ...blocksReceived.map(b => b.blockerId),
      ];
    }
    const confessions = await db.Confession.findAll({
      order: [['createdAt', 'DESC']],
      include: [{ model: db.User, attributes: ['role', 'avatarUrl'], as: 'user' }],
    });
    const result = confessions
      .filter(c => !blockedIds.includes(c.userId))
      .map((c) => {
        const json = c.toJSON();
        json.authorRole = json.user ? json.user.role : 'user';
        json.authorAvatarUrl = json.user ? json.user.avatarUrl : null;
        delete json.user;
        return json;
      });
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener confesiones', error: err.message });
  }
};

const createConfession = async (req, res) => {
  try {
    const { userId, displayName, handle, career, body, category, clientId } = req.body;
    const effectiveUserId = userId || req.userId;
    if (!effectiveUserId) {
      return res.status(400).json({ message: 'userId es requerido' });
    }
    const user = await db.User.findByPk(effectiveUserId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    if (user.isBanned) {
      return res.status(403).json({ message: 'Tu cuenta ha sido suspendida.' });
    }
    if (!body || body.trim().length < 10) {
      return res.status(400).json({ message: 'La publicacion debe tener al menos 10 caracteres.' });
    }
    if (body.length > 4000) {
      return res.status(400).json({ message: 'Maximo 4000 caracteres.' });
    }
    const confession = await db.Confession.create({
      userId: effectiveUserId,
      displayName: displayName || user.displayName,
      handle: handle || user.handle,
      career: career || user.career || '',
      body: body.trim(),
      category: category || 'General',
    });
    notifyAll({
      type: 'confession',
      title: 'Nueva confesion',
      message: `${confession.displayName} publico en ${confession.category}.`,
      resourceId: confession.id,
      target: confession.handle,
      link: `/feed?focus=${confession.id}`,
      originUserId: effectiveUserId,
      originClientId: clientId || null,
    });
    res.status(201).json(confession);
  } catch (err) {
    res.status(500).json({ message: 'Error al publicar', error: err.message });
  }
};

const deleteConfession = async (req, res) => {
  try {
    const { id } = req.params;
    const confession = await db.Confession.findByPk(id);
    if (!confession) {
      return res.status(404).json({ message: 'Confesion no encontrada.' });
    }
    if (req.userId !== confession.userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'No tienes permiso para eliminar esta confesion.' });
    }
    await confession.destroy();
    res.status(200).json({ message: 'Confesion eliminada.' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar confesion', error: err.message });
  }
};

const updateConfession = async (req, res) => {
  try {
    const { id } = req.params;
    const { body, category } = req.body;
    const confession = await db.Confession.findByPk(id);
    if (!confession) {
      return res.status(404).json({ message: 'Confesion no encontrada.' });
    }
    if (req.userId !== confession.userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'No tienes permiso para editar esta confesion.' });
    }
    if (req.userRole !== 'premium' && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Solo usuarios premium pueden editar confesiones.' });
    }
    if (body !== undefined) {
      if (!body || body.trim().length < 10) {
        return res.status(400).json({ message: 'La publicacion debe tener al menos 10 caracteres.' });
      }
      if (body.length > 4000) {
        return res.status(400).json({ message: 'Maximo 4000 caracteres.' });
      }
      confession.body = body.trim();
    }
    if (category !== undefined) {
      confession.category = category;
    }
    await confession.save();
    res.status(200).json(confession);
  } catch (err) {
    res.status(500).json({ message: 'Error al editar confesion', error: err.message });
  }
};

const togglePin = async (req, res) => {
  try {
    const { id } = req.params;
    const confession = await db.Confession.findByPk(id);
    if (!confession) {
      return res.status(404).json({ message: 'Confesion no encontrada.' });
    }
    if (req.userId !== confession.userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'No autorizado.' });
    }
    if (req.userRole !== 'premium' && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Solo usuarios premium pueden fijar confesiones.' });
    }
    confession.isPinned = !confession.isPinned;
    await confession.save();
    res.status(200).json(confession);
  } catch (err) {
    res.status(500).json({ message: 'Error al cambiar pin', error: err.message });
  }
};

module.exports = { getAllConfessions, createConfession, deleteConfession, togglePin, updateConfession };
