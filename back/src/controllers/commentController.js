const db = require('../models');

const getComments = async (req, res) => {
  try {
    const { id } = req.params;
    const confession = await db.Confession.findByPk(id);
    if (!confession) {
      return res.status(404).json({ message: 'Confesion no encontrada.' });
    }
    const comments = await db.Comment.findAll({
      where: { confessionId: id },
      order: [['createdAt', 'ASC']],
      raw: true,
    });
    const tree = buildTree(comments);
    res.status(200).json(tree);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener comentarios', error: err.message });
  }
};

function buildTree(comments) {
  const map = {};
  const roots = [];
  for (const c of comments) {
    map[c.id] = { ...c, replies: [] };
  }
  for (const c of comments) {
    if (c.parentId && map[c.parentId]) {
      map[c.parentId].replies.push(map[c.id]);
    } else if (!c.parentId) {
      roots.push(map[c.id]);
    }
  }
  return roots;
}

const createComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { body, parentId } = req.body;
    const confession = await db.Confession.findByPk(id);
    if (!confession) {
      return res.status(404).json({ message: 'Confesion no encontrada.' });
    }
    if (!body || body.trim().length < 1) {
      return res.status(400).json({ message: 'El comentario no puede estar vacio.' });
    }
    if (body.length > 1000) {
      return res.status(400).json({ message: 'Maximo 1000 caracteres.' });
    }
    if (parentId) {
      const parent = await db.Comment.findByPk(parentId);
      if (!parent) {
        return res.status(404).json({ message: 'Comentario padre no encontrado.' });
      }
      if (parent.confessionId !== id) {
        return res.status(400).json({ message: 'El comentario padre no pertenece a esta confesion.' });
      }
    }
    const user = await db.User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }
    const comment = await db.Comment.create({
      confessionId: id,
      parentId: parentId || null,
      userId: user.id,
      displayName: user.displayName,
      handle: user.handle,
      body: body.trim(),
    });
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: 'Error al crear comentario', error: err.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const comment = await db.Comment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comentario no encontrado.' });
    }
    if (comment.userId !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'No tienes permiso para eliminar este comentario.' });
    }
    await comment.destroy();
    res.status(200).json({ message: 'Comentario eliminado.' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar comentario', error: err.message });
  }
};

module.exports = { getComments, createComment, deleteComment };
