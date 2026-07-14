const db = require('../models');

const createReport = async (req, res) => {
  try {
    const { reportedUserId, confessionId, reason } = req.body;
    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({ message: 'La razon debe tener al menos 10 caracteres.' });
    }
    if (!reportedUserId && !confessionId) {
      return res.status(400).json({ message: 'Debes especificar un usuario o una confesion reportada.' });
    }
    const report = await db.Report.create({
      reporterId: req.userId,
      reportedUserId: reportedUserId || null,
      confessionId: confessionId || null,
      reason: reason.trim(),
    });
    res.status(201).json({ message: 'Reporte enviado. Un administrador lo revisara.', report });
  } catch (err) {
    res.status(500).json({ message: 'Error al crear reporte', error: err.message });
  }
};

const getReports = async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Solo administradores pueden ver reportes.' });
    }
    const reports = await db.Report.findAll({
      order: [['createdAt', 'DESC']],
      include: [
        { model: db.User, as: 'reporter', attributes: ['id', 'displayName', 'handle'] },
        { model: db.User, as: 'reportedUser', attributes: ['id', 'displayName', 'handle', 'reportStrikes'] },
        { model: db.User, as: 'reviewer', attributes: ['id', 'displayName', 'handle'] },
      ],
    });
    res.status(200).json(reports);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener reportes', error: err.message });
  }
};

const reviewReport = async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Solo administradores pueden revisar reportes.' });
    }
    const { id } = req.params;
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Estado debe ser approved o rejected.' });
    }
    const report = await db.Report.findByPk(id);
    if (!report) {
      return res.status(404).json({ message: 'Reporte no encontrado.' });
    }
    report.status = status;
    report.reviewedBy = req.userId;
    await report.save();

    if (status === 'approved') {
      if (report.confessionId) {
        await db.Confession.destroy({ where: { id: report.confessionId } });
      }
      if (report.reportedUserId) {
        const reportedUser = await db.User.findByPk(report.reportedUserId);
        if (reportedUser) {
          reportedUser.reportStrikes = (reportedUser.reportStrikes || 0) + 1;
          if (reportedUser.reportStrikes >= 10) {
            reportedUser.isBanned = true;
          }
          await reportedUser.save();
        }
      }
    }

    res.status(200).json({ message: `Reporte ${status === 'approved' ? 'aprobado' : 'rechazado'}.`, report });
  } catch (err) {
    res.status(500).json({ message: 'Error al revisar reporte', error: err.message });
  }
};

module.exports = { createReport, getReports, reviewReport };
