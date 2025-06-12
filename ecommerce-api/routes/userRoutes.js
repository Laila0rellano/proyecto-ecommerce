const express = require('express');
const router = express.Router();

const { registrar, login } = require('../controllers/userController');
const verificarToken = require('../middlewares/auth');
const verificarRol = require('../middlewares/verificarRol');

// Rutas públicas
router.post('/register', registrar);
router.post('/login', login);

// Ruta protegida: perfil visible para cualquier usuario autenticado
router.get('/perfil', verificarToken, (req, res) => {
  res.json({ message: `Hola ${req.usuario.nombre}, este es tu perfil.` });
});

// Ruta protegida solo para admin
router.get('/admin', verificarToken, verificarRol(['admin']), (req, res) => {
  res.json({ message: `Bienvenido administrador ${req.usuario.nombre}` });
});

module.exports = router;
