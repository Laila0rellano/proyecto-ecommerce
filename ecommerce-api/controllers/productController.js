const Product = require('../models/Product');

// Crear producto (solo admin)
exports.crearProducto = async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock, imagen } = req.body;

    // Validar campos obligatorios
    if (!nombre || precio == null || stock == null) {
      return res.status(400).json({ message: 'Nombre, precio y stock son obligatorios.' });
    }

    // Validar tipos básicos
    if (typeof nombre !== 'string' || typeof precio !== 'number' || typeof stock !== 'number') {
      return res.status(400).json({ message: 'Datos inválidos para nombre, precio o stock.' });
    }

    // Validar valores positivos o cero
    if (precio < 0 || stock < 0) {
      return res.status(400).json({ message: 'Precio y stock deben ser números positivos o cero.' });
    }

    const nuevoProducto = new Product({ nombre, descripcion, precio, stock, imagen });
    await nuevoProducto.save();

    res.status(201).json(nuevoProducto);
  } catch (err) {
    res.status(500).json({ message: 'Error al crear producto.', error: err.message });
  }
};

// Actualizar producto (solo admin)
exports.actualizarProducto = async (req, res) => {
  try {
    const { precio, stock } = req.body;

    if ((precio != null && precio < 0) || (stock != null && stock < 0)) {
      return res.status(400).json({ message: 'Precio y stock deben ser números positivos o cero.' });
    }

    const productoActualizado = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!productoActualizado) {
      return res.status(404).json({ message: 'Producto no encontrado.' });
    }
    res.json(productoActualizado);
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar el producto.', error: err.message });
  }
};

// Eliminar producto (solo admin)
exports.eliminarProducto = async (req, res) => {
  try {
    const eliminado = await Product.findByIdAndDelete(req.params.id);
    if (!eliminado) {
      return res.status(404).json({ message: 'Producto no encontrado.' });
    }
    res.json({ message: 'Producto eliminado correctamente.' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar el producto.', error: err.message });
  }
};

// Obtener todos los productos
exports.obtenerProductos = async (req, res) => {
  try {
    const productos = await Product.find();
    res.json(productos);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener productos.', error: err.message });
  }
};

// Obtener producto por ID
exports.obtenerProductoPorId = async (req, res) => {
  try {
    const producto = await Product.findById(req.params.id);
    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado.' });
    }
    res.json(producto);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener el producto.', error: err.message });
  }
};

