const jwt = require('jsonwebtoken');
require('dotenv').config();

const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];

  if (!authHeader) {
    return res.status(401).json({ message: 'Acceso denegado. Token no proporcionado.' });
  }

  // Formato esperado: "Bearer <token>"
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : authHeader.trim();

  if (!token) {
    return res.status(401).json({ message: 'Acceso denegado. Token malformado.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto');
    req.usuario = decoded;
    next();
  } catch (error) {
    const message =
      error.name === 'TokenExpiredError'
        ? 'Token expirado.'
        : 'Token inválido.';
    return res.status(401).json({ message });
  }
};

module.exports = verificarToken;
