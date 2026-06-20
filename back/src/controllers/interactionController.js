const db = require('../models');
const { Op } = require('sequelize');

const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const confession = await db.Confession.findByPk(id);
    if (!confession) {
      return res.status(404).json({ message: 'Confesion no encontrada.' });
    }
    const existing = await db.Interaction.findOne({
      where: { confessionId: id, userId: req.userId, type: 'like' },
    });
    if (existing) {
      await existing.destroy();
      return res.status(200).json({ liked: false });
    }
    await db.Interaction.create({ confessionId: id, userId: req.userId, type: 'like' });
    res.status(201).json({ liked: true });
  } catch (err) {
    res.status(500).json({ message: 'Error al procesar like', error: err.message });
  }
};

const toggleRepost = async (req, res) => {
  try {
    const { id } = req.params;
    const confession = await db.Confession.findByPk(id);
    if (!confession) {
      return res.status(404).json({ message: 'Confesion no encontrada.' });
    }
    const existing = await db.Interaction.findOne({
      where: { confessionId: id, userId: req.userId, type: 'repost' },
    });
    if (existing) {
      await existing.destroy();
      return res.status(200).json({ reposted: false });
    }
    await db.Interaction.create({ confessionId: id, userId: req.userId, type: 'repost' });
    res.status(201).json({ reposted: true });
  } catch (err) {
    res.status(500).json({ message: 'Error al procesar repost', error: err.message });
  }
};

const getBatchInteractions = async (req, res) => {
  try {
    const { ids } = req.query;
    const userId = req.query.userId || req.userId;
    if (!ids) {
      return res.status(400).json({ message: 'Se requieren ids de confesiones.' });
    }
    const idList = ids.split(',').map((s) => s.trim()).filter(Boolean);
    if (idList.length === 0) {
      return res.status(400).json({ message: 'Lista de ids vacia.' });
    }
    const interactions = await db.Interaction.findAll({
      where: { confessionId: { [Op.in]: idList } },
    });
    const commentCounts = await db.Comment.findAll({
      attributes: [
        'confessionId',
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count'],
      ],
      where: { confessionId: { [Op.in]: idList } },
      group: ['confessionId'],
      raw: true,
    });
    const commentMap = {};
    for (const row of commentCounts) {
      commentMap[row.confessionId] = parseInt(row.count, 10);
    }
    const out = {};
    for (const cid of idList) {
      const likes = interactions.filter((i) => i.confessionId === cid && i.type === 'like');
      const reposts = interactions.filter((i) => i.confessionId === cid && i.type === 'repost');
      out[cid] = {
        likeCount: likes.length,
        repostCount: reposts.length,
        commentCount: commentMap[cid] || 0,
        liked: userId ? likes.some((i) => i.userId === userId) : false,
        reposted: userId ? reposts.some((i) => i.userId === userId) : false,
      };
    }
    res.status(200).json(out);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener interacciones', error: err.message });
  }
};

module.exports = { toggleLike, toggleRepost, getBatchInteractions };
