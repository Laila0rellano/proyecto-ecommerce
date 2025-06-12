const verificarRol = (rolesPermitidos) => {
  // Si llega un string, lo convierto en array
  if (typeof rolesPermitidos === 'string') {
    rolesPermitidos = [rolesPermitidos];
  }

  return (req, res, next) => {
    if (!req.usuario || !req.usuario.rol) {
      return res.status(401).json({ message: 'No autenticado. Token requerido.' });
    }

    const rolUsuario = req.usuario.rol;

    if (!rolesPermitidos.includes(rolUsuario)) {
      return res.status(403).json({ message: 'Acceso denegado. No tienes permisos suficientes.' });
    }

    next();
  };
};

module.exports = verificarRol;
