const db = require('../models');
const { Op, fn, col, literal } = require('sequelize');

async function getTopConfessionId(model, extraWhere, startDate) {
  const rows = await model.findAll({
    attributes: ['confessionId', [fn('COUNT', col('id')), 'count']],
    where: { ...extraWhere, createdAt: { [Op.gte]: startDate } },
    group: ['confessionId'],
    order: [[literal('count'), 'DESC']],
    limit: 1,
    raw: true,
  });
  if (rows.length === 0) return null;
  const row = rows[0];
  const confession = await db.Confession.findByPk(row.confessionId, {
    attributes: ['id', 'body', 'displayName'],
  });
  return {
    id: row.confessionId,
    count: row.count,
    confession: confession ? { body: confession.body?.slice(0, 80), displayName: confession.displayName } : null,
  };
}

const getStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [
      postsToday,
      postsThisMonth,
      postsThisYear,
      reportsPending,
      reportsToday,
      reportsThisMonth,
      bannedThisMonth,
    ] = await Promise.all([
      db.Confession.count({ where: { createdAt: { [Op.gte]: startOfDay } } }),
      db.Confession.count({ where: { createdAt: { [Op.gte]: startOfMonth } } }),
      db.Confession.count({ where: { createdAt: { [Op.gte]: startOfYear } } }),
      db.Report.count({ where: { status: 'pending' } }),
      db.Report.count({ where: { createdAt: { [Op.gte]: startOfDay } } }),
      db.Report.count({ where: { createdAt: { [Op.gte]: startOfMonth } } }),
      db.User.count({ where: { isBanned: true, updatedAt: { [Op.gte]: startOfMonth } } }),
    ]);

    const [
      mostLikedToday,
      mostCommentedToday,
      mostLikedMonth,
      mostCommentedMonth,
      mostLikedYear,
      mostCommentedYear,
    ] = await Promise.all([
      getTopConfessionId(db.Interaction, { type: 'like' }, startOfDay),
      getTopConfessionId(db.Comment, {}, startOfDay),
      getTopConfessionId(db.Interaction, { type: 'like' }, startOfMonth),
      getTopConfessionId(db.Comment, {}, startOfMonth),
      getTopConfessionId(db.Interaction, { type: 'like' }, startOfYear),
      getTopConfessionId(db.Comment, {}, startOfYear),
    ]);

    res.status(200).json({
      postsToday,
      postsThisMonth,
      postsThisYear,
      reportsPending,
      reportsToday,
      reportsThisMonth,
      bannedThisMonth,
      mostLikedToday,
      mostCommentedToday,
      mostLikedMonth,
      mostCommentedMonth,
      mostLikedYear,
      mostCommentedYear,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener estadisticas', error: err.message });
  }
};

module.exports = { getStats };
