const Order = require('../models/Order');
const Product = require('../models/Product');

// Crear pedido
exports.crearPedido = async (req, res) => {
  try {
    const { productos } = req.body;
    if (!productos || !Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ message: 'El pedido debe tener al menos un producto.' });
    }

    let total = 0;

    // Verificar stock y calcular total
    for (const item of productos) {
      // Validar estructura del item
      if (!item.producto || !item.cantidad || item.cantidad <= 0) {
        return res.status(400).json({ message: 'Cada producto debe tener un id válido y cantidad mayor a 0.' });
      }

      const prod = await Product.findById(item.producto);
      if (!prod) {
        return res.status(404).json({ message: `Producto no encontrado: ${item.producto}` });
      }

      if (prod.stock < item.cantidad) {
        return res.status(400).json({ message: `Stock insuficiente para el producto: ${prod.nombre}` });
      }

      total += prod.precio * item.cantidad;
    }

    // Descontar stock
    for (const item of productos) {
      await Product.findByIdAndUpdate(item.producto, {
        $inc: { stock: -item.cantidad }
      });
    }

    // Crear pedido
    const nuevoPedido = new Order({
      usuario: req.usuario._id,  // req.usuario debe estar definido (middleware autenticación)
      productos,
      total
    });

    await nuevoPedido.save();
    res.status(201).json(nuevoPedido);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el pedido.', error: error.message });
  }
};

// Ver historial de pedidos del usuario
exports.misPedidos = async (req, res) => {
  try {
    const pedidos = await Order.find({ usuario: req.usuario._id })
      .populate('productos.producto');
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener tus pedidos.', error: error.message });
  }
};

// Ver todos los pedidos (solo admin)
exports.obtenerTodos = async (req, res) => {
  try {
    const pedidos = await Order.find()
      .populate('usuario', 'nombre email') 
      .populate('productos.producto');
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener pedidos.', error: error.message });
  }
};

// Cambiar estado del pedido
exports.cambiarEstado = async (req, res) => {
  try {
    const { estado } = req.body;
    const estadosPermitidos = ['pendiente', 'enviado', 'cancelado'];
    if (!estadosPermitidos.includes(estado)) {
      return res.status(400).json({ message: 'Estado inválido.' });
    }

    const pedido = await Order.findById(req.params.id).populate('productos.producto');
    if (!pedido) {
      return res.status(404).json({ message: 'Pedido no encontrado.' });
    }

    // Si el pedido no estaba cancelado y ahora se cancela, devolver stock
    if (pedido.estado !== 'cancelado' && estado === 'cancelado') {
      for (const item of pedido.productos) {
        await Product.findByIdAndUpdate(item.producto._id, { $inc: { stock: item.cantidad } });
      }
    }

    pedido.estado = estado;
    await pedido.save();

    res.json(pedido);
  } catch (error) {
    res.status(500).json({ message: 'Error al cambiar el estado del pedido.', error: error.message });
  }
};
