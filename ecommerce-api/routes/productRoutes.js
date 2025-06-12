const express = require('express');
const router = express.Router();

const {
  crearProducto,
  obtenerProductos,
  obtenerProductoPorId,
  actualizarProducto,
  eliminarProducto
} = require('../controllers/productController');

const verificarToken = require('../middlewares/auth');
const verificarRol = require('../middlewares/verificarRol');

// Rutas públicas
router.get('/', obtenerProductos);
router.get('/:id', obtenerProductoPorId);

// Rutas protegidas solo para admin
router.post('/', verificarToken, verificarRol(['admin']), crearProducto);
router.put('/:id', verificarToken, verificarRol(['admin']), actualizarProducto);
router.delete('/:id', verificarToken, verificarRol(['admin']), eliminarProducto);

module.exports = router;
