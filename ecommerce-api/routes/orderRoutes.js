const express = require('express');
const router = express.Router();
const {
  crearPedido,
  misPedidos,
  obtenerTodos,
  cambiarEstado,
  eliminarPedido 
} = require('../controllers/orderController');

const verificarToken = require('../middlewares/auth');
const verificarRol = require('../middlewares/verificarRol');

// Cliente
router.post('/', verificarToken, crearPedido);
router.get('/mis-pedidos', verificarToken, misPedidos);
router.delete('/mis-pedidos/:id', verificarToken, eliminarPedido); 

// Admin
router.get('/', verificarToken, verificarRol('admin'), obtenerTodos);
router.put('/:id', verificarToken, verificarRol('admin'), cambiarEstado);

module.exports = router;
