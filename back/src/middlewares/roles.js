function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.userRole) {
      return res.status(403).json({ message: 'Acceso denegado.' });
    }
    if (!allowedRoles.includes(req.userRole)) {
      return res.status(403).json({ message: 'No tienes permisos para esta accion.' });
    }
    next();
  };
}

module.exports = { authorize };
