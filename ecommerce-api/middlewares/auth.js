const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Asegurate que el path sea correcto

require('dotenv').config();

const verificarToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];

  if (!authHeader) {
    return res.status(401).json({ message: 'Acceso denegado. Token no proporcionado.' });
  }

  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : authHeader.trim();

  if (!token) {
    return res.status(401).json({ message: 'Acceso denegado. Token malformado.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto');

    // 🔥 Esta línea es fundamental
    req.usuario = await User.findById(decoded._id).select('-password');

    if (!req.usuario) {
      return res.status(401).json({ message: 'Usuario no encontrado.' });
    }

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
