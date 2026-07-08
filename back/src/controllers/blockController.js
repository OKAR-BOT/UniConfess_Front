const db = require('../models');

const blockUser = async (req, res) => {
  try {
    const { blockedId } = req.body;
    if (!blockedId) {
      return res.status(400).json({ message: 'blockedId es requerido.' });
    }
    if (req.userId === blockedId) {
      return res.status(400).json({ message: 'No puedes bloquearte a ti mismo.' });
    }
    const blockedUser = await db.User.findByPk(blockedId);
    if (!blockedUser) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }
    const [block, created] = await db.Block.findOrCreate({
      where: { blockerId: req.userId, blockedId },
      defaults: { blockerId: req.userId, blockedId },
    });
    if (!created) {
      return res.status(409).json({ message: 'Ya bloqueaste a este usuario.' });
    }
    res.status(201).json({ message: 'Usuario bloqueado.', block });
  } catch (err) {
    res.status(500).json({ message: 'Error al bloquear usuario', error: err.message });
  }
};

const unblockUser = async (req, res) => {
  try {
    const { blockedId } = req.params;
    const deleted = await db.Block.destroy({
      where: { blockerId: req.userId, blockedId },
    });
    if (!deleted) {
      return res.status(404).json({ message: 'No habias bloqueado a este usuario.' });
    }
    res.status(200).json({ message: 'Usuario desbloqueado.' });
  } catch (err) {
    res.status(500).json({ message: 'Error al desbloquear usuario', error: err.message });
  }
};

const getBlockedUsers = async (req, res) => {
  try {
    const blocks = await db.Block.findAll({
      where: { blockerId: req.userId },
      include: [{ model: db.User, as: 'blocked', attributes: ['id', 'displayName', 'handle', 'avatarUrl'] }],
    });
    res.status(200).json(blocks.map((b) => b.blocked));
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener bloqueados', error: err.message });
  }
};

module.exports = { blockUser, unblockUser, getBlockedUsers };
